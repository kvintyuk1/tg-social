// Minimal helpers for future Telegram WebApp integration.

export function initTelegram() {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
  }
  return tg || null;
}

export function getTelegramUser() {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user || null;
}

export function openTelegramLink(url) {
  if (!url) return;
  if (typeof window === 'undefined') return;
  const tg = window.Telegram?.WebApp;
  if (tg && tg.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

