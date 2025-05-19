/**
 * Auth Feature Components
 * 
 * This file exports all components related to authentication.
 */

// Atoms
export { default as PasswordField } from './atoms/PasswordField';
export { AuthSellingPoints } from './atoms/AuthSellingPoints';

// Molecules
export { default as LoginForm } from './molecules/LoginForm';

// Organisms
export { AuthProvider, useAuth } from './organisms/AuthProvider';
export { AuthErrorBoundary } from './organisms/AuthErrorBoundary';
export { AuthModalDemo } from './organisms/AuthModalDemo';
export { default as AuthDebugger } from './organisms/AuthDebugger';
export { default as AuthTestPanel } from './organisms/AuthTestPanel';

// Types
export type { User, AuthContextType } from './organisms/AuthProvider';

// Future exports as they're added
// export { SignupForm } from './molecules/SignupForm';
// export { ResetPasswordForm } from './molecules/ResetPasswordForm';
// export { AuthModal } from './organisms/AuthModal'; 