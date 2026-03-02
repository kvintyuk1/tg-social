// Service helpers for working with Monobank personal API (jar statement polling).
// NOTE: In a real production app this logic should live on the backend, not in the browser.

const MONO_API_BASE = 'https://api.monobank.ua';
const JAR_ID = '27wbRMyJHc';

// Checks jar statement for the last hour and looks for a transaction
// where comment === dealId. Uses REACT_APP_MONO_TOKEN for auth.
export async function verifyJarPayment(dealId) {
  if (!dealId) throw new Error('dealId is required');

  const token = process.env.REACT_APP_MONO_TOKEN;
  if (!token) {
    console.warn('REACT_APP_MONO_TOKEN is not configured');
    return false;
  }

  const from = Math.floor(Date.now() / 1000) - 3600;
  const url = `${MONO_API_BASE}/personal/statement/${JAR_ID}/${from}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Token': token,
    },
  });

  if (!res.ok) {
    console.error('Monobank API error', res.status);
    return false;
  }

  const data = await res.json();
  console.log('Monobank statement data for deal', dealId, data);

  if (!Array.isArray(data)) return false;

  const match = data.find((tx) => tx.comment === dealId);
  return !!match;
}

// Fetch full jar statement for last hour (for generic top-up detection).
export async function fetchJarStatementLastHour() {
  const token = process.env.REACT_APP_MONO_TOKEN;
  if (!token) {
    console.warn('REACT_APP_MONO_TOKEN is not configured');
    return [];
  }

  const from = Math.floor(Date.now() / 1000) - 3600;
  const url = `${MONO_API_BASE}/personal/statement/${JAR_ID}/${from}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Token': token,
    },
  });

  if (!res.ok) {
    console.error('Monobank API error (top-ups)', res.status);
    return [];
  }

  const data = await res.json();
  console.log('Monobank raw statement data (top-ups)', data);

  if (!Array.isArray(data)) return [];

  // Normalize amount from kopecks to UAH
  return data.map((tx) => ({
    ...tx,
    amount: typeof tx.amount === 'number' ? tx.amount / 100 : tx.amount,
  }));
}

