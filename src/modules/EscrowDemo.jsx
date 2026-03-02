import React, { useState } from 'react';

export function EscrowDemo({ deal, onUpdateDeal, onComplete, onDispute, onBack }) {
  const [workUrl, setWorkUrl] = useState(deal?.escrow?.workUrl || '');
  const [workComment, setWorkComment] = useState(deal?.escrow?.workComment || '');
  const [disputeText, setDisputeText] = useState('');

  if (!deal) {
    return (
      <section className="app-panel app-panel--deals">
        <div className="empty-state">Оберіть угоду в Центрі угод.</div>
      </section>
    );
  }

  const canSubmitWork = deal.status === 'active';
  const canAcceptOrDispute = deal.status === 'in_review';

  const handleSubmitWork = () => {
    if (!workUrl) return;
    onUpdateDeal?.(deal.id, {
      status: 'in_review',
      escrow: { ...(deal.escrow || {}), workUrl, workComment },
    });
  };

  const handleAccept = () => {
    onUpdateDeal?.(deal.id, {
      status: 'completed',
      escrow: {
        ...(deal.escrow || {}),
        resolution: 'Угоду успішно виконано. Кошти виплачені виконавцю.',
      },
    });
    onComplete?.(deal.id);
  };

  const handleDispute = () => {
    if (!disputeText) return;
    const buyerWins = Math.random() > 0.5;
    const resolution = buyerWins
      ? 'Спір вирішено на користь покупця. Кошти повернені.'
      : 'Спір вирішено на користь виконавця. Кошти виплачені виконавцю.';

    onUpdateDeal?.(deal.id, {
      status: 'dispute_resolved',
      escrow: { ...(deal.escrow || {}), disputeText, resolution },
    });
    onDispute?.(deal.id);
  };

  return (
    <>
      <section className="app-panel app-panel--primary">
        <button type="button" className="ghost-button task-details__back" onClick={onBack}>
          ← До угод
        </button>

        <h2 className="app-title">Safe Deal Escrow</h2>
        <p className="app-subtitle">
          Створення → Холд → Здача → Прийняття → Виплата. Ви зараз усередині угоди.
        </p>

        <div className="deal-card">
          <header className="deal-card__header">
            <h3>{deal.title}</h3>
            <span className="deal-amount">{deal.amount} грн</span>
          </header>
          <div className="deal-meta">
            <span>
              👤 Покупець: <strong>{deal.buyer}</strong>
            </span>
            <span>
              🧑‍💻 Виконавець: <strong>{deal.seller}</strong>
            </span>
          </div>
          <div className="deal-status">
            <span className="status-pill">{statusLabel(deal.status)}</span>
          </div>
        </div>
      </section>

      <section className="app-panel app-panel--deals">
        {(deal.escrow?.workUrl || deal.escrow?.workComment) && (
          <div className="deal-section">
            <div className="deal-section-title">Надіслана робота</div>
            {deal.escrow?.workUrl && (
              <a
                href={deal.escrow.workUrl}
                target="_blank"
                rel="noreferrer"
                className="deal-link"
              >
                Переглянути результат
              </a>
            )}
            {deal.escrow?.workComment && (
              <p className="deal-comment">{deal.escrow.workComment}</p>
            )}
          </div>
        )}

        {deal.escrow?.disputeText && (
          <div className="deal-section deal-section--dispute">
            <div className="deal-section-title">Опис спору</div>
            <p>{deal.escrow.disputeText}</p>
          </div>
        )}

        {deal.escrow?.resolution && (
          <div className="deal-section deal-section--resolution">
            <div className="deal-section-title">Рішення арбітражу</div>
            <p>{deal.escrow.resolution}</p>
          </div>
        )}

        <div className="deal-actions">
          {canSubmitWork && (
            <div className="deal-action-block">
              <div className="deal-section-title">Крок виконавця: здати роботу</div>
              <input
                type="url"
                placeholder="Посилання на файл / макет / репозиторій"
                value={workUrl}
                onChange={(e) => setWorkUrl(e.target.value)}
              />
              <textarea
                placeholder="Коментар для покупця (опціонально)"
                value={workComment}
                onChange={(e) => setWorkComment(e.target.value)}
                rows={2}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={handleSubmitWork}
              >
                Надіслати роботу
              </button>
            </div>
          )}

          {canAcceptOrDispute && (
            <div className="deal-action-block">
              <div className="deal-section-title">Крок покупця: прийняти чи відкрити спір</div>
              <div className="deal-action-buttons">
                <button
                  type="button"
                  className="primary-button primary-button--small"
                  onClick={handleAccept}
                >
                  Прийняти роботу
                </button>
              </div>

              <textarea
                placeholder="Якщо є проблема, опишіть її тут для арбітражу"
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                rows={2}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={handleDispute}
              >
                Відкрити спір і передати на швидке рішення
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function statusLabel(status) {
  switch (status) {
    case 'active':
      return 'Холд коштів: очікується робота від виконавця';
    case 'in_review':
      return 'Роботу надіслано: покупець приймає або відкриває спір';
    case 'completed':
      return 'Угоду завершено: кошти виплачені виконавцю';
    case 'dispute':
    case 'dispute_resolved':
      return 'Спір: очікується / прийнято рішення';
    default:
      return 'Статус невідомий';
  }
}


