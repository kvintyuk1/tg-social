import React from 'react';
import { generatePaymentLink } from '../config/monobank';

export function MonobankPaymentButton({ basePrice, dealId }) {
  const safeBase = Math.max(0, Number(basePrice) || 0);

  const handleClick = () => {
    if (!dealId || !safeBase) return;
    const url = generatePaymentLink(safeBase, dealId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm font-medium shadow-md hover:bg-gray-900 transition"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-xs font-bold">
          m
        </span>
        <span>Оплатити через Monobank</span>
      </button>
      <p className="text-xs text-red-400">
        Увага! Не видаляйте коментар <strong>{dealId}</strong> при оплаті, інакше кошти не будуть
        зараховані автоматично.
      </p>
    </div>
  );
}

