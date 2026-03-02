import React from 'react';

export function ChannelAnalytics({ post, onBack }) {
  if (!post || !post.channel) return null;
  const channel = post.channel;

  const mockHistory = [
    { id: 'h1', title: 'Окремий пост', date: 'вчора', cpm: 180 },
    { id: 'h2', title: 'Закріп на 24 год', date: '3 дні тому', cpm: 220 },
  ];

  const mockGrowth = [
    { label: '7 дн.', value: '+350' },
    { label: '30 дн.', value: '+1 200' },
    { label: '90 дн.', value: '+3 800' },
  ];

  return (
    <section className="screen">
      <button type="button" className="ghost-button post-details__back" onClick={onBack}>
        ← До каналу
      </button>

      <h1 className="app-title">Аналітика каналу</h1>
      <p className="app-subtitle">{channel.username} · {channel.topic}</p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat__label">Підписники</span>
          <span className="stat__val">
            {channel.stats?.subscribers?.toLocaleString('uk-UA') || '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Середній охват</span>
          <span className="stat__val">{channel.stats?.avgPostReach || '—'}</span>
        </div>
      </div>

      <div className="block">
        <h2 className="block__title">Зростання аудиторії</h2>
        <div className="stats-row">
          {mockGrowth.map((g) => (
            <div key={g.label} className="stat">
              <span className="stat__label">{g.label}</span>
              <span className="stat__val">{g.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="block">
        <h2 className="block__title">Середній CPM</h2>
        <p className="muted">
          За останні розміщення середній CPM (ціна за 1000 показів) становив приблизно 200–250 грн.
        </p>
      </div>

      <div className="block">
        <h2 className="block__title">Історія рекламних розміщень</h2>
        <ul className="post-list">
          {mockHistory.map((h) => (
            <li key={h.id} className="post-list-item">
              <span className="post-list-item__title">{h.title}</span>
              <span className="post-list-item__meta">
                {h.date} · CPM ~ {h.cpm} грн
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

