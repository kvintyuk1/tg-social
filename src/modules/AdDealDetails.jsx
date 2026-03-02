import React, { useState } from 'react';
import { DealTimeline } from '../components/DealTimeline';
import { DealChat } from '../components/DealChat';
import { DealCheckout } from '../components/Deals/DealCheckout';

export function AdDealDetails({
  deal,
  creative,
  onBack,
  onPublish,
  onComplete,
  onDispute,
  onPayViaMonobank,
}) {
  const [postUrl, setPostUrl] = useState(deal?.postUrl || '');
  const [disputeText, setDisputeText] = useState('');

  if (!deal) {
    return (
      <section className="app-panel app-panel--deals">
        <div className="empty-state">Оберіть рекламну угоду в Центрі угод.</div>
      </section>
    );
  }

  const isAdvertiser = false; // роль можна додати через поточного користувача
  const canPublish = deal.status === 'approved' || deal.status === 'scheduled';
  const canComplete = deal.status === 'published';
  const canDispute = deal.status === 'published' || deal.status === 'scheduled';

  const handlePublish = () => {
    if (!postUrl) return;
    onPublish?.(deal.id, postUrl);
  };

  const handleComplete = () => {
    onComplete?.(deal.id);
  };

  const handleDispute = () => {
    if (!disputeText) return;
    onDispute?.(deal.id, disputeText);
  };

  return (
    <>
      <section className="app-panel app-panel--primary">
        <button type="button" className="ghost-button task-details__back" onClick={onBack}>
          ← До угод
        </button>

        <h2 className="app-title">Рекламна угода</h2>
        <p className="app-subtitle">
          Бронювання рекламного слоту в Telegram‑каналі з escrow холдом коштів до фактичної
          публікації.
        </p>

        <div className="deal-card">
          <header className="deal-card__header">
            <h3>{deal.title}</h3>
            <span className="deal-amount">{deal.escrowAmount} грн</span>
          </header>
          <div className="deal-meta">
            <span>
              📅 Заплановано: <strong>{deal.scheduledAt}</strong>
            </span>
            <span>
              💬 Статус: <strong>{adStatusLabel(deal.status)}</strong>
            </span>
          </div>
          <DealTimeline timeline={deal.timeline || []} />
        </div>
      </section>

      <section className="app-panel app-panel--deals">
        {creative && (
          <div className="deal-section">
            <div className="deal-section-title">Креатив</div>
            <h3 style={{ marginTop: 4, marginBottom: 8 }}>{creative.title}</h3>
            <p className="deal-comment">{creative.text}</p>
            {creative.ctaLink && (
              <a
                href={creative.ctaLink}
                target="_blank"
                rel="noreferrer"
                className="deal-link"
              >
                Перейти за посиланням
              </a>
            )}
          </div>
        )}

        {deal.postUrl && (
          <div className="deal-section">
            <div className="deal-section-title">Опублікований пост</div>
            <a
              href={deal.postUrl}
              target="_blank"
              rel="noreferrer"
              className="deal-link"
            >
              Відкрити пост у Telegram
            </a>
          </div>
        )}

        <DealCheckout
          baseAmount={deal.escrowAmount}
          dealId={deal.id}
          onPay={(base, total) =>
            onPayViaMonobank?.({
              dealId: deal.id,
              baseAmount: base,
              totalPayable: total,
            })
          }
        />

        <div className="deal-actions">
          {canPublish && (
            <div className="deal-action-block">
              <div className="deal-section-title">Крок власника каналу: відмітити публікацію</div>
              <input
                type="url"
                placeholder="Посилання на опублікований пост"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={handlePublish}
              >
                Відмітити як опубліковану
              </button>
            </div>
          )}

          {canComplete && (
            <div className="deal-action-block">
              <div className="deal-section-title">
                Крок рекламодавця: підтвердити розміщення та розморозити кошти
              </div>
              <button
                type="button"
                className="primary-button primary-button--small"
                onClick={handleComplete}
              >
                Підтвердити розміщення
              </button>
            </div>
          )}

          {canDispute && (
            <div className="deal-action-block">
              <div className="deal-section-title">Відкрити спір</div>
              <textarea
                placeholder="Опишіть проблему з розміщенням"
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                rows={2}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={handleDispute}
              >
                Відкрити спір
              </button>
            </div>
          )}
        </div>

        <DealChat
          messages={deal.messages || []}
          currentUserId={''}
          onSend={(text) => onDispute?.(deal.id, text)}
        />
      </section>
    </>
  );
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

