// Simple in-memory wallet engine for the demo app.
// All functions are pure and return new wallet objects.

export const TX_TYPES = {
  HOLD: 'hold',
  RELEASE: 'release',
  PAYOUT: 'payout',
  REFUND: 'refund',
  FEE: 'fee',
};

export function createWallet({ availableBalance = 0, escrowBalance = 0, transactions = [] } = {}) {
  return {
    availableBalance,
    escrowBalance,
    transactions,
  };
}

function addTx(wallet, type, amount, meta = {}) {
  const tx = {
    id: `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    amount,
    label: meta.label || '',
    date: meta.date || 'щойно',
    meta,
  };
  return {
    ...wallet,
    transactions: [tx, ...(wallet.transactions || [])],
  };
}

export function holdFunds(wallet, amount, meta = {}) {
  if (amount <= 0) return wallet;
  if (wallet.availableBalance < amount) {
    throw new Error('Insufficient available balance to hold funds.');
  }
  let next = {
    ...wallet,
    availableBalance: wallet.availableBalance - amount,
    escrowBalance: wallet.escrowBalance + amount,
  };
  next = addTx(next, TX_TYPES.HOLD, amount, meta);
  return next;
}

export function releaseFunds(wallet, amount, meta = {}) {
  if (amount <= 0) return wallet;
  if (wallet.escrowBalance < amount) {
    throw new Error('Insufficient escrow balance to release funds.');
  }
  let next = {
    ...wallet,
    escrowBalance: wallet.escrowBalance - amount,
    availableBalance: wallet.availableBalance + amount,
  };
  next = addTx(next, TX_TYPES.RELEASE, amount, meta);
  return next;
}

export function payoutToUser(wallet, amount, meta = {}) {
  // For current user this means escrow → external (no change to availableBalance).
  if (amount <= 0) return wallet;
  if (wallet.escrowBalance < amount) {
    throw new Error('Insufficient escrow balance for payout.');
  }
  let next = {
    ...wallet,
    escrowBalance: wallet.escrowBalance - amount,
  };
  next = addTx(next, TX_TYPES.PAYOUT, amount, meta);
  return next;
}

export function refundToUser(wallet, amount, meta = {}) {
  // Escrow → back to available
  if (amount <= 0) return wallet;
  if (wallet.escrowBalance < amount) {
    throw new Error('Insufficient escrow balance for refund.');
  }
  let next = {
    ...wallet,
    escrowBalance: wallet.escrowBalance - amount,
    availableBalance: wallet.availableBalance + amount,
  };
  next = addTx(next, TX_TYPES.REFUND, amount, meta);
  return next;
}

export function applyFee(wallet, amount, meta = {}) {
  if (amount <= 0) return wallet;
  if (wallet.availableBalance < amount) {
    throw new Error('Insufficient available balance for fee.');
  }
  let next = {
    ...wallet,
    availableBalance: wallet.availableBalance - amount,
  };
  next = addTx(next, TX_TYPES.FEE, amount, meta);
  return next;
}

// --- Monobank (Monopay) integration helpers (mock) ---

// Creates a mock Monobank invoice. In real life this would be an HTTP POST to Monobank API.
// Description must stay neutral: we use "Information Services" phrasing only.
export function createMonopayInvoice(dealId, amount) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const transactionId = `mono-${dealId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const invoiceId = `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const description = `Information Services Invoice #${dealId}`;

  return {
    invoiceId,
    transactionId,
    amount: safeAmount,
    description,
    status: 'pending',
    payUrl: `https://monopay.mock/${invoiceId}`,
  };
}

// Handles a Monobank webhook (mock).
// We verify that the transactionId exists and wasn't already processed, and mark it as "escrow_locked".
export function handleWebhook(wallet, payload) {
  const { transactionId, status } = payload || {};
  if (!transactionId || status !== 'success') {
    return { wallet, updated: false };
  }

  const idx = (wallet.transactions || []).findIndex(
    (tx) => tx.meta && tx.meta.transactionId === transactionId
  );
  if (idx === -1) {
    // Unknown transaction — ignore to avoid double‑spend / spoofing.
    return { wallet, updated: false };
  }

  const existing = wallet.transactions[idx];
  if (existing.meta && existing.meta.paymentStatus === 'escrow_locked') {
    // Already processed.
    return { wallet, updated: false };
  }

  const updatedTx = {
    ...existing,
    meta: {
      ...(existing.meta || {}),
      paymentStatus: 'escrow_locked',
      transactionId,
    },
  };

  const updatedWallet = {
    ...wallet,
    transactions: [
      ...wallet.transactions.slice(0, idx),
      updatedTx,
      ...wallet.transactions.slice(idx + 1),
    ],
  };

  return { wallet: updatedWallet, updated: true, transaction: updatedTx };
}


