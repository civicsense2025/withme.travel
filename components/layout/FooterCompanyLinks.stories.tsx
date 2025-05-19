import type { Meta, StoryObj } from '@storybook/react';
import { FooterCompanyLinks } from './FooterCompanyLinks';

/**
 * Storybook stories for the FooterCompanyLinks component
 * Shows company footer links with and without extra links
 */
const meta: Meta<typeof FooterCompanyLinks> = {
  title: 'Layout/FooterCompanyLinks',
  component: FooterCompanyLinks,
  tags: ['autodocs'],
  argTypes: {
    links: { control: 'object', description: 'Array of footer links' },
  },
};
export default meta;
type Story = StoryObj<typeof FooterCompanyLinks>;

export const Default: Story = {
  args: {
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const WithExtraLinks: Story = {
  args: {
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
  },
}; 