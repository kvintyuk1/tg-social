const functions = require('firebase-functions');
const express = require('express');
const functions = require('firebase-functions');

// Reuse the wallet router logic from backend/routes/wallet.js but simplified for Functions.
// In a real refactor you'd share code via a common module; тут продублюємо мінімум.

// In-memory wallet store (demo)
const balances = new Map();
const processedTxIds = new Set();

async function getBalance(userId) {
  return balances.get(userId) ?? 0;
}

async function addTopup(userId, txId, amount) {
  if (!userId || !txId || !amount || amount <= 0) return false;
  if (processedTxIds.has(txId)) return false;
  processedTxIds.add(txId);
  const current = balances.get(userId) ?? 0;
  balances.set(userId, current + amount);
  return true;
}

// Monobank client (backend-only, token never exposed to frontend)
const MONO_API_BASE = 'https://api.monobank.ua';

const MONO_TOKEN = functions.config().mono.token;
const MONO_POLL_ACCOUNT_ID = functions.config().mono.account_id;

async function monoGet(path) {
  if (!MONO_TOKEN) {
    throw new Error('MONO_TOKEN is not configured in Functions env');
  }
  const res = await fetch(`${MONO_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'X-Token': MONO_TOKEN,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Monobank error ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchStatementLastHour(accountId) {
  const from = Math.floor(Date.now() / 1000) - 3600;
  const data = await monoGet(`/personal/statement/${accountId}/${from}`);
  if (!Array.isArray(data)) return [];
  return data.map((tx) => ({
    ...tx,
    amount: typeof tx.amount === 'number' ? tx.amount / 100 : tx.amount,
  }));
}

const app = express();
app.use(express.json());

// Simple auth stub: in real app use Firebase Auth / JWT.
function requireAuth(req, res, next) {
  // For beta: one demo user
  req.user = { id: 'u1' };
  next();
}

app.post('/wallet/monobank/poll', async (req, res) => {
  try {
    if (!MONO_POLL_ACCOUNT_ID) {
      return res.status(500).json({ error: 'MONO_POLL_ACCOUNT_ID not configured' });
    }

    const data = await fetchStatementLastHour(MONO_POLL_ACCOUNT_ID);
    const processed = [];

    for (const tx of data) {
      const comment = typeof tx.comment === 'string' ? tx.comment : '';
      const desc = typeof tx.description === 'string' ? tx.description : '';
      const hasMarker = comment.includes('TopUp_') || desc.includes('TopUp_');
      if (!hasMarker) continue;
      if (processedTxIds.has(tx.id)) continue;

      const userId = 'u1'; // TODO: decode from comment (TopUp_userId_timestamp)
      const amount = tx.amount || 0;
      const ok = await addTopup(userId, tx.id, amount);
      if (ok) {
        processed.push({ txId: tx.id, userId, amount });
      }
    }

    return res.json({ processed });
  } catch (e) {
    console.error('wallet/monobank/poll error', e);
    return res.status(500).json({ error: 'monobank poll failed' });
  }
});

app.get('/wallet/me', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const balance = await getBalance(userId);
  res.json({ balance });
});

exports.api = functions.https.onRequest(app);

