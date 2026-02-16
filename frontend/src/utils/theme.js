export const THEME_KEY = 'tap_attendance_theme';
export const THEME_LIGHT = 'theme-light';
export const THEME_BLUE = 'theme-blue';

const LEGACY_LIGHT = 'light';
const LEGACY_DARK = 'dark';

const normalizeTheme = (value) => {
  if (value === THEME_LIGHT || value === LEGACY_LIGHT) {
    return THEME_LIGHT;
  }

  if (value === THEME_BLUE || value === LEGACY_DARK) {
    return THEME_BLUE;
  }

  return THEME_BLUE;
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return THEME_BLUE;
  }

  return normalizeTheme(window.localStorage.getItem(THEME_KEY));
};

export const applyTheme = (theme) => {
  const nextTheme = normalizeTheme(theme);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove(THEME_LIGHT, THEME_BLUE, 'light-mode');
    root.classList.add(nextTheme);
    root.style.colorScheme = nextTheme === THEME_LIGHT ? 'light' : 'dark';
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }

  return nextTheme;
};
