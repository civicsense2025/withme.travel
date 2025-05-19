import React from 'react';
import { cn } from '@/lib/utils';
import {
  Utensils,
  Wine,
  Map,
  Camera,
  Compass,
  Music,
  Mountain,
  Building,
  Coffee,
  Heart,
  Calendar,
  Users,
  Star,
  ShoppingBag
} from 'lucide-react';

export interface ActivityIconProps {
  type: string;
  className?: string;
  color?: string;
  size?: number;
}

export function ActivityIcon({ type, className, color, size = 20 }: ActivityIconProps) {
  const getIcon = () => {
    const props = {
      className: cn('', className),
      color,
      size
    };

    // Map activity types to icons
    switch (type?.toLowerCase()) {
      case 'food':
      case 'restaurant':
      case 'dining':
        return <Utensils {...props} />;
      case 'drink':
      case 'bar':
      case 'pub':
      case 'wine':
        return <Wine {...props} />;
      case 'sightseeing':
      case 'tour':
        return <Map {...props} />;
      case 'photography':
      case 'photo':
        return <Camera {...props} />;
      case 'adventure':
      case 'explore':
        return <Compass {...props} />;
      case 'concert':
      case 'music':
      case 'show':
        return <Music {...props} />;
      case 'hiking':
      case 'nature':
      case 'outdoors':
        return <Mountain {...props} />;
      case 'museum':
      case 'gallery':
      case 'history':
        return <Building {...props} />;
      case 'cafe':
      case 'coffee':
        return <Coffee {...props} />;
      case 'wellness':
      case 'spa':
      case 'health':
        return <Heart {...props} />;
      case 'event':
      case 'festival':
        return <Calendar {...props} />;
      case 'social':
      case 'meetup':
        return <Users {...props} />;
      case 'shopping':
      case 'market':
        return <ShoppingBag {...props} />;
      case 'featured':
      case 'highlight':
        return <Star {...props} />;
      default:
        return <Calendar {...props} />;
    }
  };

  return getIcon();
} 