(() => {
  'use strict';

  const STORAGE_KEY = 'gm-button-theme-v1';
  const SURFACE_STORAGE_KEY = 'gm-surface-theme-v1';
  const THEMES = new Set(['1', '2', '3', '4', '5']);
  const SURFACE_THEMES = new Set(['dark', 'smoke', 'paper']);
  const body = document.body;
  const options = Array.from(document.querySelectorAll('[data-button-theme-option]'));
  const surfaceOptions = Array.from(document.querySelectorAll('[data-surface-theme-option]'));

  const readSavedTheme = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.has(saved) ? saved : '1';
    } catch (_error) {
      return '1';
    }
  };

  const applyTheme = (theme, persist = true) => {
    const nextTheme = THEMES.has(theme) ? theme : '1';
    body.dataset.buttonTheme = nextTheme;

    options.forEach((option) => {
      const isActive = option.dataset.buttonThemeOption === nextTheme;
      option.classList.toggle('active', isActive);
      option.setAttribute('aria-pressed', String(isActive));
    });

    body.classList.remove('color-theme-pulse');
    requestAnimationFrame(() => body.classList.add('color-theme-pulse'));

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (_error) {
        // Preview remains usable when storage is unavailable.
      }
    }
  };

  const readSavedSurface = () => {
    try {
      const saved = localStorage.getItem(SURFACE_STORAGE_KEY);
      return SURFACE_THEMES.has(saved) ? saved : 'dark';
    } catch (_error) {
      return 'dark';
    }
  };

  const applySurface = (surface, persist = true) => {
    const nextSurface = SURFACE_THEMES.has(surface) ? surface : 'dark';
    body.dataset.surfaceTheme = nextSurface;
    surfaceOptions.forEach((option) => {
      const isActive = option.dataset.surfaceThemeOption === nextSurface;
      option.classList.toggle('active', isActive);
      option.setAttribute('aria-pressed', String(isActive));
    });
    if (persist) {
      try {
        localStorage.setItem(SURFACE_STORAGE_KEY, nextSurface);
      } catch (_error) {
        // Preview remains usable when storage is unavailable.
      }
    }
  };

  options.forEach((option) => {
    option.addEventListener('click', () => applyTheme(option.dataset.buttonThemeOption));
  });
  surfaceOptions.forEach((option) => {
    option.addEventListener('click', () => applySurface(option.dataset.surfaceThemeOption));
  });

  applyTheme(readSavedTheme(), false);
  applySurface(readSavedSurface(), false);
})();
