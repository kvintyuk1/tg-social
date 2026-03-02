export const AD_DEAL_STATUSES = {
  draft: ['pending_approval'],
  pending_approval: ['approved', 'rejected'],
  approved: ['scheduled'],
  scheduled: ['published'],
  published: ['completed', 'dispute'],
  dispute: ['resolved'],
  resolved: [],
};

export function canTransition(from, to) {
  if (!from || !to) return false;
  return AD_DEAL_STATUSES[from]?.includes(to) ?? false;
}

