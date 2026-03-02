// Very simple reputation engine v1.
// score = completedDeals * 2 - disputes * 3 - volume / 1000
// Clamped to 0–5 and rounded to one decimal.

export function computeReputation({ completedDeals = 0, disputes = 0, volume = 0 } = {}) {
  let score = completedDeals * 2 - disputes * 3 - volume / 1000;
  if (Number.isNaN(score)) score = 0;
  score = Math.max(0, Math.min(5, score));
  return Number(score.toFixed(1));
}

