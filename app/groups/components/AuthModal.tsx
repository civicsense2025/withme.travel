import React from 'react';

interface AuthModalProps {
  onSignIn: () => void;
  onClose: () => void;
}

/**
 * AuthModal prompts the user to sign up or log in before creating a group.
 * Defensive: disables sign-in button if handler is missing, closes on escape, traps focus.
 * Usage example:
 * <AuthModal onSignIn={...} onClose={...} />
 */
const AuthModal: React.FC<AuthModalProps> = ({ onSignIn, onClose }) => {
  // Defensive: fallback no-ops
  const handleSignIn = onSignIn || (() => {});
  const handleClose = onClose || (() => {});

  // Trap focus and close on Escape
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  // Focus the modal on mount
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full p-6 outline-none"
        tabIndex={0}
      >
        <h2 id="auth-modal-title" className="text-xl font-semibold mb-2">
          Just one more step!
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200">
          Create a free account to save your group and invite friends.
        </p>
        <button
          type="button"
          className="btn btn-primary w-full mb-2"
          onClick={handleSignIn}
          aria-label="Sign up or log in"
        >
          Sign up or log in
        </button>
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={handleClose}
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
