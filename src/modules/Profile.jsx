import React, { useState, useMemo } from 'react';
import { computeReputation } from '../engine/reputationEngine';

const DEAL_FILTERS = [
  { id: 'active', label: 'Активні' },
  { id: 'in_review', label: 'На перевірці' },
  { id: 'completed', label: 'Завершені' },
  { id: 'disputes', label: 'Спори' },
];

const TYPE_LABELS = {
  task: 'Задача',
  job: 'Робота',
  service: 'Сервіс',
  channel: 'Канал',
  ad: 'Реклама',
  opportunity: 'Можливість',
};

function statusLabel(status) {
  const map = {
    active: 'Активна',
    in_review: 'На перевірці',
    completed: 'Завершена',
    dispute: 'У спорі',
    dispute_resolved: 'Спір вирішено',
  };
  return map[status] || 'Невідомо';
}

function adStatusLabel(status) {
  const map = {
    pending_approval: 'Очікує підтвердження',
    approved: 'Підтверджена',
    scheduled: 'Запланована',
    published: 'Опублікована',
    completed: 'Завершена',
    dispute: 'У спорі',
  };
  return map[status] || 'Невідомо';
}

export function Profile({
  user,
  balance,
  deals,
  posts = [],
  adCreatives = [],
  adDeals = [],
  onOpenDeal,
  onOpenAdDeal,
  onCreateAdCreative,
  onGoToWallet,
  onGoToCreate,
}) {
  const [filter, setFilter] = useState('active');
  const [showCreativeForm, setShowCreativeForm] = useState(false);
  const [creativeForm, setCreativeForm] = useState({
    title: '',
    text: '',
    mediaUrl: '',
    ctaLink: '',
    status: 'draft',
  });

  const myDeals = deals.filter((d) => {
    if (filter === 'active') return d.status === 'active';
    if (filter === 'in_review') return d.status === 'in_review';
    if (filter === 'completed') return d.status === 'completed';
    if (filter === 'disputes') return d.status === 'dispute' || d.status === 'dispute_resolved';
    return true;
  });

  const myPosts = posts.filter((p) => p.author?.username === user.username);
  const myCreatives = adCreatives.filter((c) => c.authorId === user.username);
  const myAdAsAdvertiser = adDeals.filter((d) => d.advertiserId === user.username);
  const myAdAsChannelOwner = adDeals.filter((d) => d.channelOwnerId === user.username);
  const completed = deals.filter((d) => d.status === 'completed').length;

  const handleCreativeChange = (e) => {
    const { name, value } = e.target;
    setCreativeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreativeSubmit = (e) => {
    e.preventDefault();
    if (!creativeForm.title || !creativeForm.text) return;
    onCreateAdCreative?.(creativeForm);
    setCreativeForm({
      title: '',
      text: '',
      mediaUrl: '',
      ctaLink: '',
      status: 'draft',
    });
    setShowCreativeForm(false);
  };

  const disputesCount = useMemo(
    () => deals.filter((d) => d.status === 'dispute' || d.status === 'dispute_resolved').length,
    [deals]
  );

  const totalVolume = useMemo(
    () =>
      deals
        .filter((d) => d.seller === user?.username)
        .reduce((sum, d) => sum + (d.amount || 0), 0) +
      adDeals
        .filter((d) => d.channelOwnerId === user?.username)
        .reduce((sum, d) => sum + (d.escrowAmount || 0), 0),
    [deals, adDeals, user?.username]
  );

  const dynamicScore = computeReputation({
    completedDeals: completed,
    disputes: disputesCount,
    volume: totalVolume,
  });

  if (!user) return null;

  return (
    <section className="screen profile-screen">
      <div className="profile-hero">
        <div className="avatar avatar--lg" style={{ backgroundColor: user.avatarColor }}>
          {user.username.charAt(1).toUpperCase()}
        </div>
        <div className="profile-hero__info">
          <div className="profile-hero__name">{user.name}</div>
          <div className="profile-hero__meta">
            {user.username} · ⭐ {dynamicScore.toFixed(1)} · {user.completedDeals} угод
          </div>
        </div>
      </div>

      <div className="balance-row" onClick={onGoToWallet} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onGoToWallet?.()}>
        <span className="balance-row__label">Баланс</span>
        <span className="balance-row__value">{balance.toLocaleString('uk-UA')} грн</span>
        <span className="balance-row__hint">натисніть для поповнення</span>
      </div>

      <div className="block">
        <h2 className="block__title">Статистика</h2>
        <div className="stats-row">
          <div className="stat">
            <span className="stat__label">Завершено угод</span>
            <span className="stat__val">{completed}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Успішність</span>
            <span className="stat__val">
              {completed + disputesCount === 0
                ? '—'
                : `${Math.round((completed / (completed + disputesCount)) * 100)}%`}
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Середній час відповіді</span>
            <span className="stat__val">{user.avgResponseMinutes} хв</span>
          </div>
          <div className="stat">
            <span className="stat__label">Спори</span>
            <span className="stat__val">
              {deals.filter((d) => d.status === 'dispute' || d.status === 'dispute_resolved').length}
            </span>
          </div>
        </div>
      </div>

      <div className="block">
        <h2 className="block__title">Мої угоди</h2>
        <div className="tabs-inline">
          {DEAL_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`tabs-inline__item ${filter === f.id ? 'tabs-inline__item--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {myDeals.length === 0 ? (
          <p className="muted">Немає угод у цій категорії</p>
        ) : (
          <ul className="deal-list">
            {myDeals.map((deal) => (
              <li key={deal.id} className="deal-item">
                <div className="deal-item__main">
                  <span className="deal-item__title">{deal.title}</span>
                  <span className="deal-item__meta">
                    {deal.amount} грн · {deal.createdAtLabel}
                  </span>
                </div>
                <div className="deal-item__right">
                  <span className={`badge badge--${deal.status}`}>{statusLabel(deal.status)}</span>
                  {(deal.status === 'active' || deal.status === 'in_review') && (
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => onOpenDeal?.(deal)}
                    >
                      Відкрити
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="block">
        <div className="block__header">
          <h2 className="block__title">Мої рекламні креативи</h2>
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={() => setShowCreativeForm((v) => !v)}
          >
            {showCreativeForm ? 'Сховати форму' : 'Створити креатив'}
          </button>
        </div>

        {showCreativeForm && (
          <form className="deal-form" onSubmit={handleCreativeSubmit}>
            <div className="field">
              <span className="field-label">Назва</span>
              <input
                type="text"
                name="title"
                value={creativeForm.title}
                onChange={handleCreativeChange}
                placeholder="Як буде називатися промо?"
                required
              />
            </div>
            <div className="field">
              <span className="field-label">Текст</span>
              <textarea
                name="text"
                value={creativeForm.text}
                onChange={handleCreativeChange}
                rows={3}
                placeholder="Основний текст рекламного оголошення"
                required
              />
            </div>
            <div className="field">
              <span className="field-label">Посилання (CTA)</span>
              <input
                type="url"
                name="ctaLink"
                value={creativeForm.ctaLink}
                onChange={handleCreativeChange}
                placeholder="https://..."
              />
            </div>
            <div className="field">
              <span className="field-label">Медіа (опціонально)</span>
              <input
                type="url"
                name="mediaUrl"
                value={creativeForm.mediaUrl}
                onChange={handleCreativeChange}
                placeholder="URL на зображення / відео"
              />
            </div>
            <div className="field">
              <span className="field-label">Статус</span>
              <select
                name="status"
                value={creativeForm.status}
                onChange={handleCreativeChange}
                className="field-select"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div className="fab-modal__actions">
              <button type="button" className="ghost-button" onClick={() => setShowCreativeForm(false)}>
                Скасувати
              </button>
              <button type="submit" className="btn btn--primary btn--cta">
                Зберегти
              </button>
            </div>
          </form>
        )}

        {myCreatives.length === 0 ? (
          <p className="muted">Поки що немає креативів. Створіть перший рекламний креатив.</p>
        ) : (
          <ul className="post-list">
            {myCreatives.map((c) => (
              <li key={c.id} className="post-list-item">
                <span className="post-list-item__type">
                  Креатив · {c.status === 'active' ? 'Active' : 'Draft'}
                </span>
                <span className="post-list-item__title">{c.title}</span>
                <span className="post-list-item__meta">
                  {c.ctaLink ? c.ctaLink : 'Без посилання'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="block">
        <h2 className="block__title">Рекламні угоди</h2>

        <h3 className="block__title" style={{ fontSize: 14, marginTop: 0 }}>
          Як рекламодавець
        </h3>
        {myAdAsAdvertiser.length === 0 ? (
          <p className="muted">Поки що немає рекламних угод як рекламодавця.</p>
        ) : (
          <ul className="deal-list">
            {myAdAsAdvertiser.map((deal) => (
              <li key={deal.id} className="deal-item">
                <div className="deal-item__main">
                  <span className="deal-item__title">{deal.title}</span>
                  <span className="deal-item__meta">
                    {deal.escrowAmount} грн · {deal.scheduledAt}
                  </span>
                </div>
                <div className="deal-item__right">
                  <span className={`badge`}>{adStatusLabel(deal.status)}</span>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => onOpenAdDeal?.(deal)}
                  >
                    Відкрити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="block__title" style={{ fontSize: 14, marginTop: 16 }}>
          Як власник каналу
        </h3>
        {myAdAsChannelOwner.length === 0 ? (
          <p className="muted">Поки що немає вхідних запитів на рекламу.</p>
        ) : (
          <ul className="deal-list">
            {myAdAsChannelOwner.map((deal) => (
              <li key={deal.id} className="deal-item">
                <div className="deal-item__main">
                  <span className="deal-item__title">{deal.title}</span>
                  <span className="deal-item__meta">
                    {deal.escrowAmount} грн · {deal.scheduledAt}
                  </span>
                </div>
                <div className="deal-item__right">
                  <span className={`badge`}>{adStatusLabel(deal.status)}</span>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => onOpenAdDeal?.(deal)}
                  >
                    Відкрити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="block">
        <div className="block__header">
          <h2 className="block__title">Мої публікації</h2>
          <button type="button" className="btn btn--primary btn--small" onClick={onGoToCreate}>
            Створити пост
          </button>
        </div>
        {myPosts.length === 0 ? (
          <p className="muted">Поки що немає публікацій. Створіть завдання, канал або рекламу.</p>
        ) : (
          <ul className="post-list">
            {myPosts.map((p) => (
              <li key={p.id} className="post-list-item">
                <span className="post-list-item__type">{TYPE_LABELS[p.type] || p.type}</span>
                <span className="post-list-item__title">{p.title}</span>
                <span className="post-list-item__meta">
                  {p.budget > 0 ? `${p.budget} грн` : '—'} · {p.createdAt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
