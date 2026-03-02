import React, { useState } from 'react';
import { PostCardRouter } from '../components/PostCardRouter';

const FILTERS = [
  { id: 'all', label: 'Усе' },
  { id: 'task', label: 'Задачі' },
  { id: 'job', label: 'Роботи' },
  { id: 'service', label: 'Сервіси' },
  { id: 'channel', label: 'Канали' },
  { id: 'ad', label: 'Реклама' },
  { id: 'opportunity', label: 'Можливості' },
];

export function TaskMarket({ tasks, onOpenTask }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = tasks.filter((post) =>
    activeFilter === 'all' ? true : post.type === activeFilter
  );

  return (
    <section className="app-panel app-panel--list">
      <div className="deals-header">
        <h2>Ринок задач</h2>
        <p>Мульти‑фід задач, робіт, сервісів, каналів та можливостей.</p>
      </div>

      <div className="feed-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`feed-filters__item ${
              activeFilter === filter.id ? 'feed-filters__item--active' : ''
            }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="task-feed">
        {filtered.map((post) => (
          <PostCardRouter key={post.id} post={post} onOpen={onOpenTask} />
        ))}
      </div>
    </section>
  );
}


