import React from 'react';

const TYPE_LABELS = {
  ad_approved: 'Рекламу схвалено',
  ad_rejected: 'Рекламу відхилено',
  deal_completed: 'Угоду завершено',
  deal_published: 'Рекламний пост опубліковано',
  dispute_opened: 'Відкрито спір',
};

export function NotificationsPanel({ open, notifications = [], onClose }) {
  return (
    <div className={`notifications ${open ? 'notifications--open' : ''}`}>
      <div className="notifications__header">
        <h3>Сповіщення</h3>
        <button type="button" className="ghost-button" onClick={onClose}>
          Закрити
        </button>
      </div>
      <div className="notifications__body">
        {notifications.length === 0 ? (
          <div className="notifications__empty">Поки що немає сповіщень.</div>
        ) : (
          <ul className="notifications__list">
            {notifications.map((n) => (
              <li key={n.id} className="notifications__item">
                <div className="notifications__title">
                  {TYPE_LABELS[n.type] || n.type}
                </div>
                {n.message && <div className="notifications__message">{n.message}</div>}
                <div className="notifications__time">{n.createdAt}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

