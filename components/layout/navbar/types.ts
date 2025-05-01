import { User } from '@supabase/supabase-js';

export interface NavbarMobileProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export interface UserMenuProps {
  user: User;
}

export interface MobileNavProps {
  onNavClick?: () => void;
}
