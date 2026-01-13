import { useSecureImage } from '@/hooks/useSecureImage';
import { cn } from '@/lib/utils';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined | null;
  fallback?: React.ReactNode;
}

export function SecureImage({ src, className, fallback, alt, ...props }: SecureImageProps) {
  const imageUrl = useSecureImage(src);

  if (!imageUrl || imageUrl === '/placeholder.svg') {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <img src="/placeholder.svg" alt={alt} className={className} {...props} />;
  }

  return <img src={imageUrl} alt={alt} className={className} {...props} />;
}
