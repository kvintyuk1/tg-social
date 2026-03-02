# SafeDeal OS — Functional Specification (MVP)

Ціль: зробити SafeDeal OS реальним маркетплейсом‑гарантом для сірої економіки (аккаунти, трафік, ворки, техніка, накрутка тощо), де:

- **ніхто не може “намахати”** завдяки escrow, статус‑машині й репутації;
- усі дії прозорі через таймлайни, нотифікації, аналітику;
- платформа заробляє на комісіях (fee engine).

---

## 1. Користувачі та ролі

- **Звичайний користувач**
  - Створює/читає пости в каталозі (ворки, техніка, сервіси, канали).
  - Купує / продає через SafeDeal.
  - Купує рекламу в Telegram‑каналах.
  - Отримує нотифікації.
  - Веде базовий чат усередині угоди.
- **Власник каналу**
  - Публікує свій канал у каталозі (`type: channel`).
  - Налаштовує слоти реклами (`adSlots`).
  - Приймає/відхиляє рекламні запити (AdDeals).
  - Має доступ до аналітики каналу.
- **Маркетплейс (SafeDeal OS)**
  - Є посередником/гарантом: тримає кошти в escrow.
  - Стежить за валідністю статусів угод.
  - Рахує комісії, репутацію, записує історію в таймлайни й транзакції.

---

## 2. Каталог / Feed

### 2.1 Типи публікацій

- `task` — задачі / замовлення.
- `job` — робота (довгострокові варіанти).
- `service` — сервіси (“накрутка відгуків”, “настройка трафіку” тощо).
- `channel` — Telegram‑канали, що продають рекламу.
- `ad` — промо/рекламні пости всередині SafeDeal (promoted listings).
- `opportunity` — можливості (ворки, партнерки, траферські ворки).

### 2.2 Функціонал каталогу

- Пошук по заголовку/опису.
- Фільтри:
  - за типом (`task`, `service`, `channel`, `ad`, `opportunity`);
  - за категорією (`education`, `p2p`, `tech`, `channels`, `referral`);
  - сортування (`new`, `popular`, `nearest`).
- Вкладки:
  - “Каталог” (усе / за типами).
  - “Канали”.
  - “Реклама / Ads”.
  - “Обране”.
- Маркування:
  - бейдж **“Promoted”** для промо‑постів (`isPromoted`, `promotionEndsAt`).

---

## 3. Escrow & Safe Deals

### 3.1 Створення звичайної угоди (Safe Deal)

1. Користувач відкриває пост (`task/service/job`).
2. Тисне “Почати Safe Deal”.
3. Якщо є бюджет і баланс достатній:
   - кошти **холдяться** в гаманці (`holdFunds` + зменшення `availableBalance`);
   - створюється запис `deal` зі статусом `active`.
4. Угоди відображаються в:
   - `DealsCenter` (вкладка “Угоди”);
   - `Profile` (“Мої угоди”).

### 3.2 Життєвий цикл Safe Deal

- `active` → виконавець передає результат (посилання, коментар).
- `in_review` → покупець:
  - або підтверджує (виплата з escrow);
  - або відкриває спір (демо‑логіка).
- `completed` → угоду завершено, кошти виплачені.
- `dispute / dispute_resolved` → результат арбітражу (демо).

Візуально керується через модуль `EscrowDemo` (форма здачі роботи, прийняття, спір).

---

## 4. Advertising Marketplace (AdDeals)

### 4.1 Канали та слоти реклами

- У `mockStore` / бекенді:
  - `posts.type = 'channel'` містять поле `channel`:
    - `username`, `url`, `topic`;
    - `stats` (subscribers, avgPostReach, avgAdReach, ER, postsPerDay);
    - `adSlots[]` (назва, ціна, вікно публікації, опис).
- У UI:
  - сторінка каналу (`PostDetails` з `type: channel`) показує:
    - статистику (як TGStat);
    - список рекламних слотів;
    - блок форми купівлі реклами через SafeDeal.

### 4.2 AdCreative

- Окремі рекламні креативи користувача:
  - `title`, `text`, `mediaUrl`, `ctaLink`, `status: draft|active`.
- UI:
  - у `Profile` блок “Мої рекламні креативи”:
    - список креативів;
    - форма створення/редагування (збереження як draft/active).

### 4.3 AdDeal (рекламна угода)

#### 4.3.1 Створення (Buy Ad on Channel)

1. Користувач відкриває канал у каталозі.
2. В блоці “Купити рекламу через SafeDeal”:
   - обирає слот (`adSlot`);
   - обирає свій `AdCreative`;
   - задає дату/час (`scheduledAt`).
3. Валідація:
   - наявність активного креативу;
   - наявність слотів;
   - достатньо коштів у гаманці.
4. Створення `AdDeal`:
   - `status: pending_approval` (через статус‑машину `draft → pending_approval`);
   - `escrowAmount = price слота`;
   - `timeline` з подією `{ type: 'created', at: 'щойно' }`.
5. Гроші холдяться в централізованому гаманці (`walletEngine.holdFunds`).

#### 4.3.2 Status Machine (AdDeal)

- Файл `config/statusConfig.js`:

```js
export const AD_DEAL_STATUSES = {
  draft: ['pending_approval'],
  pending_approval: ['approved', 'rejected'],
  approved: ['scheduled'],
  scheduled: ['published'],
  published: ['completed', 'dispute'],
  dispute: ['resolved'],
  resolved: [],
};
```

- Функція `canTransition(from, to)` використовується перед кожним оновленням статусу:
  - при створенні: `draft → pending_approval`;
  - при публікації: `scheduled → published` (або `approved → published` в демо);
  - при завершенні: `published → completed`;
  - при спорі: `published → dispute` та `dispute → resolved`.
- Невалідний перехід → кидання Error (для продакшена це буде 4xx відповідь з бекенду).

#### 4.3.3 Approval / Scheduling / Publishing

- **Review власником каналу** (MVP логіка частково імпліцитна):
  - в `Profile` у блоці “Рекламні угоди → Як власник каналу”:
    - список входячих `AdDeal` зі статусами;
    - відкриття в `AdDealDetails`.
- **Публікація**:
  - у `AdDealDetails` власник каналу:
    - вводить `postUrl`;
    - натискає “Відмітити як опубліковану”:
      - валідація переходу;
      - `status = 'published'`;
      - додавання в `timeline` події `{ type: 'published', at: 'щойно' }`;
      - створення нотифікації `deal_published`.

#### 4.3.4 Completion & Payout (Fee Engine + Wallet Engine)

- Файл `engine/feeEngine.js`:
  - `calculateFee(amount)` → 5% від суми, але не менше 10 грн.
- Файл `engine/walletEngine.js`:
  - `createWallet`, `holdFunds`, `payoutToUser`, `refundToUser`, `applyFee`, з типами транзакцій `hold/release/payout/refund/fee`.
- При завершенні рекламної угоди:
  - перевірка status transition (`published → completed`);
  - розрахунок комісії:
    - `fee = max(5%, 10 грн)`;
    - `net = escrowAmount - fee`.
  - `payoutToUser(wallet, escrowAmount, meta)` — гроші виходять з escrow (для MVP це просто відмітка в транзакціях).
  - баланс власника каналу поповнюється на `net`;
  - статус `AdDeal` → `completed`, у `timeline` додається `{ type: 'completed', at: 'щойно' }`;
  - нотифікація `deal_completed`.

#### 4.3.5 Dispute Flow

- У `AdDealDetails` рекламодавець може:
  - при статусі `published` або `scheduled`:
    - заповнити текст проблеми;
    - натиснути “Відкрити спір”.
- Система:
  - оновлює статус на `dispute` (через `canTransition`);
  - додає повідомлення в `messages` (чат) із `system: false`;
  - пушить нотифікацію `dispute_opened`.
- Розв’язання спору (MVP): вручну через зміну статусу на `resolved`, опціонально з логікою `refundToUser`.

---

## 5. Unified Deals Timeline

- Для кожного `AdDeal`:
  - `timeline: [{ type, at }, ...]`.
- Відображення у `AdDealDetails` через компонент `DealTimeline`:
  - вертикальна лінія з точками;
  - для кожного етапу:
    - назва (Створено, Опубліковано, Завершено);
    - час/лейбл.

---

## 6. In‑Deal Chat

- Поле в `AdDeal`:

```js
messages: [
  { id, authorId, text, createdAt, system: boolean }
]
```

- Компонент `DealChat`:
  - список повідомлень:
    - “мої” (`authorId === currentUser`) праворуч / інший колір;
    - “їхні” — інший стиль;
    - `system` — сірі курсивом;
  - інпут + кнопка “Надіслати”;
  - відправка повідомлення дериваційно через callback (`onSend`) → оновлення `messages` всередині `AdDeal`.
- У `AdDealDetails` використовується `DealChat` для контекстної комунікації по угоді.

---

## 7. Notifications Center

- `notifications: []` у стані `App.jsx`.
- Типи:
  - `ad_approved`
  - `ad_rejected`
  - `deal_completed`
  - `deal_published`
  - `dispute_opened`
- Події, які пушать нотифікації:
  - публікація рекламного посту (`deal_published`);
  - завершення рекламної угоди (`deal_completed`);
  - відкриття спору (`dispute_opened`);
  - (у продакшені будуть додані approve/reject).
- UI:
  - іконка дзвоника в `AppHeader` з бейджем кількості.
  - `NotificationsPanel`:
    - список нотифікацій з типом, текстом, часом;
    - пустий стан;
    - можливість закриття панелі.

---

## 8. Reputation Engine v1

- Файл `engine/reputationEngine.js`:

```js
score = completedDeals * 2 - disputes * 3 - volume / 1000;
// clamp 0–5, 1 decimal
```

- `Profile`:
  - рахує:
    - `completedDeals` (за всіма Safe Deal);
    - `disputes` (угоди в статусах `dispute`/`dispute_resolved`);
    - `volume` (сума не тільки SafeDeal, а й рекламних угод як власник каналу).
  - показує:
    - динамічний рейтинг ⭐ замість статичного `trustScore`;
    - “Успішність” = частка завершених угод без спорів;
    - кількість спорів.

---

## 9. Channel Analytics

- Окремий модуль `ChannelAnalytics`:
  - доступний із сторінки каналу через кнопку “Аналітика каналу”.
- Показує:
  - поточні метрики каналу (підписники, середній охват, ER);
  - mock “зростання аудиторії” (7 / 30 / 90 днів);
  - опис середнього CPM (на базі історії розміщень);
  - історію рекламних розміщень (mock‑дані).

---

## 10. Wallet Engine (централізований)

- Структура:

```js
{
  availableBalance: number,
  escrowBalance: number,
  transactions: [
    { id, type, amount, label, date, meta }
  ]
}
```

- Дії:
  - `holdFunds(amount)` — списати з доступного, додати в escrow.
  - `releaseFunds(amount)` — повернути з escrow в доступний.
  - `payoutToUser(amount)` — виплата зовні (escrow → “зовнішній світ”).
  - `refundToUser(amount)` — повернути з escrow назад на доступний.
  - `applyFee(amount)` — зняти комісію з доступного.
- Взаємодія з UI:
  - `Wallet` показує `wallet.availableBalance` + список транзакцій;
  - всі SafeDeal/AdDeal операції оновлюють `wallet`, а також, за потреби, окремі баланси авторів (`balances`).

---

## 11. Promoted Listings

- Поля в `post`:
  - `isPromoted: boolean`
  - `promotionEndsAt: string`
- UI:
  - у картці поста (`PostCardRouter`) показується бейдж “Promoted” поруч із типом.
  - у майбутньому: сортування/бусти в каталозі.

---

## 12. Telegram WebApp Prep

- Файл `integrations/telegram.js`:
  - `initTelegram()` — виклик `Telegram.WebApp.ready()`, якщо доступно.
  - `getTelegramUser()` — повертає `initDataUnsafe.user`.
  - `openTelegramLink(url)` — відкриває лінк через `tg.openTelegramLink` або `window.open`.
- Використання:
  - канали / CTA‑лінки в креативах відкривати через `openTelegramLink` для повної інтеграції з Telegram WebApp.

---

## 13. Backend Schema (крос‑посилання)

- Описано в `docs/backend-schema.md`:
  - `users`, `posts`, `channels`, `deals`, `ad_deals`, `ad_creatives`, `wallet_transactions`, `ratings`, `notifications`.
- Взаємозв’язок:
  - усі дії фронта (створення постів, угод, нотифікацій, транзакцій) мапляться на ці таблиці.

---

## 14. Довіра та анти‑скам логіка

Для кейсів з чатів типу:

- “Продам 5 аккаунтов bybit”, “Ищу людей на новый ворк”, “Скупаю техніку”, “накрутка відгуків” тощо:

SafeDeal OS забезпечує:

- **Escrow**:
  - покупець віддає гроші платформі, а не виконавцю напряму;
  - гроші не підуть поки не буде:
    - підтвердження факту виконання;
    - або рішення по спору.
- **Status machine**:
  - не можна “перескочити” напряму з `pending_approval` у `completed`;
  - усі стани логічні та відслідковувані.
- **Timeline + Notifications**:
  - користувач бачить, що й коли відбулося;
  - отримує сповіщення про ключові кроки (публікація, завершення, спір).
- **Reputation engine**:
  - скам‑актори накопичують спори/низький рейтинг;
  - профілі з великою кількістю успішних угод автоматично мають вищу довіру.
- **In‑deal chat**:
  - вся критична комунікація усередині угоди, може бути врахована при розв’язанні спорів.

Разом це перетворює демо‑інтерфейс у **production‑ready MVP маркетплейсу‑гаранта**, який можна далі під’єднати до реального бекенду та Telegram WebApp.

