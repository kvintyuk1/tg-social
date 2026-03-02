import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PostCardRouter } from '../components/PostCardRouter';
import { SkeletonCard } from '../components/SkeletonCard';
import { CATEGORIES, SORT_OPTIONS } from '../store/mockStore';

const TYPE_FILTERS = [
  { id: 'all', label: 'Усе' },
  { id: 'task', label: 'Задачі' },
  { id: 'job', label: 'Роботи' },
  { id: 'service', label: 'Сервіси' },
  { id: 'channel', label: 'Канали' },
  { id: 'ad', label: 'Реклама' },
  { id: 'opportunity', label: 'Можливості' },
];

function getFilterLabel(typeFilter, categoryFilter, sortBy) {
  const parts = [];
  if (typeFilter !== 'all') parts.push(TYPE_FILTERS.find((f) => f.id === typeFilter)?.label || typeFilter);
  if (categoryFilter !== 'all') parts.push(CATEGORIES.find((c) => c.id === categoryFilter)?.label || categoryFilter);
  parts.push(SORT_OPTIONS.find((s) => s.id === sortBy)?.label || sortBy);
  return parts.join(' · ') || 'Фільтри';
}

export function Feed({
  posts,
  favorites = [],
  onOpenPost,
  onToggleFavorite,
  catalogSection,
  showTrending,
  loading = false,
}) {
  const [typeFilter, setTypeFilter] = useState(catalogSection || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState(showTrending ? 'popular' : 'new');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (catalogSection && catalogSection !== 'all') setTypeFilter(catalogSection);
  }, [catalogSection]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filtered = useMemo(() => {
    let list = [...posts];

    if (catalogSection === 'favorites') {
      list = list.filter((p) => favorites.includes(p.id));
    } else if (typeFilter !== 'all') {
      list = list.filter((p) => p.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'new') list.sort((a, b) => (b.id > a.id ? 1 : -1));
    else if (sortBy === 'popular') list.sort((a, b) => (b.author?.completedDeals ?? 0) - (a.author?.completedDeals ?? 0));
    else if (sortBy === 'nearest') {
      const score = (p) => {
        if (p.deadline?.includes('сьогодні')) return 3;
        if (p.deadline?.includes('цього тижня') || p.deadline?.includes('відкрито')) return 2;
        return 1;
      };
      list.sort((a, b) => score(b) - score(a));
    }

    return list;
  }, [posts, typeFilter, categoryFilter, sortBy, search, catalogSection, favorites]);

  return (
    <section className="feed screen">
      <div className="feed__search">
        <span className="feed__search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="search"
          className="feed__search-input"
          placeholder="Пошук по каталогу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Пошук"
        />
      </div>

      <div className="feed-filter-wrap" ref={dropdownRef}>
        <button
          type="button"
          className={`filter-btn ${open ? 'filter-btn--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="filter-btn__icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </span>
          <span>{getFilterLabel(typeFilter, categoryFilter, sortBy)}</span>
        </button>

        {open && (
          <div className="filter-dropdown">
            <div className="filter-dropdown__group">
              <div className="filter-dropdown__label">Тип</div>
              <div className="filter-dropdown__row">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`filter-dropdown__chip ${typeFilter === f.id ? 'filter-dropdown__chip--active' : ''}`}
                    onClick={() => setTypeFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-dropdown__group">
              <div className="filter-dropdown__label">Категорія</div>
              <div className="filter-dropdown__row">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`filter-dropdown__chip ${categoryFilter === c.id ? 'filter-dropdown__chip--active' : ''}`}
                    onClick={() => setCategoryFilter(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-dropdown__group">
              <div className="filter-dropdown__label">Сортування</div>
              <div className="filter-dropdown__row">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`filter-dropdown__chip ${sortBy === s.id ? 'filter-dropdown__chip--active' : ''}`}
                    onClick={() => setSortBy(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showTrending && !catalogSection && (
        <div className="feed__trending">
          <span className="feed__trending-label">🔥 Популярне</span>
        </div>
      )}

      <div className="feed-list">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {catalogSection === 'favorites'
              ? 'Додайте публікації в обране'
              : 'Немає публікацій за обраними фільтрами. Створіть нову.'}
          </div>
        ) : (
          filtered.map((post) => (
            <PostCardRouter
              key={post.id}
              post={post}
              onOpen={onOpenPost}
              isFavorite={favorites.includes(post.id)}
              onToggleFavorite={() => onToggleFavorite?.(post.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
