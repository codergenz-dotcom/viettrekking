import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/axios';

/**
 * Hook để fetch ảnh từ backend có authentication
 * @param imageUrl - Path như /api/v1/images/{id} hoặc external URL
 * @returns blobUrl - URL có thể dùng trong <img src>
 */
export function useSecureImage(imageUrl: string | undefined | null): string {
  const [blobUrl, setBlobUrl] = useState<string>('/placeholder.svg');
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setBlobUrl('/placeholder.svg');
      return;
    }

    if (previousUrlRef.current === imageUrl && blobUrl !== '/placeholder.svg') {
      return;
    }
    previousUrlRef.current = imageUrl;

    let isCancelled = false;
    let objectUrl: string | null = null;

    const fetchImage = async (path: string) => {
      try {
        const response = await api.get(path, { responseType: 'blob' });
        if (!isCancelled) {
          objectUrl = URL.createObjectURL(response.data);
          setBlobUrl(objectUrl);
        }
      } catch (error) {
        console.error('Failed to fetch secure image:', path, error);
        if (!isCancelled) {
          setBlobUrl('/placeholder.svg');
        }
      }
    };

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '';
      if (baseURL && imageUrl.startsWith(baseURL)) {
        const path = imageUrl.replace(baseURL, '');
        fetchImage(path);
      } else {
        setBlobUrl(imageUrl);
      }
      return;
    }

    if (imageUrl.startsWith('/api/')) {
      fetchImage(imageUrl);
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(imageUrl)) {
      const path = `/api/v1/images/${imageUrl}`;
      fetchImage(path);
      return;
    }

    setBlobUrl(imageUrl);

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl]);

  return blobUrl;
}
