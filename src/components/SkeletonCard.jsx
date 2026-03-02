import React from 'react';

export function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <div className="skeleton-card__header">
        <div className="skeleton-card__avatar skeleton-pulse" />
        <div className="skeleton-card__meta">
          <div className="skeleton-card__line skeleton-pulse" style={{ width: '70%' }} />
          <div className="skeleton-card__line skeleton-pulse" style={{ width: '50%' }} />
        </div>
      </div>
      <div className="skeleton-card__line skeleton-pulse" style={{ width: '90%' }} />
      <div className="skeleton-card__line skeleton-pulse" style={{ width: '60%' }} />
      <div className="skeleton-card__footer">
        <div className="skeleton-card__chip skeleton-pulse" />
        <div className="skeleton-card__chip skeleton-pulse" />
      </div>
    </article>
  );
}
