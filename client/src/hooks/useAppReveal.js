import { useEffect } from 'react';
import { dismissBootLoader } from '@/lib/appBoot';

/**
 * When `ready` becomes true, reveals the app and dismisses the HTML boot loader.
 *
 * @param {boolean} ready
 */
export function useAppReveal(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    dismissBootLoader();
    return undefined;
  }, [ready]);
}
