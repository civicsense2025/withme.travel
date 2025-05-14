import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedContentEditor } from '@/app/admin/components/EnhancedContentEditor';

const meta = {
  title: 'Admin/EnhancedContentEditor',
  component: EnhancedContentEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnhancedContentEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialContent: '<p>This is some initial content for the enhanced editor.</p>',
    contentType: 'destinations',
    contentId: '123',
    placeholder: 'Start typing your content here...',
  },
};

export const WithRichContent: Story = {
  args: {
    initialContent: `
      <h2>Travel Guide to Tokyo</h2>
      <p>Tokyo is a vibrant metropolis that combines the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.</p>
      <p>The city's <strong>food scene</strong> is legendary, with more Michelin stars than any other city in the world.</p>
      <h3>Popular Districts</h3>
      <ul>
        <li>Shibuya - Famous for its crossing</li>
        <li>Shinjuku - Entertainment and shopping hub</li>
        <li>Asakusa - Historic district with temples</li>
      </ul>
      <p>Plan to spend at least 5 days exploring this amazing city!</p>
    `,
    contentType: 'city-guides',
    contentId: 'tokyo',
    placeholder: 'Start writing your city guide...',
  },
};

export const EmptyState: Story = {
  args: {
    initialContent: '',
    contentType: 'blog-posts',
    contentId: 'new-post',
    placeholder: 'Start crafting your blog post here...',
  },
};
