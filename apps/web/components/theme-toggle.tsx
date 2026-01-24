'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-9 w-9 rounded-md border border-input bg-background" disabled>
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (theme === 'dark') setTheme('light');
        else if (theme === 'light') setTheme('system');
        else setTheme('dark');
      }}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' && <Moon className="h-4 w-4" />}
      {theme === 'light' && <Sun className="h-4 w-4" />}
      {theme === 'system' && <Monitor className="h-4 w-4" />}
    </button>
  );
}
