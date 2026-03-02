import React from 'react';

export function PostCardRouter({ post, onOpen, isFavorite, onToggleFavorite }) {
  const baseProps = { post, onOpen, isFavorite, onToggleFavorite };
  switch (post.type) {
    case 'task':
      return <TaskCard {...baseProps} />;
    case 'job':
      return <JobCard {...baseProps} />;
    case 'service':
      return <ServiceCard {...baseProps} />;
    case 'channel':
      return <ChannelCard {...baseProps} />;
    case 'ad':
      return <AdCard {...baseProps} />;
    case 'opportunity':
      return <OpportunityCard {...baseProps} />;
    default:
      return <TaskCard {...baseProps} />;
  }
}

function BasePostCard({ post, onOpen, typeLabel, ctaLabel, isFavorite, onToggleFavorite }) {
  return (
    <article
      className={`task-card task-card--${post.type}`}
      onClick={() => onOpen?.(post)}
    >
      <header className="task-card__header">
        <div className="task-card__header-left">
          <div className="avatar" style={{ backgroundColor: post.author.avatarColor }}>
            {post.author.username.charAt(1).toUpperCase()}
          </div>
          <div>
            <h3>{post.title}</h3>
            <div className="task-card__author">
              <span>{post.author.username}</span>
              <span className="trust-badge">
                ⭐ {post.author.trustScore.toFixed(1)} · {post.author.completedDeals} угод
              </span>
            </div>
          </div>
        </div>
        <div className="task-card__header-right">
          {post.budget > 0 && (
            <span className="task-card__budget">{post.budget.toLocaleString('uk-UA')} грн</span>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              className={`task-card__fav ${isFavorite ? 'task-card__fav--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <p className="task-card__description">{post.shortDescription}</p>

      <div className="task-card__meta">
        <span className="task-card__type">
          {typeLabel}
          {post.isPromoted && <span className="task-card__badge">Promoted</span>}
        </span>
        {post.deadline && <span className="task-card__deadline">{post.deadline}</span>}
        {post.createdAt && <span className="task-card__time">{post.createdAt}</span>}
      </div>

      {post.meta && (
        <div className="task-card__meta-extra">
          <span className="task-card__meta-label">{post.meta.label}</span>
          <span className="task-card__meta-value">{post.meta.value}</span>
        </div>
      )}

      <div className="task-card__actions">
        <button
          type="button"
          className="primary-button primary-button--small"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.(post);
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}

function TaskCard(props) {
  return <BasePostCard {...props} typeLabel="Задача" ctaLabel="Купити" />;
}

function JobCard(props) {
  return <BasePostCard {...props} typeLabel="Робота" ctaLabel="Взяти" />;
}

function ServiceCard(props) {
  return <BasePostCard {...props} typeLabel="Сервіс" ctaLabel="Купити" />;
}

function ChannelCard(props) {
  return <BasePostCard {...props} typeLabel="Канал" ctaLabel="Підписатися" />;
}

function AdCard(props) {
  return <BasePostCard {...props} typeLabel="Реклама" ctaLabel="Деталі" />;
}

function OpportunityCard(props) {
  return <BasePostCard {...props} typeLabel="Можливість" ctaLabel="Деталі" />;
}

