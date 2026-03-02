import React from 'react';

export function AdsPromotion() {
  return (
    <>
      <section className="app-panel app-panel--primary">
        <h2 className="app-title">Ads & Promotion — вбудована реклама в робочий потік</h2>
        <p className="app-subtitle">
          Реклама не збоку, а всередині дій: просуваються задачі, профілі, товари та
          мікро‑сервіси, які напряму ведуть до escrow‑угод.
        </p>
      </section>

      <section className="app-panel app-panel--list">
        <div className="deals-header">
          <h2>Формати промо</h2>
        </div>

        <ul className="reputation-list">
          <li>
            <strong>Promoted task</strong> — задача піднімається у стрічці Task Market та
            підсвічується в інтерфейсі.
          </li>
          <li>
            <strong>Promoted profile</strong> — фрилансер або команда отримують пріоритет у
            підборі та рекомендаціях.
          </li>
          <li>
            <strong>Feed ads</strong> — нативні оголошення між задачами, які ведуть у Safe
            Deal‑угоди.
          </li>
        </ul>

        <p className="small-note">
          Разом з комісією з угод, PRO‑акаунтами, верифікацією та комісією за вивід це створює
          стабільну multi‑revenue модель для SafeDeal OS.
        </p>
      </section>
    </>
  );
}

