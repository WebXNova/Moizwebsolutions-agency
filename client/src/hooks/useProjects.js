import { useEffect, useState } from 'react';
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
        if (active) setProjects(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load projects.');
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
