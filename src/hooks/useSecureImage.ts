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

    // Avoid re-fetching the same URL
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

    // External URL - check if it's our API
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '';
      // If it's our API URL, need to fetch with auth
      if (baseURL && imageUrl.startsWith(baseURL)) {
        const path = imageUrl.replace(baseURL, '');
        fetchImage(path);
      } else {
        // External URL, use directly
        setBlobUrl(imageUrl);
      }
      return;
    }

    // Backend path - fetch with auth
    if (imageUrl.startsWith('/api/')) {
      fetchImage(imageUrl);
      return;
    }

    // Assume it's an image ID - construct path
    // UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(imageUrl)) {
      const path = `/api/v1/images/${imageUrl}`;
      fetchImage(path);
      return;
    }

    // Unknown format, try to use as-is
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
