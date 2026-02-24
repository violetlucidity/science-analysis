/**
 * Hook for managing dark mode state with localStorage persistence.
 *
 * Persists the user's dark mode preference to localStorage and applies
 * the 'dark' class to the document root element.
 */
import { useState, useEffect } from 'react';

const DARK_MODE_KEY = 'sci-reader-dark-mode';

/**
 * Manages dark mode toggle state, reading from and persisting to localStorage.
 * Applies the 'dark' class to the document root for Tailwind dark mode support.
 *
 * @returns A tuple [isDark, toggleDark] for reading and toggling dark mode.
 */
export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) return stored === 'true';
    } catch {
      // localStorage unavailable
    }
    // Default to system preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_KEY, String(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((d) => !d);

  return [isDark, toggleDark];
}
