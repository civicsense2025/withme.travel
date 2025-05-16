/**
 * AuthModal Component
 * 
 * A modal dialog that handles user authentication with context-aware content
 * and features based on where the authentication is triggered from.
 */

'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '../molecules/LoginForm';
import { useEffect } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuthModal } from '@/app/context/auth-modal-context';
import { getAuthModalContent } from '@/app/context/auth-modal-content';
import {
  ClipboardList,
  Heart,
  Users,
  MessageCircle,
  Calendar,
  UserPlus,
  Bookmark,
  Star,
  Edit,
  Share2,
  Bell,
  Lock,
  PieChart,
  MessageSquare,
  Map,
  MapPin,
  ThumbsUp,
  Plus,
  Clock,
  Edit2,
  Save,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthModalProps {
  /** Whether the modal is open (for prop-based usage) */
  isOpen?: boolean;
  /** Function to call when the modal is closed (for prop-based usage) */
  onClose?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Icon mapping for dynamic icon rendering
const ICONS: Record<string, React.ReactNode> = {
  clipboard: <ClipboardList className="h-6 w-6 text-primary mt-1" />,
  heart: <Heart className="h-6 w-6 text-primary mt-1" />,
  users: <Users className="h-6 w-6 text-primary mt-1" />,
  messageCircle: <MessageCircle className="h-6 w-6 text-primary mt-1" />,
  calendar: <Calendar className="h-6 w-6 text-primary mt-1" />,
  userPlus: <UserPlus className="h-6 w-6 text-primary mt-1" />,
  bookmark: <Bookmark className="h-6 w-6 text-primary mt-1" />,
  star: <Star className="h-6 w-6 text-primary mt-1" />,
  edit: <Edit className="h-6 w-6 text-primary mt-1" />,
  share2: <Share2 className="h-6 w-6 text-primary mt-1" />,
  bell: <Bell className="h-6 w-6 text-primary mt-1" />,
  lock: <Lock className="h-6 w-6 text-primary mt-1" />,
  pieChart: <PieChart className="h-6 w-6 text-primary mt-1" />,
  messageSquare: <MessageSquare className="h-6 w-6 text-primary mt-1" />,
  map: <Map className="h-6 w-6 text-primary mt-1" />,
  mapPin: <MapPin className="h-6 w-6 text-primary mt-1" />,
  thumbsUp: <ThumbsUp className="h-6 w-6 text-primary mt-1" />,
  plus: <Plus className="h-6 w-6 text-primary mt-1" />,
  clock: <Clock className="h-6 w-6 text-primary mt-1" />,
  edit2: <Edit2 className="h-6 w-6 text-primary mt-1" />,
  save: <Save className="h-6 w-6 text-primary mt-1" />,
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AuthModal presents a context-aware authentication dialog
 */
export function AuthModal() {
  // Use our auth modal context instead of passing props
  const { isOpen, context, abTestVariant, close, trackEvent } = useAuthModal();

  // Get the appropriate content for this context and A/B test variant
  const content = getAuthModalContent(context, abTestVariant);

  // Track modal view for analytics
  useEffect(() => {
    if (isOpen) {
      trackEvent('auth_modal_viewed', {
        context,
        abTestVariant,
        content: {
          title: content.title,
          description: content.description,
        },
      });
    }
  }, [isOpen, context, abTestVariant, content, trackEvent]);

  // Dynamically render features based on the context and A/B test variant
  const renderFeatures = () => {
    if (!content.features || content.features.length === 0) return null;

    return (
      <div className="space-y-6">
        {content.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            {ICONS[feature.icon] || <Users className="h-6 w-6 text-primary mt-1" />}
            <div>
              <h3 className="font-medium mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign in to withme.travel</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gradient-to-br from-teal-500/20 via-primary/20 to-purple-500/20 p-8">
            <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
            <p className="mb-8">{content.description}</p>
            {renderFeatures()}
          </div>

          <div className="p-8 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm
                onSuccess={() => {
                  trackEvent('auth_modal_login_success', { context, abTestVariant });
                  close();
                }}
                primaryButtonText={content.primaryButtonText}
                context={context}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Legacy wrapper component for backwards compatibility
 */
export function AuthModalWithProps({ isOpen, onClose }: AuthModalProps) {
  const { open, close } = useAuthModal();

  // Connect the prop-based open state to the context-based modal
  useEffect(() => {
    if (isOpen) {
      open('default');
    } else {
      close();
    }
  }, [isOpen, open, close]);

  return null; // The actual modal is rendered by the AuthModalProvider
} 