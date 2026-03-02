import React from 'react';
import { calculateTotalPayable } from '../../engine/feeEngine';
import { MonobankPaymentButton } from '../MonobankPaymentButton';

export function DealCheckout({ baseAmount, dealId, onPay }) {
  const safeBase = Math.max(0, Number(baseAmount) || 0);
  const gatewayFee = Math.round(safeBase * 0.02);
  const total = calculateTotalPayable(safeBase);

  return (
    <div className="deal-section">
      <div className="deal-section-title">Оплата через Monobank</div>
      <div className="deal-checkout">
        <div className="deal-checkout__row">
          <span>Базова вартість</span>
          <span>{safeBase.toLocaleString('uk-UA')} грн</span>
        </div>
        <div className="deal-checkout__row">
          <span>Комісія платіжного шлюзу (2%)</span>
          <span>{gatewayFee.toLocaleString('uk-UA')} грн</span>
        </div>
        <div className="deal-checkout__row deal-checkout__row--total">
          <span>Усього до сплати</span>
          <span>{total.toLocaleString('uk-UA')} грн</span>
        </div>
      </div>

      <MonobankPaymentButton basePrice={safeBase} dealId={dealId} />

      {onPay && (
        <button
          type="button"
          className="secondary-button primary-button--small"
          onClick={() => onPay(safeBase, total)}
        >
          Обробити оплату (demo)
        </button>
      )}

      <div className="mt-3 text-xs text-gray-400 space-y-1">
        <p className="font-semibold">Правила безпечної угоди (SafeDeal Beta):</p>
        <p>Ви оплачуєте послуги доступу до платформи та технічний супровід угоди.</p>
        <p>
          Гроші утримуються Адміністратором (Escrow) до моменту підтвердження виконання робіт або
          винесення рішення по спору.
        </p>
        <p>
          Натискаючи &quot;Оплатити&quot;, ви погоджуєтесь, що Адміністратор не є стороною продажу
          товарів, а лише гарантом фінансової безпеки сторін.
        </p>
        <p>
          Повернення коштів можливе лише до моменту активації послуги або за рішенням Арбітражу.
        </p>
      </div>
    </div>
  );
}


