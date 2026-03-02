import React, { useState } from 'react';
import { MONO_CONFIG } from '../config/monobank';

export function Wallet({ balance, transactions, onTopUp, onWithdraw }) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleTopUpClick = () => {
    const amount = Number(topUpAmount);
    if (amount > 0) {
      const url = `${MONO_CONFIG.JAR_URL}?a=${encodeURIComponent(
        Math.round(amount)
      )}&c=${encodeURIComponent(`TopUp_${Date.now()}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      // onTopUp?.(amount); // буде викликатися після ручного підтвердження або вебхука
      setTopUpAmount('');
      setShowTopUp(false);
    }
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (Number.isFinite(amount) && amount > 0 && amount <= balance) {
      onWithdraw?.(amount);
      setWithdrawAmount('');
      setShowWithdraw(false);
    }
  };

  return (
    <section className="screen wallet-screen">
      <div className="balance-card">
        <div className="balance-label">Ваш баланс</div>
        <div className="balance-value">{balance.toLocaleString('uk-UA')} грн</div>
        <div className="balance-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setShowTopUp((v) => !v)}
          >
            Поповнити
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setShowWithdraw((v) => !v)}
          >
            Виведення
          </button>
        </div>
        {showTopUp && (
          <div className="wallet-withdraw" style={{ marginTop: 12 }}>
            <input
              type="number"
              className="wallet-withdraw__input"
              placeholder="Сума поповнення, грн"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="1"
            />
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={handleTopUpClick}
              disabled={!topUpAmount || Number(topUpAmount) <= 0}
            >
              Поповнити
            </button>
          </div>
        )}
        {showWithdraw && (
          <div className="wallet-withdraw">
            <input
              type="number"
              className="wallet-withdraw__input"
              placeholder="Сума, грн"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="1"
              max={balance}
            />
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={handleWithdraw}
              disabled={!withdrawAmount || Number(withdrawAmount) > balance}
            >
              Вивести
            </button>
          </div>
        )}
      </div>

      <div className="block">
        <h2 className="block__title">Історія</h2>
        {transactions.length === 0 ? (
          <p className="muted">Поки що немає операцій</p>
        ) : (
          <ul className="tx-list">
            {transactions.map((tx) => (
              <li key={tx.id} className="tx-item">
                <div className="tx-item__main">
                  <span className="tx-item__label">{tx.label}</span>
                  <span className="tx-item__date">{tx.date}</span>
                </div>
                <span className={`tx-item__amount tx-item__amount--${tx.type}`}>
                  {tx.type === 'topup' ? '+' : tx.type === 'out' ? '−' : ''}
                  {tx.amount} грн
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
