import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  resolveTheme,
} from '@/lib/theme';

/** @type {import('react').Context<{ preference: import('@/lib/theme').ThemePreference; resolved: import('@/lib/theme').ResolvedTheme; setPreference: (preference: import('@/lib/theme').ThemePreference) => void; cyclePreference: () => void; } | null>} */
export const ThemeContext = createContext(null);

const CYCLE_ORDER = /** @type {const} */ (['system', 'light', 'dark']);

/**
 * @param {{ children?: import('react').ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(getStoredTheme);
  const [resolved, setResolved] = useState(() => resolveTheme(getStoredTheme()));

  const setPreference = useCallback((next) => {
    persistTheme(next);
    setPreferenceState(next);
    setResolved(resolveTheme(next));
    applyTheme(resolveTheme(next));
  }, []);

  const cyclePreference = useCallback(() => {
    const index = CYCLE_ORDER.indexOf(preference);
    const next = CYCLE_ORDER[(index + 1) % CYCLE_ORDER.length];
    setPreference(next);
  }, [preference, setPreference]);

  useEffect(() => {
    applyTheme(resolveTheme(preference));
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const next = getSystemTheme();
      setResolved(next);
      applyTheme(next);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [preference]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cyclePreference }),
    [preference, resolved, setPreference, cyclePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
