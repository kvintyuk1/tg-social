// Simple in-memory wallet repository for demo.
// Replace with real DB (PostgreSQL, Mongo, etc.) in production.

const balances = new Map(); // userId -> number
const processedTxIds = new Set(); // txId -> true

export async function getBalance(userId) {
  return balances.get(userId) ?? 0;
}

export async function addTopup(userId, txId, amount) {
  if (!userId || !txId || !amount || amount <= 0) return false;
  if (processedTxIds.has(txId)) return false;

  processedTxIds.add(txId);
  const current = balances.get(userId) ?? 0;
  balances.set(userId, current + amount);
  return true;
}

export async function hasProcessed(txId) {
  return processedTxIds.has(txId);
}

