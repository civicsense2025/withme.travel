import React from 'react';
import { UserMenuDropdown } from './UserMenuDropdown';

export default {
  title: 'App Layout/UserMenuDropdown',
  component: UserMenuDropdown,
};

export const Default = () => (
  <div className="p-8 flex justify-end">
    <UserMenuDropdown
      name="Jane Doe"
      email="jane.doe@example.com"
      avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
    />
  </div>
);

export const WithInitials = () => (
  <div className="p-8 flex justify-end">
    <UserMenuDropdown name="John Smith" email="john.smith@example.com" />
  </div>
);

export const WithAllActions = () => (
  <div className="p-8 flex justify-end">
    <UserMenuDropdown
      name="Jane Doe"
      email="jane.doe@example.com"
      avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
      onProfileClick={() => alert('Profile clicked')}
      onSettingsClick={() => alert('Settings clicked')}
      onHelpClick={() => alert('Help & Support clicked')}
      onLogoutClick={() => alert('Logout clicked')}
    />
  </div>
);

export const LightMode = () => (
  <div className="p-8 flex justify-end">
    <UserMenuDropdown
      name="Jane Doe"
      email="jane.doe@example.com"
      avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
    />
  </div>
);
LightMode.parameters = {
  backgrounds: { default: 'light' },
  docs: { description: { story: 'UserMenuDropdown in light mode.' } },
};

export const DarkMode = () => (
  <div className="p-8 flex justify-end">
    <UserMenuDropdown
      name="Jane Doe"
      email="jane.doe@example.com"
      avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
    />
  </div>
);
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: { description: { story: 'UserMenuDropdown in dark mode.' } },
};
