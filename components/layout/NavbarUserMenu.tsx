import React from 'react';
import UserMenu from './user-menu';

// UserMenu uses useAuth internally, so no props are needed here.
export function NavbarUserMenu() {
  return <UserMenu />;
}
