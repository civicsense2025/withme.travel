import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', size = 'md', ...props }, ref) => {
    return (
      <div
        className={cn('avatar', `avatar-${size}`, className)}
        ref={ref}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">{alt.charAt(0)}</div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <img
        className={cn('avatar-image', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('avatar-fallback', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';
