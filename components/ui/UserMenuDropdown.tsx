import React, { useState, useRef, useEffect } from 'react';

export interface UserMenuDropdownProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * UserMenuDropdown displays a user avatar with a dropdown menu with various actions.
 * @example <UserMenuDropdown name="Jane Doe" onLogoutClick={handleLogout} />
 */
export function UserMenuDropdown({
  name,
  email,
  avatarUrl,
  onProfileClick,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
}: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate initials as fallback for avatar
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-2 transition-colors"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${name}'s avatar`} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
              {initials}
            </div>
          )}
        </div>
        <span className="font-medium">{name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-900">{name}</p>
            {email && <p className="text-sm text-gray-500 truncate">{email}</p>}
          </div>

          <div className="py-1">
            {onProfileClick && (
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  onProfileClick();
                }}
              >
                Profile
              </button>
            )}

            {onSettingsClick && (
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  onSettingsClick();
                }}
              >
                Settings
              </button>
            )}

            {onHelpClick && (
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  onHelpClick();
                }}
              >
                Help & Support
              </button>
            )}
          </div>

          {onLogoutClick && (
            <div className="py-1 border-t border-gray-100">
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  onLogoutClick();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserMenuDropdown;
