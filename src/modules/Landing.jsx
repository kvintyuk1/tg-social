import React from 'react';

export function Landing() {
  return (
    <>
      <section className="app-panel app-panel--primary">
        <h1 className="app-title">SafeDeal OS — work layer for Telegram</h1>
        <p className="app-subtitle">
          Telegram‑нативна платформа, де будь‑яку маленьку роботу можна замовити, виконати
          й оплатити за кілька хвилин прямо в Telegram.
        </p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Task Market</h3>
            <p>Стрічка задач, швидких джобів та послуг у форматі delivery‑apps.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Safe Deal Escrow</h3>
            <p>Гроші в холді до моменту прийняття роботи або рішення по спору.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Reputation Engine</h3>
            <p>Trust score за угодами, швидкістю, відгуками та dispute‑rate.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Wallet & Ads</h3>
            <p>Внутрішній баланс, виводи та просування профілів і задач.</p>
          </div>
        </div>

        <div className="fee-note">
          <span className="fee-pill">Комісія з угод: 3–5%</span>
          <span className="fee-text">
            Плюс реклама, PRO‑акаунти, верифікація, комісія за вивід — multi‑revenue модель,
            що масштабується разом із обсягом дрібних угод.
          </span>
        </div>
      </section>

      <section className="app-panel app-panel--secondary">
        <h2>Чому Telegram Web App — ідеальний шар роботи</h2>
        <p className="app-subtitle">
          Не ще одна фриланс‑платформа, а інфраструктура довіри для дрібних онлайн‑угод
          прямо в месенджері.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Telegram‑first досвід</h3>
            <p>
              Миттєвий onboarding, готова ідентичність користувача, пуші, чати для угод та
              вірусність через пересилання.
            </p>
          </div>
          <div className="feature-card">
            <h3>Нова поведінка користувачів</h3>
            <p>
              Не «піти на фриланс‑біржу», а «відкрити Telegram і заробити за 10 хвилин».
              Це інший рівень частоти взаємодій.
            </p>
          </div>
          <div className="feature-card">
            <h3>Сильний positioning</h3>
            <p>
              Платформа, де будь‑яку маленьку роботу можна замовити, виконати й оплатити за
              кілька хвилин прямо в Telegram.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

