// Monobank personal API client.
// IMPORTANT: This must only run on the backend – never expose MONO_TOKEN to the frontend.

const MONO_API_BASE = 'https://api.monobank.ua';

const MONO_TOKEN = process.env.MONO_TOKEN;
if (!MONO_TOKEN) {
  // Do not crash in production, but log clearly during development.
  // eslint-disable-next-line no-console
  console.warn('MONO_TOKEN is not set. Monobank integration will not work.');
}

async function monoGet(path) {
  if (!MONO_TOKEN) {
    throw new Error('MONO_TOKEN is not configured on backend');
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

// 1) Once: get client info to pick accountId for polling (run from an admin-only endpoint or script).
export async function getClientInfo() {
  return monoGet('/personal/client-info');
}

// 2) Statement for given accountId for last hour.
export async function fetchStatementLastHour(accountId) {
  if (!accountId) {
    throw new Error('accountId is required for fetchStatementLastHour');
  }
  const from = Math.floor(Date.now() / 1000) - 3600;
  const data = await monoGet(`/personal/statement/${accountId}/${from}`);

  if (!Array.isArray(data)) return [];

  // Monobank returns amount in kopecks -> normalize to UAH
  return data.map((tx) => ({
    ...tx,
    amount: typeof tx.amount === 'number' ? tx.amount / 100 : tx.amount,
  }));
}

