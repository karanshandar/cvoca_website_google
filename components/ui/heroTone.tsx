import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

export type HeroTone = 'dark' | 'light';

interface HeroToneContextValue {
  tone: HeroTone | null;
  setTone: (tone: HeroTone | null) => void;
}

const HeroToneContext = createContext<HeroToneContextValue>({ tone: null, setTone: () => {} });

// Lets the PageHero on screen tell the Header whether it sits over a dark or light hero.
// null = no hero on screen.
export const HeroToneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tone, setTone] = useState<HeroTone | null>(null);
  const value = useMemo(() => ({ tone, setTone }), [tone]);
  return <HeroToneContext.Provider value={value}>{children}</HeroToneContext.Provider>;
};

/** Called by PageHero. Set before paint so the header never flashes the wrong colour. */
export function useSetHeroTone(tone: HeroTone) {
  const { setTone } = useContext(HeroToneContext);
  useLayoutEffect(() => {
    setTone(tone);
    return () => setTone(null);
  }, [tone, setTone]);
}

export function useHeroTone(): HeroTone | null {
  return useContext(HeroToneContext).tone;
}
