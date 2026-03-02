export const MONO_CONFIG = {
  JAR_ID: '27wbRMyJHc',
  JAR_URL: 'https://send.monobank.ua/jar/27wbRMyJHc',
  CARD_NUMBER: '4874 1000 2554 8168',
  COMMISSION_RATE: 0.05, // 5% your earnings on top of base price
  MIN_COMMISSION: 10, // minimum 10 UAH
};

// Generate a Monobank jar payment link with neutral description via comment (dealId).
// basePrice is the underlying amount for the deal (e.g. 1000),
// total = basePrice + max(5%, 10 UAH) — what user actually pays.
export function generatePaymentLink(basePrice, dealId) {
  const safeBase = Math.max(0, Number(basePrice) || 0);
  const rawCommission = safeBase * MONO_CONFIG.COMMISSION_RATE;
  const commission = Math.max(MONO_CONFIG.MIN_COMMISSION, Math.round(rawCommission));
  const total = safeBase + commission;

  const amountParam = encodeURIComponent(Math.round(total));
  const commentParam = encodeURIComponent(dealId);

  return `${MONO_CONFIG.JAR_URL}?a=${amountParam}&c=${commentParam}`;
}

