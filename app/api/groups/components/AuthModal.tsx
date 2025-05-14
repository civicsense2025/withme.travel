'use client';
import React from 'react';

interface AuthModalProps {
  onSignIn: () => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSignIn, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <h2>Just one more step!</h2>
      <p>Create a free account to save your group and invite friends.</p>
      <button onClick={onSignIn} className="btn btn-primary w-full mb-2">
        Sign up or log in
      </button>
      <button onClick={onClose} className="btn btn-secondary w-full">
        Cancel
      </button>
    </div>
  </div>
);

export default AuthModal;
