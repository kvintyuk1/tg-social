import express from 'express';
import { fetchStatementLastHour } from '../services/monobankClient.js';
import { addTopup, hasProcessed, getBalance } from '../db/walletRepo.js';

const router = express.Router();

// Dummy auth middleware – replace with proper JWT/session auth.
function requireAuth(req, res, next) {
  // In real app, userId comes from verified token/session.
  // For demo we hardcode current user.
  req.user = { id: 'u1' };
  next();
}

// Cron/worker endpoint to poll Monobank and credit top-ups.
router.post('/wallet/monobank/poll', async (req, res) => {
  try {
    const accountId = process.env.MONO_POLL_ACCOUNT_ID;
    if (!accountId) {
      return res.status(500).json({ error: 'MONO_POLL_ACCOUNT_ID is not configured' });
    }

    const data = await fetchStatementLastHour(accountId);
    const processed = [];

    for (const tx of data) {
      const comment = typeof tx.comment === 'string' ? tx.comment : '';
      const desc = typeof tx.description === 'string' ? tx.description : '';
      const hasMarker = comment.includes('TopUp_') || desc.includes('TopUp_');
      if (!hasMarker) continue;

      if (await hasProcessed(tx.id)) continue;

      // In production you should encode userId into comment like "TopUp_userId_timestamp"
      // and extract it here. For demo we credit user "u1".
      const userId = 'u1';
      const amount = tx.amount || 0;

      const ok = await addTopup(userId, tx.id, amount);
      if (ok) {
        processed.push({ txId: tx.id, userId, amount });
      }
    }

    return res.json({ processed });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('wallet/monobank/poll error', e);
    return res.status(500).json({ error: 'monobank poll failed' });
  }
});

// Returns current authenticated user's balance.
router.get('/wallet/me', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const balance = await getBalance(userId);
  res.json({ balance });
});

export default router;

