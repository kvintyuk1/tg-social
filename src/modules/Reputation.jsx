import React from 'react';

export function Reputation() {
  return (
    <>
      <section className="app-panel app-panel--primary">
        <h2 className="app-title">Reputation Engine — trust score для Telegram‑економіки</h2>
        <p className="app-subtitle">
          Довіра — основа ліквідності. Reputation Engine збирає сигнали з усіх модулів:
          Task Market, Escrow, Wallet та Ads.
        </p>
      </section>

      <section className="app-panel app-panel--list">
        <div className="deals-header">
          <h2>Що враховується в рейтингу</h2>
        </div>

        <ul className="reputation-list">
          <li>
            <strong>Завершені угоди</strong> — кількість та обсяг успішних escrow‑операцій.
          </li>
          <li>
            <strong>Швидкість реакції</strong> — час від «Take / Start Deal» до початку роботи.
          </li>
          <li>
            <strong>Dispute rate</strong> — частка угод, що зайшли у спір, та їх результат.
          </li>
          <li>
            <strong>Якість відгуків</strong> — оцінки й фідбек від покупців та виконавців.
          </li>
        </ul>

        <p className="small-note">
          У MVP це може бути проста зірочка / бал від 0 до 100. З часом Reputation Engine можна
          винести в окремий сервіс, який переїде в інші Telegram‑боти як «score‑layer».
        </p>
      </section>
    </>
  );
}

