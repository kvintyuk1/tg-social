import React from 'react';

export function ServicesFeed({ services, onOpenService }) {
  return (
    <section className="screen">
      <p className="screen__desc">
        Оберіть послугу і замовите її. Гроші списуються з гаманця, після виконання — йдуть виконавцю.
      </p>

      <div className="card-list">
        {services.map((s) => (
          <article
            key={s.id}
            className="service-card"
            onClick={() => onOpenService?.(s)}
          >
            <div className="service-card__top">
              <div className="service-card__author">
                <div
                  className="avatar avatar--sm"
                  style={{ backgroundColor: s.author.avatarColor }}
                >
                  {s.author.username.charAt(1).toUpperCase()}
                </div>
                <span>{s.author.username}</span>
              </div>
              <span className="service-card__price">{s.price} грн</span>
            </div>
            <h3 className="service-card__title">{s.title}</h3>
            <p className="service-card__desc">{s.shortDescription}</p>
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenService?.(s);
              }}
            >
              Деталі
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
