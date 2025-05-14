import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LiveRegion } from '@/components/ui/live-region';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof LiveRegion> = {
  title: 'Accessibility/LiveRegion',
  component: LiveRegion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that announces content changes to screen readers without disrupting visual experience.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message to announce to screen readers',
    },
    politeness: {
      control: { type: 'radio', options: ['polite', 'assertive'] },
      description: 'ARIA live region politeness level',
    },
    clearAfter: {
      control: 'number',
      description: 'How long the message should remain in the DOM (in milliseconds)',
    },
    visuallyHidden: {
      control: 'boolean',
      description: 'Whether the region should be visually hidden',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LiveRegion>;

export const Default: Story = {
  args: {
    message: 'This message will be announced to screen readers',
    politeness: 'polite',
    clearAfter: 5000,
    visuallyHidden: true,
  },
};

const LiveRegionDemo = () => {
  const [message, setMessage] = useState('');
  const [counter, setCounter] = useState(0);

  const announcePolite = () => {
    setMessage(`Item ${counter} added to cart (polite announcement)`);
    setCounter((prev) => prev + 1);
  };

  const announceAssertive = () => {
    setMessage(`Error processing payment! (assertive announcement)`);
  };

  return (
    <div className="space-y-6 p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold">Live Region Demo</h2>
      <p className="text-sm text-gray-600">
        Click the buttons below to trigger announcements. Use a screen reader to hear the
        announcements.
      </p>

      <div className="flex flex-col gap-4">
        <Button onClick={announcePolite} variant="default">
          Announce Politely
        </Button>

        <Button onClick={announceAssertive} variant="destructive">
          Announce Assertively
        </Button>
      </div>

      <div className="text-sm text-gray-600 p-4 border border-gray-200 rounded-md">
        <p>
          <strong>Last action:</strong> {message || 'No announcements yet'}
        </p>
      </div>

      {/* Polite live region */}
      <LiveRegion message={message} politeness="polite" clearAfter={3000} />

      {/* Visual indicator of the region (for demo purposes) */}
      <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-md">
        <h3 className="text-sm font-medium">Behind the scenes:</h3>
        <p className="text-xs text-gray-500">
          An invisible live region exists on this page. Whenever you click a button, the message is
          updated and announced to screen readers.
        </p>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <LiveRegionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'This demonstrates a common use case for live regions: announcing the result of user actions. Try using a screen reader and clicking the buttons to hear the announcements.',
      },
    },
  },
};

const VisibleLiveRegionDemo = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState('Idle');

  const actions = [
    'Loading data...',
    'Processing items...',
    'Validating entries...',
    'Optimizing results...',
    'Finishing up...',
    'Complete!',
  ];

  const simulateProcess = () => {
    setMessages([]);

    actions.forEach((action, index) => {
      setTimeout(() => {
        setCurrentStatus(action);
        setMessages((prev) => [...prev, action]);
      }, index * 1500);
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold">Visible Live Region</h2>
      <p className="text-sm text-gray-600">
        This example shows a live region that's visible to all users, providing visual status
        updates that are also announced to screen readers.
      </p>

      <Button onClick={simulateProcess}>Start Process</Button>

      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Current Status:</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {currentStatus}
          </span>
        </div>

        {/* Visible live region */}
        <LiveRegion
          message={currentStatus}
          politeness="polite"
          visuallyHidden={false}
          clearAfter={0} // Don't auto-clear
          className="bg-gray-50 p-3 rounded text-sm"
        />

        <div className="mt-4">
          <h4 className="text-xs font-medium mb-2">Activity Log:</h4>
          <ul className="text-xs space-y-1">
            {messages.map((msg, i) => (
              <li key={i} className="pb-1 border-b border-gray-100">
                {msg}
              </li>
            ))}
            {messages.length === 0 && <li className="text-gray-400">No activity yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const VisibleRegion: Story = {
  render: () => <VisibleLiveRegionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Live regions can also be made visible to all users, functioning as both visual status updates and screen reader announcements.',
      },
    },
  },
};
