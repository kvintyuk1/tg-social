import React, { useState } from 'react';

const ORDERABLE_TYPES = ['task', 'service', 'job'];

export function PostDetails({
  post,
  onBack,
  onStartDeal,
  adCreatives = [],
  onCreateAdDeal,
  balance = 0,
}) {
  if (!post) return null;

  const isChannel = post.type === 'channel';
  const canOrder = ORDERABLE_TYPES.includes(post.type);
  const channel = post.channel;

  const handleOpenChannel = () => {
    if (channel?.url) {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="app-panel app-panel--primary post-details">
      <button type="button" className="ghost-button post-details__back" onClick={onBack}>
        ← До стрічки
      </button>

      <h1 className="app-title">{post.title}</h1>
      <p className="app-subtitle post-details__description">
        {post.description || post.shortDescription}
      </p>

      <div className="post-details__meta">
        <div className="post-details__author">
          <div className="avatar avatar--lg" style={{ backgroundColor: post.author.avatarColor }}>
            {post.author.username.charAt(1).toUpperCase()}
          </div>
          <div>
            <div className="post-details__author-name">{post.author.username}</div>
            <div className="post-details__author-stats">
              <span className="trust-badge">
                ⭐ {post.author.trustScore.toFixed(1)} · {post.author.completedDeals} угод
              </span>
            </div>
            {isChannel && channel?.username && (
              <div className="post-details__author-channel">
                Канал: <strong>{channel.username}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="post-details__stats">
          {post.meta && (
            <div className="post-details__stat">
              <div className="post-details__stat-label">{post.meta.label}</div>
              <div className="post-details__stat-value">{post.meta.value}</div>
            </div>
          )}
          {post.budget > 0 && (
            <div className="post-details__stat">
              <div className="post-details__stat-label">
                {isChannel ? 'Базова ціна реклами' : 'Бюджет'}
              </div>
              <div className="post-details__stat-value">
                {post.budget.toLocaleString('uk-UA')} грн
              </div>
            </div>
          )}
          <div className="post-details__stat">
            <div className="post-details__stat-label">Дедлайн</div>
            <div className="post-details__stat-value">{post.deadline || '—'}</div>
          </div>
          <div className="post-details__stat">
            <div className="post-details__stat-label">Опубліковано</div>
            <div className="post-details__stat-value">{post.createdAt}</div>
          </div>
        </div>
      </div>

      {isChannel && channel && (
        <div className="post-details__channel">
          <h2 className="post-details__section-title">Статистика каналу</h2>
          <div className="post-details__channel-stats">
            <div className="post-details__stat">
              <div className="post-details__stat-label">Підписники</div>
              <div className="post-details__stat-value">
                {channel.stats?.subscribers?.toLocaleString('uk-UA') || '—'}
              </div>
            </div>
            {channel.stats?.avgPostReach && (
              <div className="post-details__stat">
                <div className="post-details__stat-label">Охват посту</div>
                <div className="post-details__stat-value">{channel.stats.avgPostReach}</div>
              </div>
            )}
            {channel.stats?.avgAdReach && (
              <div className="post-details__stat">
                <div className="post-details__stat-label">Охват реклами</div>
                <div className="post-details__stat-value">{channel.stats.avgAdReach}</div>
              </div>
            )}
            {channel.stats?.er && (
              <div className="post-details__stat">
                <div className="post-details__stat-label">ER</div>
                <div className="post-details__stat-value">{channel.stats.er}</div>
              </div>
            )}
            {channel.stats?.postsPerDay && (
              <div className="post-details__stat">
                <div className="post-details__stat-label">Пости на день</div>
                <div className="post-details__stat-value">{channel.stats.postsPerDay}</div>
              </div>
            )}
          </div>

          {channel.adSlots?.length > 0 && (
            <div className="post-details__channel-slots">
              <h3 className="post-details__section-subtitle">Рекламні формати</h3>
              <ul className="post-details__slot-list">
                {channel.adSlots.map((slot) => (
                  <li key={slot.id} className="post-details__slot">
                    <div className="post-details__slot-header">
                      <span className="post-details__slot-title">{slot.title}</span>
                      <span className="post-details__slot-price">
                        {slot.price.toLocaleString('uk-UA')} {slot.currency || 'UAH'}
                      </span>
                    </div>
                    {slot.window && (
                      <div className="post-details__slot-window">{slot.window}</div>
                    )}
                    {slot.note && (
                      <div className="post-details__slot-note">{slot.note}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ChannelAdForm
            post={post}
            channel={channel}
            adCreatives={adCreatives}
            balance={balance}
            onCreateAdDeal={onCreateAdDeal}
          />
        </div>
      )}

      <div className="post-details__actions">
        {isChannel && channel?.url && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleOpenChannel}
          >
            Перейти в канал
          </button>
        )}

        {isChannel && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => post.onOpenAnalytics?.()}
          >
            Аналітика каналу
          </button>
        )}

        {canOrder && (
          <button
            type="button"
            className="primary-button primary-button--cta"
            onClick={() => onStartDeal?.(post)}
          >
            {isChannel ? 'Купити рекламу через Safe Deal' : 'Почати Safe Deal'}
          </button>
        )}

        {!isChannel && (
          <button type="button" className="secondary-button">
            Написати (демо)
          </button>
        )}
      </div>
    </section>
  );
}

function ChannelAdForm({ post, channel, adCreatives, balance, onCreateAdDeal }) {
  const [selectedSlotId, setSelectedSlotId] = useState(
    channel?.adSlots?.length ? channel.adSlots[0].id : ''
  );
  const [selectedCreativeId, setSelectedCreativeId] = useState(
    adCreatives.length ? adCreatives[0].id : ''
  );
  const [scheduledAt, setScheduledAt] = useState('');
  const [adError, setAdError] = useState('');
  const [adSuccess, setAdSuccess] = useState('');

  if (!channel) return null;

  const handleSubmitAdRequest = () => {
    setAdError('');
    setAdSuccess('');
    if (!channel || !channel.adSlots?.length) {
      setAdError('У каналу немає доступних рекламних слотів.');
      return;
    }
    if (!adCreatives.length) {
      setAdError('У вас немає активних креативів. Створіть креатив у профілі.');
      return;
    }
    const slot = channel.adSlots.find((s) => s.id === selectedSlotId) || channel.adSlots[0];
    const creative =
      adCreatives.find((c) => c.id === selectedCreativeId && c.status === 'active') ||
      adCreatives.find((c) => c.status === 'active');
    if (!creative) {
      setAdError('Немає активних креативів. Увімкніть хоча б один у статусі "active".');
      return;
    }
    if (!scheduledAt.trim()) {
      setAdError('Вкажіть бажану дату та час розміщення.');
      return;
    }
    if (slot.price > 0 && balance < slot.price) {
      setAdError('Недостатньо коштів на гаманці для бронювання цього слоту.');
      return;
    }

    onCreateAdDeal?.({
      channelPost: post,
      slot,
      creative,
      scheduledAt,
    });
    setAdSuccess('Запит на рекламу надіслано через SafeDeal. Кошти тимчасово заблоковані.');
    setScheduledAt('');
  };

  return (
    <div className="post-details__channel-adform">
      <h3 className="post-details__section-subtitle">Купити рекламу через SafeDeal</h3>
      <p className="post-details__channel-hint">
        SafeDeal холдить кошти до фактичної публікації рекламного посту. Після підтвердження —
        виплачує власнику каналу або переводить у спір.
      </p>

      <div className="field">
        <span className="field-label">Слот</span>
        <select
          className="field-select"
          value={selectedSlotId}
          onChange={(e) => setSelectedSlotId(e.target.value)}
        >
          {channel.adSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.title} · {slot.price.toLocaleString('uk-UA')} {slot.currency || 'UAH'}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">Креатив</span>
        {adCreatives.length === 0 ? (
          <p className="muted">
            Немає креативів. Створіть їх у розділі профілю &quot;Мої рекламні креативи&quot;.
          </p>
        ) : (
          <select
            className="field-select"
            value={selectedCreativeId}
            onChange={(e) => setSelectedCreativeId(e.target.value)}
          >
            {adCreatives.map((creative) => (
              <option key={creative.id} value={creative.id}>
                {creative.title} {creative.status !== 'active' ? ' · draft' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="field">
        <span className="field-label">Бажана дата / час</span>
        <input
          type="text"
          placeholder="напр. завтра, 18:00"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>

      <div className="post-details__channel-adform-footer">
        <div className="post-details__channel-balance">
          Баланс: <strong>{balance.toLocaleString('uk-UA')} грн</strong>
        </div>
        <button
          type="button"
          className="primary-button primary-button--cta"
          onClick={handleSubmitAdRequest}
        >
          Надіслати запит на рекламу
        </button>
      </div>

      {adError && <p className="post-details__channel-error">{adError}</p>}
      {adSuccess && <p className="post-details__channel-success">{adSuccess}</p>}
    </div>
  );
}

