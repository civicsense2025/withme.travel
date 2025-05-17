import type { Meta, StoryObj } from '@storybook/react';
import { FAQAnswer } from './FAQAnswer';

const meta = {
  title: 'Atoms/FAQAnswer',
  component: FAQAnswer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FAQAnswer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: {
    children: 'You can create a new trip by clicking the "Create Trip" button on your dashboard or the homepage.',
  },
};

export const WithHTML: Story = {
  args: {
    children: <div dangerouslySetInnerHTML={{ __html: 'You can create a new trip by clicking the <strong>Create Trip</strong> button on your dashboard or the homepage. <a href="#">Learn more</a> about trip creation.' }} />,
  },
};

export const WithMarkdownStyling: Story = {
  args: {
    children: (
      <div dangerouslySetInnerHTML={{ 
        __html: `
          <p>Follow these steps to create a new trip:</p>
          <ol>
            <li>Log in to your account</li>
            <li>Click on "Create Trip" in the navigation</li>
            <li>Enter the trip details including destination and dates</li>
            <li>Invite friends to collaborate (optional)</li>
            <li>Click "Create" to finish</li>
          </ol>
          <p><em>You can edit these details later if needed.</em></p>
        `
      }} />
    ),
  },
}; 