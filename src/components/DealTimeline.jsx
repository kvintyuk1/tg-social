import React from 'react';

const LABELS = {
  created: 'Створено',
  pending_approval: 'Очікує підтвердження',
  approved: 'Схвалено',
  scheduled: 'Заплановано',
  published: 'Опубліковано',
  completed: 'Завершено',
  dispute: 'Спір',
  resolved: 'Спір вирішено',
};

export function DealTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <div className="deal-timeline">
      {timeline.map((item, index) => (
        <div key={`${item.type}-${index}`} className="deal-timeline__item">
          <div className="deal-timeline__icon">
            <span className="deal-timeline__dot" />
            {index < timeline.length - 1 && <span className="deal-timeline__line" />}
          </div>
          <div className="deal-timeline__content">
            <div className="deal-timeline__label">{LABELS[item.type] || item.type}</div>
            <div className="deal-timeline__time">{item.at}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

