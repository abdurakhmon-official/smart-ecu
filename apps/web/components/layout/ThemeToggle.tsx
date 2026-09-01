'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';

// SSR/klientning birinchi (hydration) render'ida bir xil natija kafolatlanadi — useEffect+setState o'rniga.
const noopSubscribe = () => () => {};
const useHasMounted = (): boolean => useSyncExternalStore(noopSubscribe, () => true, () => false);

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      className="size-9 px-0"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {mounted && resolvedTheme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
