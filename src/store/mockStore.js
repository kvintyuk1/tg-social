export const currentUser = {
  id: 'u1',
  username: '@safedeal_user',
  name: 'SafeDeal User',
  avatarColor: '#00FFE7',
  trustScore: 4.8,
  completedDeals: 24,
  successRate: 0.96,
  avgResponseMinutes: 12,
};

export const initialBalances = {
  '@safedeal_user': 0,
  '@tech_owner': 0,
  '@content_studio': 0,
  '@tech_digest': 0,
  '@safedeal_team': 0,
};

export const initialTransactions = [];

// Категорії для фільтрів
export const CATEGORIES = [
  { id: 'all', label: 'Усе' },
  { id: 'education', label: 'Навчання' },
  { id: 'p2p', label: 'P2P схеми' },
  { id: 'tech', label: 'Техніка / одяг' },
  { id: 'channels', label: 'Telegram канали' },
  { id: 'referral', label: 'Реферальні програми' },
];

// Сортування
export const SORT_OPTIONS = [
  { id: 'new', label: 'Нові' },
  { id: 'popular', label: 'Популярні' },
  { id: 'nearest', label: 'Найближчі' },
];

// Multi-type posts
export const initialPosts = [
  {
    id: 'p1',
    type: 'task',
    category: 'tech',
    title: 'Обкладинка для Telegram-каналу',
    shortDescription: 'Стильний банер 1920x1080, мінімалізм.',
    description: 'Зроблю обкладинку для каналу про технології. Без стокових фото, дедлайн сьогодні.',
    budget: 700,
    meta: { label: 'Бюджет', value: '700 грн' },
    deadline: 'сьогодні',
    createdAt: '10 хв тому',
    author: { username: '@tech_owner', avatarColor: '#0ea5e9', trustScore: 4.9, completedDeals: 58 },
  },
  {
    id: 'p2',
    type: 'job',
    category: 'education',
    title: 'Middle React інженер',
    shortDescription: 'Remote, full-time. SafeDeal екосистема.',
    description: 'Робота над Task Market, Escrow, Wallet. Досвід React + Telegram Web Apps.',
    budget: 60000,
    meta: { label: 'Зарплата', value: '60 000 грн/міс' },
    deadline: 'відкрито',
    createdAt: '30 хв тому',
    author: { username: '@safedeal_team', avatarColor: '#FF3EFF', trustScore: 5.0, completedDeals: 12 },
  },
  {
    id: 'p3',
    type: 'service',
    category: 'channels',
    title: 'Підтримка Telegram-каналу під ключ',
    shortDescription: 'Контент-план, пости, модерація.',
    description: 'Ведення каналу: контент, пости, модерація. Мін. термін 1 міс.',
    budget: 5000,
    meta: { label: 'Від', value: '5 000 грн/міс' },
    deadline: 'договірно',
    createdAt: '1 год тому',
    author: { username: '@content_studio', avatarColor: '#eab308', trustScore: 4.7, completedDeals: 41 },
  },
  {
    id: 'p4',
    type: 'channel',
    category: 'channels',
    title: 'Канал про технології — приймає рекламу',
    shortDescription: '12 300 підписників, IT / Web3 / AI. Нативні інтеграції.',
    description:
      'Telegram‑канал про IT, Web3, AI. 1–2 рекламні пости на день, без бірж, тільки прямі розміщення через SafeDeal. Є окремий пост, закріп та інтеграції в підбірки.',
    // Ціна за базовий рекламний слот "окремий пост"
    budget: 1500,
    meta: { label: 'Охват', value: '6–8k за пост' },
    deadline: 'цього тижня',
    createdAt: '2 год тому',
    author: { username: '@tech_digest', avatarColor: '#06b6d4', trustScore: 4.8, completedDeals: 27 },
    channel: {
      username: '@tech_digest',
      url: 'https://t.me/tech_digest',
      topic: 'Технології, Web3, AI, Telegram‑екосистема',
      stats: {
        subscribers: 12300,
        avgPostReach: '8–10k',
        avgAdReach: '6–8k',
        er: '8.5%',
        postsPerDay: '2–3',
      },
      adSlots: [
        {
          id: 'slot1',
          title: 'Окремий пост',
          price: 1500,
          currency: 'UAH',
          window: 'публікація протягом 24 год',
          note: 'Без конкурируючих інтеграцій в той самий день.',
        },
        {
          id: 'slot2',
          title: 'Закріплений пост на 24 год',
          price: 2200,
          currency: 'UAH',
          window: 'закріп на 24 год + окремий пост',
          note: 'Підходить для лончів та важливих оферів.',
        },
        {
          id: 'slot3',
          title: 'Згадка в добірці',
          price: 900,
          currency: 'UAH',
          window: 'разове згадування',
          note: 'Короткий опис + посилання серед інших рекомендацій.',
        },
      ],
    },
  },
  {
    id: 'p5',
    type: 'ad',
    category: 'p2p',
    title: 'SafeDeal OS — безпечні мікро-угоди',
    shortDescription: 'Поповни — замови — отримай. 24/7.',
    description: 'Інфраструктура довіри для дрібних угод у Telegram.',
    budget: 0,
    meta: { label: 'Охват', value: '20-50k' },
    deadline: '2 тижні',
    createdAt: '3 год тому',
    isPromoted: true,
    promotionEndsAt: 'сьогодні',
    author: { username: '@safedeal_team', avatarColor: '#FF3EFF', trustScore: 5.0, completedDeals: 5 },
  },
  {
    id: 'p5b',
    type: 'service',
    category: 'education',
    title: 'Консультація по Web3 та DeFi',
    shortDescription: '1 год онлайн. Допоможу з інтеграцією.',
    description: 'Експертна консультація: токенізація, смарт-контракти, безпека.',
    budget: 1200,
    meta: { label: 'Від', value: '1 200 грн/год' },
    deadline: 'цього тижня',
    createdAt: '4 год тому',
    author: { username: '@crypto_dev', avatarColor: '#f97316', trustScore: 4.6, completedDeals: 19 },
  },
  {
    id: 'p6',
    type: 'opportunity',
    category: 'referral',
    title: 'Верифікований гарант SafeDeal',
    shortDescription: 'Арбітраж спорів. Revenue-share.',
    description: 'Люди з репутацією для арбітражу та побудови trust layer.',
    budget: 3000,
    meta: { label: 'Винагорода', value: 'до 3 000 грн/міс' },
    deadline: 'до кінця місяця',
    createdAt: 'вчора',
    author: { username: '@safedeal_team', avatarColor: '#7C00FF', trustScore: 4.9, completedDeals: 73 },
  },
];

export const initialDeals = [];

export const initialFavorites = ['p1', 'p3'];

// Рекламні креативи (AdCreative)
export const initialAdCreatives = [
  {
    id: 'ac1',
    title: 'SafeDeal OS — запуск промо',
    text: 'Купуйте рекламу в перевірених Telegram‑каналах через SafeDeal. Холдим кошти до факту публікації.',
    mediaUrl: '',
    ctaLink: 'https://t.me/safedeal_demo',
    authorId: currentUser.username,
    status: 'active',
  },
];

// Рекламні угоди (AdDeal) — окремо від звичайних Safe Deal
export const initialAdDeals = [];

