import React, { useEffect } from 'react';

const MENU_SECTIONS = [
  {
    id: 'catalog',
    label: 'Каталог',
    children: [
      { id: 'channel', label: 'Канали' },
      { id: 'job', label: 'Робота / Tasks' },
      { id: 'service', label: 'Сервіси' },
      { id: 'ad', label: 'Реклама / Ads' },
    ],
  },
  { id: 'create', label: 'Створити публікацію', highlight: true },
  { id: 'favorites', label: 'Обране' },
  { id: 'my-posts', label: 'Мої пости' },
  { id: 'deals', label: 'Мої угоди' },
  { id: 'wallet', label: 'Гаманець' },
  { id: 'profile', label: 'Профіль' },
  { id: 'settings', label: 'Налаштування / Верифікація' },
];

export function BurgerMenu({ open, onClose, activeSection, onNavigate }) {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleNav = (id) => {
    onNavigate?.(id);
    onClose?.();
  };

  return (
    <>
      <div
        className={`burger-backdrop ${open ? 'burger-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`burger-menu ${open ? 'burger-menu--open' : ''}`}>
        <div className="burger-menu__header">
          <span className="burger-menu__title">SafeDeal OS</span>
          <button type="button" className="burger-menu__close" onClick={onClose} aria-label="Закрити">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="burger-menu__nav">
          {MENU_SECTIONS.map((section) =>
            section.children ? (
              <div key={section.id} className="burger-menu__group">
                <div className="burger-menu__group-label">{section.label}</div>
                {section.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={`burger-menu__item burger-menu__item--child ${
                      activeSection === child.id ? 'burger-menu__item--active' : ''
                    }`}
                    onClick={() => handleNav(child.id)}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                key={section.id}
                type="button"
                className={`burger-menu__item ${
                  activeSection === section.id ? 'burger-menu__item--active' : ''
                } ${section.highlight ? 'burger-menu__item--highlight' : ''}`}
                onClick={() => handleNav(section.id)}
              >
                {section.label}
              </button>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
