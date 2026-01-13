import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSecureImage } from '@/hooks/useSecureImage';
import { cn } from '@/lib/utils';

interface SecureAvatarProps {
  src: string | undefined | null;
  fallback?: React.ReactNode;
  className?: string;
}

export function SecureAvatar({ src, fallback, className }: SecureAvatarProps) {
  const imageUrl = useSecureImage(src);

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl !== '/placeholder.svg' ? imageUrl : undefined} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
