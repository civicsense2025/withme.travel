import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FocusTrap } from '@/components/ui/focus-trap';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof FocusTrap> = {
  title: 'Accessibility/FocusTrap',
  component: FocusTrap,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that traps focus within its children, preventing users from tabbing outside the contained area. Useful for modals, dialogs, and other overlay UI components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Whether the focus trap is active',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Whether to auto-focus the first focusable element when the trap activates',
    },
    restoreFocus: {
      control: 'boolean',
      description:
        'Whether to restore focus to the previously focused element when the trap deactivates',
    },
    focusableSelector: {
      control: 'text',
      description: 'Selector for elements that should be focusable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FocusTrap>;

export const Default: Story = {
  args: {
    active: true,
    autoFocus: true,
    restoreFocus: true,
    children: (
      <div className="p-6 space-y-4 bg-gray-100 rounded-md w-[400px]">
        <h2 className="text-lg font-semibold">Trapped Focus Example</h2>
        <p className="text-sm text-gray-700">
          Try tabbing through these elements. Focus will loop from the last element back to the
          first.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    ),
  },
};

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Modal Dialog Example</h2>
      <p className="text-sm text-gray-600 mb-4">
        This example shows how to use FocusTrap in a modal dialog. When the modal is open, focus is
        trapped inside it.
      </p>

      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <FocusTrap>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Confirmation Dialog</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to proceed with this action? This cannot be undone.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your confirmation code"
                  className="w-full p-2 border border-gray-300 rounded"
                />

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="confirm-checkbox" />
                  <label htmlFor="confirm-checkbox" className="text-sm text-gray-700">
                    I understand the consequences
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => setIsOpen(false)}>
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <h3 className="text-md font-medium">Outside the modal:</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="This input should be skipped when modal is open"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <Button variant="outline">This button should be skipped when modal is open</Button>
        </div>
      </div>
    </div>
  );
};

export const ModalDialog: Story = {
  render: () => <ModalExample />,
  parameters: {
    docs: {
      description: {
        story:
          'A common use case for FocusTrap is in modal dialogs. Open the modal and notice how focus is trapped within it until you close it.',
      },
    },
  },
};

const NestedTrapsExample = () => {
  const [outerActive, setOuterActive] = useState(true);
  const [innerActive, setInnerActive] = useState(false);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Nested Focus Traps</h2>
      <p className="text-sm text-gray-600 mb-4">
        This example demonstrates nested focus traps. The inner trap takes precedence when active.
      </p>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm">
          <input
            type="checkbox"
            checked={outerActive}
            onChange={(e) => setOuterActive(e.target.checked)}
            className="mr-2"
          />
          Outer trap active
        </label>

        <label className="text-sm ml-4">
          <input
            type="checkbox"
            checked={innerActive}
            onChange={(e) => setInnerActive(e.target.checked)}
            className="mr-2"
          />
          Inner trap active
        </label>
      </div>

      <FocusTrap
        active={outerActive}
        className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50"
      >
        <h3 className="text-md font-medium mb-2">Outer Focus Trap</h3>
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Outer input 1"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <Button variant="outline">Outer button</Button>
        </div>

        <FocusTrap
          active={innerActive}
          className="border-2 border-red-300 rounded-lg p-4 bg-red-50"
        >
          <h4 className="text-md font-medium mb-2">Inner Focus Trap</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Inner input 1"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Inner input 2"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <Button>Inner button</Button>
          </div>
        </FocusTrap>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Outer input 2"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </FocusTrap>
    </div>
  );
};

export const NestedTraps: Story = {
  render: () => <NestedTrapsExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Focus traps can be nested, with the innermost active trap taking precedence. This is useful for components like nested dialogs or popovers.',
      },
    },
  },
};
