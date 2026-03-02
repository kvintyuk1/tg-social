import React, { useState } from 'react';

const POST_TYPES = [
  { id: 'task', label: 'Задача' },
  { id: 'job', label: 'Робота' },
  { id: 'service', label: 'Сервіс' },
  { id: 'channel', label: 'Канал' },
  { id: 'ad', label: 'Реклама' },
  { id: 'opportunity', label: 'Можливість' },
];

const CATEGORIES = [
  { id: 'education', label: 'Навчання' },
  { id: 'p2p', label: 'P2P схеми' },
  { id: 'tech', label: 'Техніка / одяг' },
  { id: 'channels', label: 'Telegram канали' },
  { id: 'referral', label: 'Реферальні програми' },
];

export function FloatingCreateButton({ onCreate, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v) => {
    if (onOpenChange) onOpenChange(typeof v === 'function' ? v(open) : v);
    else setInternalOpen(typeof v === 'function' ? v(internalOpen) : v);
  };
  const [form, setForm] = useState({
    type: 'task',
    title: '',
    description: '',
    budget: '',
    meta: '',
    deadline: 'гнучко',
    category: 'tech',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;

    onCreate?.({
      type: form.type,
      category: form.category,
      title: form.title,
      description: form.description,
      budget: form.budget ? Number(form.budget) : 0,
      meta: form.meta || undefined,
      deadline: form.deadline || 'гнучко',
    });

    setForm({
      type: 'task',
      title: '',
      description: '',
      budget: '',
      meta: '',
      deadline: 'гнучко',
      category: 'tech',
    });
    setOpen(false);
  };

  const budgetLabel =
    form.type === 'job'
      ? 'Зарплата, грн/міс'
      : form.type === 'channel' || form.type === 'ad'
        ? 'Мета / охват'
        : 'Бюджет, грн';

  return (
    <>
      <button
        type="button"
        className="fab fab--neon"
        onClick={() => setOpen(true)}
        aria-label="Створити публікацію"
      >
        +
      </button>

      {open && (
        <div
          className="fab-modal__backdrop fab-modal__backdrop--animate"
          onClick={() => setOpen(false)}
        >
          <div className="fab-modal fab-modal--slide" onClick={(e) => e.stopPropagation()}>
            <h2 className="fab-modal__title">Створити публікацію</h2>
            <form className="deal-form" onSubmit={handleSubmit}>
              <div className="field">
                <span className="field-label">Тип</span>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="field-select"
                >
                  {POST_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label">Категорія</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="field-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label">Назва</span>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Що ви пропонуєте?"
                  required
                />
              </div>

              <div className="field">
                <span className="field-label">Опис</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Деталі..."
                  rows={3}
                />
              </div>

              <div className="field-grid">
                <div className="field">
                  <span className="field-label">{budgetLabel}</span>
                  <input
                    type={form.type === 'channel' || form.type === 'ad' ? 'text' : 'number'}
                    name={form.type === 'channel' || form.type === 'ad' ? 'meta' : 'budget'}
                    min="0"
                    value={form.type === 'channel' || form.type === 'ad' ? form.meta : form.budget}
                    onChange={handleChange}
                    placeholder={
                      form.type === 'channel' || form.type === 'ad' ? 'напр. 20-50k' : '0'
                    }
                  />
                </div>
                <div className="field">
                  <span className="field-label">Дедлайн</span>
                  <input
                    type="text"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    placeholder="гнучко"
                  />
                </div>
              </div>

              {(form.type === 'channel' || form.type === 'ad') && (
                <div className="field">
                  <span className="field-label">Бюджет (опціонально)</span>
                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}

              <div className="fab-modal__actions">
                <button type="button" className="ghost-button" onClick={() => setOpen(false)}>
                  Скасувати
                </button>
                <button type="submit" className="btn btn--primary btn--cta">
                  Опублікувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
