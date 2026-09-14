import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as cmsService from '@/services/cmsService';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await cmsService.getSiteContent();
      setContent(data);
      setError('');
    } catch {
      setContent(null);
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ content, loading, error, refresh }),
    [content, loading, error, refresh],
  );

  return (
    <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}

/**
 * @template T
 * @param {T} fallback
 * @param {(content: NonNullable<ReturnType<typeof useSiteContent>['content']>) => T | null | undefined} selector
 */
export function useContentSection(fallback, selector) {
  const { content, loading } = useSiteContent();
  const value = content ? selector(content) : null;
  return { data: value ?? fallback, loading, fromApi: Boolean(value) };
}
