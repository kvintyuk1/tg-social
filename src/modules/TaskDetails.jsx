import React from 'react';

export function TaskDetails({ task, onBack, onStartDeal }) {
  if (!task) {
    return null;
  }

  return (
    <section className="app-panel app-panel--primary">
      <button type="button" className="ghost-button task-details__back" onClick={onBack}>
        ← До задач
      </button>

      <h1 className="app-title">{task.title}</h1>
      <p className="app-subtitle">{task.description || task.shortDescription}</p>

      <div className="task-details__meta">
        <div className="task-details__author">
          <div className="avatar" style={{ backgroundColor: task.author.avatarColor }}>
            {task.author.username.charAt(1).toUpperCase()}
          </div>
          <div>
            <div className="task-details__author-name">{task.author.username}</div>
            <div className="task-details__author-stats">
              <span className="trust-badge">
                ⭐ {task.author.trustScore.toFixed(1)} · {task.author.completedDeals} угод
              </span>
            </div>
          </div>
        </div>

        <div className="task-details__stats">
          <div className="task-details__stat">
            <div className="task-details__stat-label">Бюджет</div>
            <div className="task-details__stat-value">{task.budget} грн</div>
          </div>
          <div className="task-details__stat">
            <div className="task-details__stat-label">Дедлайн</div>
            <div className="task-details__stat-value">{task.deadline}</div>
          </div>
          <div className="task-details__stat">
            <div className="task-details__stat-label">Опубліковано</div>
            <div className="task-details__stat-value">{task.createdAt}</div>
          </div>
        </div>
      </div>

      <div className="task-details__actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => onStartDeal?.(task)}
        >
          Почати Safe Deal
        </button>
        <button type="button" className="secondary-button">
          Написати (демо)
        </button>
      </div>
    </section>
  );
}

