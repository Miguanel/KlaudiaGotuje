import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

/**
 * Miejsca na stronie, w których administratorka może podmienić grafikę.
 * Klucze muszą zgadzać się z SITE_IMAGE_KEYS w recipes/api.py.
 */
export type SiteImageKey = 'tlo-strony' | 'tlo-logo' | 'tlo-skrotow' | 'tlo-przepisow' | 'o-mnie';

type Images = Partial<Record<SiteImageKey, string>>;

// Wspólna pamięć podręczna + subskrybenci (po wgraniu grafiki wszystkie widoki od razu się odświeżają)
let cache: Images | null = null;
let pending: Promise<Images> | null = null;
const listeners = new Set<(data: Images) => void>();

function load(): Promise<Images> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = apiClient.siteImages.getAll()
      .then(list => {
        cache = Object.fromEntries(list.map(i => [i.key, i.image_url])) as Images;
        return cache;
      })
      .catch(err => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

function publish(next: Images) {
  cache = next;
  listeners.forEach(fn => fn(next));
}

export function useSiteImages() {
  const [images, setImages] = useState<Images>(cache ?? {});

  useEffect(() => {
    let alive = true;
    const onChange = (data: Images) => { if (alive) setImages(data); };
    listeners.add(onChange);
    load().then(onChange).catch(err => console.error('Błąd pobierania grafik strony:', err));
    return () => { alive = false; listeners.delete(onChange); };
  }, []);

  /** Pełny adres grafiki albo null, jeśli w tym miejscu nic nie wgrano. */
  const url = (key: SiteImageKey): string | null =>
    images[key] ? apiClient.utils.getImageUrl(images[key]!) : null;

  const upload = async (key: SiteImageKey, file: File, token: string) => {
    const saved = await apiClient.siteImages.upload(key, file, token);
    publish({ ...(cache ?? {}), [key]: saved.image_url });
  };

  const remove = async (key: SiteImageKey, token: string) => {
    await apiClient.siteImages.remove(key, token);
    const next = { ...(cache ?? {}) };
    delete next[key];
    publish(next);
  };

  return { url, upload, remove };
}
