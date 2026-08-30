export const THEME_STORAGE_KEY = 'mws-theme';

/** @typedef {'light' | 'dark' | 'system'} ThemePreference */
/** @typedef {'light' | 'dark'} ResolvedTheme */

/** @returns {boolean} */
export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** @returns {ThemePreference} */
export function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

/** @param {ThemePreference} preference */
export function resolveTheme(preference) {
  return preference === 'system' ? getSystemTheme() : preference;
}

/** @param {ResolvedTheme} theme */
export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  window.setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 250);
}

/** @param {ThemePreference} preference */
export function persistTheme(preference) {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
}
