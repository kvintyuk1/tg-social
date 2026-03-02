import React, { useState } from 'react';

const SAFE_DEAL_TABS = [
  { id: 'active', label: 'Активні' },
  { id: 'in_review', label: 'На перевірці' },
  { id: 'completed', label: 'Завершені' },
  { id: 'disputes', label: 'Спори' },
];

const AD_DEAL_TABS = [
  { id: 'pending_approval', label: 'Очікують підтвердження' },
  { id: 'scheduled', label: 'Заплановані' },
  { id: 'published', label: 'Опубліковані' },
  { id: 'completed', label: 'Завершені' },
  { id: 'dispute', label: 'Спори' },
];

export function DealsCenter({ deals, adDeals = [], onOpenDeal, onOpenAdDeal }) {
  const [mode, setMode] = useState('safe'); // safe | ads
  const [activeFilter, setActiveFilter] = useState('active');

  const tabs = mode === 'safe' ? SAFE_DEAL_TABS : AD_DEAL_TABS;

  const filteredSafe = deals.filter((deal) => {
    switch (activeFilter) {
      case 'active':
        return deal.status === 'active';
      case 'in_review':
        return deal.status === 'in_review';
      case 'completed':
        return deal.status === 'completed';
      case 'disputes':
        return deal.status === 'dispute' || deal.status === 'dispute_resolved';
      default:
        return true;
    }
  });

  const filteredAds = adDeals.filter((deal) => {
    switch (activeFilter) {
      case 'pending_approval':
        return deal.status === 'pending_approval';
      case 'scheduled':
        return deal.status === 'scheduled' || deal.status === 'approved';
      case 'published':
        return deal.status === 'published';
      case 'completed':
        return deal.status === 'completed';
      case 'dispute':
        return deal.status === 'dispute';
      default:
        return true;
    }
  });

  const hasItems = mode === 'safe' ? filteredSafe.length > 0 : filteredAds.length > 0;

  return (
    <section className="app-panel app-panel--list">
      <div className="deals-header">
        <h2>Центр угод</h2>
        <p>Safe Deal escrow для задач і рекламних розміщень.</p>
      </div>

      <div className="tabs-inline" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`tabs-inline__item ${mode === 'safe' ? 'tabs-inline__item--active' : ''}`}
          onClick={() => {
            setMode('safe');
            setActiveFilter('active');
          }}
        >
          Угоди
        </button>
        <button
          type="button"
          className={`tabs-inline__item ${mode === 'ads' ? 'tabs-inline__item--active' : ''}`}
          onClick={() => {
            setMode('ads');
            setActiveFilter(mode === 'ads' ? activeFilter : 'pending_approval');
          }}
        >
          Реклама
        </button>
      </div>

      <div className="deals-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`deals-tabs__item ${
              activeFilter === tab.id ? 'deals-tabs__item--active' : ''
            }`}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!hasItems && (
        <div className="empty-state">
          {mode === 'safe'
            ? 'Поки що немає угод у цій категорії. Створіть задачу та запустіть Safe Deal.'
            : 'Поки що немає рекламних угод у цій категорії. Оберіть канал та надішліть запит на рекламу.'}
        </div>
      )}

      <div className="deals-list">
        {mode === 'safe' &&
          filteredSafe.map((deal) => (
            <article key={deal.id} className="deal-list-item">
              <div>
                <div className="deal-list-item__title">{deal.title}</div>
                <div className="deal-list-item__meta">
                  <span>{deal.amount} грн</span>
                  <span>{deal.createdAtLabel}</span>
                </div>
              </div>
              <div className="deal-list-item__right">
                <span className={`status-pill status-pill--${deal.status}`}>
                  {statusLabel(deal.status)}
                </span>
                <button
                  type="button"
                  className="secondary-button primary-button--small"
                  onClick={() => onOpenDeal?.(deal)}
                >
                  Відкрити
                </button>
              </div>
            </article>
          ))}

        {mode === 'ads' &&
          filteredAds.map((deal) => (
            <article key={deal.id} className="deal-list-item">
              <div>
                <div className="deal-list-item__title">{deal.title}</div>
                <div className="deal-list-item__meta">
                  <span>{deal.escrowAmount} грн</span>
                  <span>{deal.scheduledAt}</span>
                </div>
              </div>
              <div className="deal-list-item__right">
                <span className={`status-pill status-pill--${deal.status}`}>
                  {adStatusLabel(deal.status)}
                </span>
                <button
                  type="button"
                  className="secondary-button primary-button--small"
                  onClick={() => onOpenAdDeal?.(deal)}
                >
                  Відкрити
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

function statusLabel(status) {
  switch (status) {
    case 'active':
      return 'Активна';
    case 'in_review':
      return 'На перевірці';
    case 'completed':
      return 'Завершена';
    case 'dispute':
      return 'У спорі';
    case 'dispute_resolved':
      return 'Спір вирішено';
    default:
      return 'Невідомо';
  }
}

function adStatusLabel(status) {
  switch (status) {
    case 'pending_approval':
      return 'Очікує підтвердження';
    case 'approved':
      return 'Підтверджена';
    case 'scheduled':
      return 'Запланована';
    case 'published':
      return 'Опублікована';
    case 'completed':
      return 'Завершена';
    case 'dispute':
      return 'У спорі';
    default:
      return 'Невідомо';
  }
}

