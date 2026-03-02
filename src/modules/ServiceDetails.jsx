import React from 'react';

export function ServiceDetails({ service, balance, onBack, onOrder, onGoToWallet }) {
  if (!service) return null;

  const canAfford = balance >= service.price;

  return (
    <section className="screen">
      <button type="button" className="link-back" onClick={onBack}>
        ← До послуг
      </button>

      <div className="author-row">
        <div
          className="avatar"
          style={{ backgroundColor: service.author.avatarColor }}
        >
          {service.author.username.charAt(1).toUpperCase()}
        </div>
        <div>
          <div className="author-row__name">{service.author.username}</div>
          <div className="author-row__meta">
            ⭐ {service.author.trustScore.toFixed(1)} · {service.author.completedDeals} угод
          </div>
        </div>
      </div>

      <h1 className="page-title">{service.title}</h1>
      <p className="page-desc">{service.description}</p>

      <div className="price-row">
        <span className="price-row__label">Ціна</span>
        <span className="price-row__value">{service.price} грн</span>
      </div>

      <div className="balance-hint">
        Ваш баланс: <strong>{balance} грн</strong>
      </div>

      {canAfford ? (
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => onOrder?.(service)}
        >
          Замовити за {service.price} грн
        </button>
      ) : (
        <div className="insufficient">
          <p>Недостатньо коштів. Поповніть гаманець.</p>
          <button type="button" className="btn btn--secondary" onClick={() => onGoToWallet?.()}>
            Поповнити гаманець
          </button>
        </div>
      )}
    </section>
  );
}
