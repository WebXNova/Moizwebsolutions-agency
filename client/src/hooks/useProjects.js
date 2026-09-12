import { useEffect, useState } from 'react';
import { getFallbackProjects } from '@/data/projects';
import * as projectService from '@/services/projectService';

/**
 * @param {{ featured?: boolean; categoryId?: string }} [params]
 */
export function useProjects(params = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    projectService
      .getProjects(params)
      .then((data) => {
        if (!active) return;
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        // Never surface API/transport copy on the public site.
        setProjects(getFallbackProjects(params));
        setError(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.featured, params.categoryId]);

  return { projects, loading, error };
}
