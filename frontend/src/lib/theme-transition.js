'use client';

export function toggleThemeWithViewTransition(resolvedTheme, setTheme) {
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  if (!document.startViewTransition) {
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    return;
  }

  document.startViewTransition(() => {
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  });
}
