import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Tag } from '../types';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient.tags.getAll()
      .then(data => {
        if (isMounted) {
          setTags(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Błąd pobierania tagów:", err);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return { tags, loading };
}