import React, { useState, useEffect } from 'react';
import { SkeletonCard } from './SkeletonCard';

export function SplashScreen({ onEnter }) {
  const [phase, setPhase] = useState('logo');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 500);
    const t2 = setTimeout(() => setPhase('ready'), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    setPhase('exit');
    setTimeout(() => {
      setVisible(false);
      onEnter?.();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`splash ${phase}`}
      onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
      role="presentation"
    >
      <div className="splash__bg" />
      <div className="splash__content">
        <h1 className="splash__logo">SafeDeal OS</h1>
        <p className={`splash__tagline ${phase}`}>
          Ваш безпечний Telegram marketplace
        </p>

        <div className="splash__skeletons">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <button
          type="button"
          className={`splash__cta ${phase}`}
          onClick={handleEnter}
        >
          Перейти до каталогу
        </button>
      </div>
    </div>
  );
}
