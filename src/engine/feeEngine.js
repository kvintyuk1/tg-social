// Simple fee engine for marketplace commission.
// Existing helper: 5% fee, minimum 10 UAH (for internal use).

export function calculateFee(amount) {
  if (!amount || amount <= 0) return 0;
  const fee = amount * 0.05;
  return Math.max(10, Math.round(fee));
}

// Monobank integration helpers:
//  - calculateTotalPayable: adds 2% banking fee on top of base amount
//  - calculateNetPayout: subtracts 5% platform service fee from base amount

export function calculateTotalPayable(baseAmount) {
  if (!baseAmount || baseAmount <= 0) return 0;
  const gatewayFee = Math.round(baseAmount * 0.02);
  return baseAmount + gatewayFee;
}

export function calculateNetPayout(baseAmount) {
  if (!baseAmount || baseAmount <= 0) return 0;
  const platformFee = Math.round(baseAmount * 0.05);
  return Math.max(0, baseAmount - platformFee);
}


