import React, { useState, useEffect } from 'react';
import './App.css';
import { Feed } from './modules/Feed';
import { PostDetails } from './modules/PostDetails';
import { DealsCenter } from './modules/DealsCenter';
import { Wallet } from './modules/Wallet';
import { EscrowDemo } from './modules/EscrowDemo';
import { Profile } from './modules/Profile';
import { AdDealDetails } from './modules/AdDealDetails';
import { ChannelAnalytics } from './modules/ChannelAnalytics';
import { NotificationsPanel } from './components/NotificationsPanel';
import { FloatingCreateButton } from './components/FloatingCreateButton';
import { SplashScreen } from './components/SplashScreen';
import { BurgerMenu } from './components/BurgerMenu';
import { IconFeed, IconDeals, IconWallet, IconProfile } from './components/NavIcons';
import {
  initialPosts,
  initialDeals,
  initialBalances,
  initialTransactions,
  initialFavorites,
  currentUser,
} from './store/mockStore';
import { initialAdCreatives, initialAdDeals } from './store/mockStore';
import { createWallet, holdFunds, payoutToUser, refundToUser } from './engine/walletEngine';
import { calculateFee } from './engine/feeEngine';
import { canTransition } from './config/statusConfig';
import { verifyJarPayment, fetchJarStatementLastHour } from './engine/monobankService';
import { MONO_CONFIG } from './config/monobank';

const TABS = [
  { id: 'feed', label: 'Каталог', Icon: IconFeed },
  { id: 'deals', label: 'Угоди', Icon: IconDeals },
  { id: 'wallet', label: 'Гаманець', Icon: IconWallet },
  { id: 'profile', label: 'Профіль', Icon: IconProfile },
];

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [activeSection, setActiveSection] = useState('feed');
  const [posts, setPosts] = useState(initialPosts);
  const [deals, setDeals] = useState(initialDeals);
  const [adDeals, setAdDeals] = useState(initialAdDeals);
  const [adCreatives, setAdCreatives] = useState(initialAdCreatives);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [balances, setBalances] = useState(initialBalances);
  const [wallet, setWallet] = useState(
    createWallet({
      availableBalance: initialBalances[currentUser.username] ?? 0,
      escrowBalance: 0,
      transactions: initialTransactions,
    })
  );
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeDeal, setActiveDeal] = useState(null);
  const [activeAdDeal, setActiveAdDeal] = useState(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [analyticsPost, setAnalyticsPost] = useState(null);
  const [processedTopUps, setProcessedTopUps] = useState([]);

  const balance = wallet.availableBalance;

  const handleBurgerNavigate = (id) => {
    if (id === 'create') {
      setActiveTab('feed');
      setActiveSection('feed');
      setCreateModalOpen(true);
      setBurgerOpen(false);
      return;
    }
    const tabMap = {
      channel: 'feed',
      job: 'feed',
      service: 'feed',
      ad: 'feed',
      favorites: 'feed',
      'my-posts': 'profile',
      deals: 'deals',
      wallet: 'wallet',
      profile: 'profile',
      settings: 'profile',
    };
    setActiveSection(id);
    setActiveTab(tabMap[id] || 'feed');
    setSelectedPost(null);
    if (id !== 'deals') setActiveDeal(null);
  };

  useEffect(() => {
    const t = setTimeout(() => setFeedLoading(false), 600);
    return () => clearTimeout(t);
  }, [splashDone]);

  // Poll Monobank jar API every 60s to detect TopUp_ payments into the jar and update balance once.
  useEffect(() => {
    let cancelled = false;

    const checkTopUps = async () => {
      try {
        const data = await fetchJarStatementLastHour();
        if (cancelled || !data.length) return;

        const newTopUps = data.filter((tx) => {
          if (!tx) return false;
          const comment = typeof tx.comment === 'string' ? tx.comment : '';
          const desc = typeof tx.description === 'string' ? tx.description : '';
          const hasMarker = comment.includes('TopUp_') || desc.includes('TopUp_');
          const notProcessed = !processedTopUps.includes(tx.id);
          if (hasMarker && notProcessed) {
            console.log('Found transaction:', tx);
          }
          return hasMarker && notProcessed;
        });

        if (!newTopUps.length) return;

        setProcessedTopUps((prev) => [...prev, ...newTopUps.map((tx) => tx.id)]);

        newTopUps.forEach((tx) => {
          const amount = tx.amount || 0; // already normalized to UAH in fetchJarStatementLastHour
          if (amount <= 0) return;

          // Update wallet & balances for current user only.
          setWallet((prev) =>
            createWallet({
              availableBalance: prev.availableBalance + amount,
              escrowBalance: prev.escrowBalance,
              transactions: [
                {
                  id: `tx-${tx.id}`,
                  type: 'topup',
                  amount,
                  label: 'Поповнення через Monobank',
                  date: new Date((tx.time || Date.now() / 1000) * 1000).toLocaleString('uk-UA'),
                },
                ...(prev.transactions || []),
              ],
            })
          );

          setBalances((prev) => ({
            ...prev,
            [currentUser.username]: (prev[currentUser.username] ?? 0) + amount,
          }));

          setNotifications((prev) => [
            {
              id: `n-${Date.now()}`,
              type: 'topup',
              message: `Успішне поповнення на ${amount} грн (Monobank jar ${MONO_CONFIG.JAR_ID}).`,
              createdAt: 'щойно',
            },
            ...prev,
          ]);
        });
      } catch (e) {
        console.error('Monobank top-up polling error', e);
      }
    };

    checkTopUps();
    const interval = setInterval(checkTopUps, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [processedTopUps]);

  // Poll Monobank jar API every 60s while користувач дивиться на активну рекламну угоду.
  useEffect(() => {
    if (!activeAdDeal) return undefined;

    let cancelled = false;

    const checkPayment = async () => {
      try {
        const paid = await verifyJarPayment(activeAdDeal.id);
        if (!paid || cancelled) return;

        // Позначаємо угоду як оплаченою (paymentStatus), не змінюючи основний статус.
        setAdDeals((prev) =>
          prev.map((d) =>
            d.id === activeAdDeal.id ? { ...d, paymentStatus: 'PAID' } : d
          )
        );
        setActiveAdDeal((prev) =>
          prev ? { ...prev, paymentStatus: 'PAID' } : prev
        );

        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            type: 'deal_paid',
            message: `Отримано оплату через Monobank для угоди "${activeAdDeal.title}". Кошти в холді.`,
            createdAt: 'щойно',
          },
          ...prev,
        ]);
      } catch (e) {
        console.error('verifyJarPayment error', e);
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeAdDeal]);

  const handleTopUp = (rawAmount) => {
    const amount = rawAmount && rawAmount > 0 ? rawAmount : 500;
    setWallet((prev) =>
      createWallet({
        availableBalance: prev.availableBalance + amount,
        escrowBalance: prev.escrowBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'topup',
            amount,
            label: 'Поповнення',
            date: 'щойно',
          },
          ...(prev.transactions || []),
        ],
      })
    );
    setBalances((prev) => ({
      ...prev,
      [currentUser.username]: (prev[currentUser.username] ?? 0) + amount,
    }));
  };

  const handleWithdraw = (amount) => {
    setWallet((prev) =>
      createWallet({
        availableBalance: prev.availableBalance - amount,
        escrowBalance: prev.escrowBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'out',
            amount,
            label: 'Виведення',
            date: 'щойно',
          },
          ...(prev.transactions || []),
        ],
      })
    );
    setBalances((prev) => ({
      ...prev,
      [currentUser.username]: (prev[currentUser.username] ?? 0) - amount,
    }));
  };

  const handleOpenPost = (post) => setSelectedPost(post);
  const handleBackToFeed = () => setSelectedPost(null);

  const handleToggleFavorite = (postId) => {
    setFavorites((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleStartDeal = (post) => {
    const amount = post.budget || 0;
    if (amount > 0 && balance < amount) return;

    const newDeal = {
      id: `d-${Date.now()}`,
      taskId: post.id,
      title: post.title,
      amount: post.budget || 0,
      buyer: currentUser.username,
      seller: post.author.username,
      status: 'active',
      createdAtLabel: 'щойно',
      escrow: {},
    };

    setDeals((prev) => [newDeal, ...prev]);
    if (amount > 0) {
      setWallet((prev) =>
        holdFunds(prev, amount, {
          label: `Замовлення: ${post.title}`,
        })
      );
      setBalances((prev) => ({
        ...prev,
        [currentUser.username]: (prev[currentUser.username] ?? 0) - amount,
      }));
    }
    setActiveDeal(newDeal);
    setActiveAdDeal(null);
    setSelectedPost(null);
    setActiveTab('deals');
  };

  const handleUpdateDeal = (id, patch) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...patch, escrow: { ...(d.escrow || {}), ...(patch.escrow || {}) } } : d
      )
    );
    if (activeDeal?.id === id) {
      setActiveDeal((prev) =>
        prev ? { ...prev, ...patch, escrow: { ...(prev.escrow || {}), ...(patch.escrow || {}) } } : prev
      );
    }
  };

  const handleCompleteDeal = (id) => {
    const deal = deals.find((d) => d.id === id);
    if (deal && deal.amount > 0) {
      // Виплата з escrow для звичайної Safe Deal
      setWallet((prev) =>
        payoutToUser(prev, deal.amount, {
          label: `Виконано: ${deal.title}`,
        })
      );
      setBalances((prev) => ({
        ...prev,
        [deal.seller]: (prev[deal.seller] ?? 0) + deal.amount,
      }));
    }
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'completed' } : d)));
    if (activeDeal?.id === id) setActiveDeal((prev) => (prev ? { ...prev, status: 'completed' } : prev));
  };

  const handleDisputeDeal = (id) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'dispute_resolved' } : d))
    );
    if (activeDeal?.id === id) {
      setActiveDeal((prev) => (prev ? { ...prev, status: 'dispute_resolved' } : prev));
    }
  };

  const handleOpenDeal = (deal) => {
    setActiveDeal(deal);
    setActiveAdDeal(null);
    setActiveTab('deals');
  };

  const handleBackFromDeal = () => setActiveDeal(null);

  // --- Advertising marketplace: AdCreatives & AdDeals ---

  const handleCreateAdCreative = (data) => {
    const newCreative = {
      id: `ac-${Date.now()}`,
      title: data.title,
      text: data.text,
      mediaUrl: data.mediaUrl || '',
      ctaLink: data.ctaLink || '',
      authorId: currentUser.username,
      status: data.status || 'draft',
    };
    setAdCreatives((prev) => [newCreative, ...prev]);
  };

  const handleCreateAdDeal = ({ channelPost, slot, creative, scheduledAt }) => {
    const escrowAmount = slot.price || 0;
    if (escrowAmount > 0 && balance < escrowAmount) return;

    // validate status transition draft -> pending_approval
    if (!canTransition('draft', 'pending_approval')) {
      throw new Error('Invalid AdDeal status transition: draft → pending_approval');
    }

    const newAdDeal = {
      id: `ad-${Date.now()}`,
      advertiserId: currentUser.username,
      channelOwnerId: channelPost.author.username,
      creativeId: creative.id,
      slotId: slot.id,
      scheduledAt,
      status: 'pending_approval',
      escrowAmount,
      postUrl: '',
      messages: [],
      title: `Реклама в ${channelPost.channel?.username || channelPost.title}`,
      channelPostId: channelPost.id,
      createdAtLabel: 'щойно',
      type: 'ad',
      timeline: [{ type: 'created', at: 'щойно' }],
    };

    setAdDeals((prev) => [newAdDeal, ...prev]);

    if (escrowAmount > 0) {
      setWallet((prev) =>
        holdFunds(prev, escrowAmount, {
          label: `Холд для реклами: ${channelPost.title}`,
        })
      );
      setBalances((prev) => ({
        ...prev,
        [currentUser.username]: (prev[currentUser.username] ?? 0) - escrowAmount,
      }));
    }
  };

  const handleUpdateAdDeal = (id, patch) => {
    setAdDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    if (activeAdDeal?.id === id) {
      setActiveAdDeal((prev) => (prev ? { ...prev, ...patch } : prev));
    }
  };

  const handlePublishAdDeal = (id, postUrl) => {
    const deal = adDeals.find((d) => d.id === id);
    if (!deal) return;
    if (!canTransition(deal.status, 'published')) {
      throw new Error(`Invalid AdDeal status transition: ${deal.status} → published`);
    }
    handleUpdateAdDeal(id, {
      status: 'published',
      postUrl,
      timeline: [...(deal.timeline || []), { type: 'published', at: 'щойно' }],
    });
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        type: 'deal_published',
        message: `Рекламну угоду "${deal.title}" позначено як опубліковану`,
        createdAt: 'щойно',
      },
      ...prev,
    ]);
  };

  const handleCompleteAdDeal = (id) => {
    const deal = adDeals.find((d) => d.id === id);
    if (!deal || deal.status === 'completed') return;

    if (!canTransition(deal.status, 'completed')) {
      throw new Error(`Invalid AdDeal status transition: ${deal.status} → completed`);
    }

    if (deal.escrowAmount > 0) {
      const fee = calculateFee(deal.escrowAmount);
      const net = deal.escrowAmount - fee;

      // payout from current user's wallet escrow
      setWallet((prev) =>
        payoutToUser(prev, deal.escrowAmount, {
          label: `Виплата за рекламу: ${deal.title}`,
        })
      );

      setBalances((prev) => ({
        ...prev,
        [deal.channelOwnerId]: (prev[deal.channelOwnerId] ?? 0) + net,
      }));
    }

    handleUpdateAdDeal(id, {
      status: 'completed',
      timeline: [...(deal.timeline || []), { type: 'completed', at: 'щойно' }],
    });

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        type: 'deal_completed',
        message: `Рекламну угоду "${deal.title}" завершено`,
        createdAt: 'щойно',
      },
      ...prev,
    ]);
  };

  const handleDisputeAdDeal = (id, message) => {
    const baseMessage = message || 'Спір по рекламному розміщенню. Потрібна модерація.';
    setAdDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'dispute',
              messages: [
                ...(d.messages || []),
                {
                  id: `m-${Date.now()}`,
                  authorId: currentUser.username,
                  text: baseMessage,
                  createdAt: 'щойно',
                  system: false,
                },
              ],
            }
          : d
      )
    );
    if (activeAdDeal?.id === id) {
      setActiveAdDeal((prev) =>
        prev
          ? {
              ...prev,
              status: 'dispute',
              messages: [
                ...(prev.messages || []),
                {
                  id: `m-${Date.now()}`,
                  authorId: currentUser.username,
                  text: baseMessage,
                  createdAt: 'щойно',
                  system: false,
                },
              ],
            }
          : prev
      );
    }

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        type: 'dispute_opened',
        message: `Відкрито спір по рекламній угоді`,
        createdAt: 'щойно',
      },
      ...prev,
    ]);
  };

  const handleOpenAdDeal = (deal) => {
    setActiveAdDeal(deal);
    setActiveDeal(null);
    setActiveTab('deals');
  };

  const handleBackFromAdDeal = () => setActiveAdDeal(null);

  const goToWallet = () => {
    setSelectedPost(null);
    setActiveTab('wallet');
  };

  const handleCreatePost = (data) => {
    const metaMap = {
      task: { label: 'Бюджет', value: `${data.budget} грн` },
      job: { label: 'Зарплата', value: `${data.budget} грн/міс` },
      service: { label: 'Від', value: `${data.budget} грн` },
      channel: { label: 'Підписники', value: data.meta || '—' },
      ad: { label: 'Охват', value: data.meta || '—' },
      opportunity: { label: 'Винагорода', value: `${data.budget} грн` },
    };
    const newPost = {
      id: `p-${Date.now()}`,
      type: data.type || 'task',
      category: data.category || 'tech',
      title: data.title,
      shortDescription: (data.description || '').slice(0, 80),
      description: data.description || '',
      budget: data.budget || 0,
      meta: metaMap[data.type] || { label: 'Бюджет', value: `${data.budget} грн` },
      deadline: data.deadline || 'гнучко',
      createdAt: 'щойно',
      author: {
        username: currentUser.username,
        avatarColor: currentUser.avatarColor,
        trustScore: currentUser.trustScore,
        completedDeals: currentUser.completedDeals,
      },
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const renderContent = () => {
    if (activeTab === 'feed') {
      if (analyticsPost) {
        return (
          <ChannelAnalytics
            post={analyticsPost}
            onBack={() => setAnalyticsPost(null)}
          />
        );
      }
      if (selectedPost) {
        return (
          <PostDetails
            post={selectedPost}
            onBack={handleBackToFeed}
            onStartDeal={handleStartDeal}
            adCreatives={adCreatives.filter((c) => c.authorId === currentUser.username)}
            onCreateAdDeal={handleCreateAdDeal}
            balance={balance}
            onOpenAnalytics={() => setAnalyticsPost(selectedPost)}
          />
        );
      }
      return (
        <Feed
          posts={posts}
          favorites={favorites}
          onOpenPost={handleOpenPost}
          onToggleFavorite={handleToggleFavorite}
          catalogSection={activeSection === 'favorites' ? 'favorites' : ['channel', 'job', 'service', 'ad'].includes(activeSection) ? activeSection : null}
          showTrending={activeSection === 'feed' || !['channel', 'job', 'service', 'ad', 'favorites'].includes(activeSection)}
          loading={feedLoading}
        />
      );
    }

    if (activeTab === 'deals') {
      if (activeDeal) {
        return (
          <EscrowDemo
            deal={activeDeal}
            onUpdateDeal={handleUpdateDeal}
            onComplete={handleCompleteDeal}
            onDispute={handleDisputeDeal}
            onBack={handleBackFromDeal}
          />
        );
      }
      if (activeAdDeal) {
        const creative = adCreatives.find((c) => c.id === activeAdDeal.creativeId);
        return (
          <AdDealDetails
            deal={activeAdDeal}
            creative={creative}
            onBack={handleBackFromAdDeal}
            onPublish={handlePublishAdDeal}
            onComplete={handleCompleteAdDeal}
            onDispute={handleDisputeAdDeal}
          />
        );
      }
      // Для рекламних угод буде окремий режим у DealsCenter
      return (
        <DealsCenter
          deals={deals}
          adDeals={adDeals}
          onOpenDeal={handleOpenDeal}
          onOpenAdDeal={handleOpenAdDeal}
        />
      );
    }

    if (activeTab === 'wallet') {
      return (
        <Wallet
          balance={balance}
          transactions={wallet.transactions}
          onTopUp={handleTopUp}
          onWithdraw={handleWithdraw}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <Profile
          user={currentUser}
          balance={balance}
          deals={deals}
          posts={posts}
          adCreatives={adCreatives}
          adDeals={adDeals}
          onOpenDeal={handleOpenDeal}
          onOpenAdDeal={handleOpenAdDeal}
          onCreateAdCreative={handleCreateAdCreative}
          onGoToWallet={goToWallet}
          onGoToCreate={() => { setActiveTab('feed'); setActiveSection('feed'); setCreateModalOpen(true); }}
        />
      );
    }

    return null;
  };

  const showFab = activeTab === 'feed' && !selectedPost;

  return (
    <div className="app">
      {!splashDone && <SplashScreen onEnter={() => setSplashDone(true)} />}

      <BurgerMenu
        open={burgerOpen}
        onClose={() => setBurgerOpen(false)}
        activeSection={activeSection}
        onNavigate={handleBurgerNavigate}
      />

      <div className="app-inner">
        <header className="app-header">
          <button
            type="button"
            className="app-header__burger"
            onClick={() => setBurgerOpen(true)}
            aria-label="Меню"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="app-header__center">
            <div className="app-logo">SafeDeal</div>
            <div className="app-tagline">Поповни — замови — отримай</div>
          </div>
          <button
            type="button"
            className="app-header__bell"
            aria-label="Сповіщення"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="app-header__bell-count">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
        </header>

        <main className="app-main">{renderContent()}</main>

        <NotificationsPanel
          open={showNotifications}
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />

        {showFab && (
          <FloatingCreateButton
            onCreate={handleCreatePost}
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
          />
        )}

        <nav className="bottom-nav">
          {TABS.map((tab) => {
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`bottom-nav__item ${activeTab === tab.id ? 'bottom-nav__item--active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSection(tab.id);
                  setSelectedPost(null);
                  if (tab.id !== 'deals') setActiveDeal(null);
                }}
              >
                <span className="bottom-nav__icon">
                  <Icon />
                </span>
                <span className="bottom-nav__label">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
