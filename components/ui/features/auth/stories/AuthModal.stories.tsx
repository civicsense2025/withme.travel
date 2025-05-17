import type { Meta, StoryObj } from '@storybook/react';
import { AuthModal } from '../organisms/AuthModal';
import { AuthModalProvider } from '@/app/context/auth-modal-context';

/**
 * The AuthModal component displays authentication forms in a modal dialog with context-aware content.
 * 
 * Note: This component requires the AuthModalProvider to be in the React tree.
 * This story wraps the component with the provider for demonstration purposes.
 */
const meta: Meta<typeof AuthModal> = {
  title: 'UI/Features/auth/AuthModal',
  component: AuthModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <AuthModalProvider initialABTestVariant="control">
        <div style={{ width: '100vw', height: '100vh' }}>
          <Story />
        </div>
      </AuthModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuthModal>;

/**
 * Default AuthModal (closed by default in stories)
 * 
 * Note: In actual usage, this modal is controlled by the AuthModalProvider context
 * and opens based on user interactions or route changes.
 */
export const Default: Story = {
  render: () => <AuthModal />,
  parameters: {
    docs: {
      description: {
        story: `
        The AuthModal component is context-aware and adapts its content based on where the user is trying to authenticate from. 
        This makes for a more personalized and relevant authentication experience.
        
        To see the modal in action:
        1. Import the \`useAuthModal\` hook
        2. Call the \`open()\` method with a context value
        
        \`\`\`jsx
        import { useAuthModal } from '@/app/context/auth-modal-context';
        
        function MyComponent() {
          const { open } = useAuthModal();
          
          return (
            <button onClick={() => open('save-trip')}>
              Save Trip (requires login)
            </button>
          );
        }
        \`\`\`
        `
      }
    }
  }
}; 