import type { Meta, StoryObj } from '@storybook/react';
import { AdminSidebar } from '@/app/admin/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Globe,
  Settings,
  Database,
  FileText,
  PieChart,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';

const meta = {
  title: 'Admin/AdminSidebar',
  component: AdminSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-1 p-2">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Globe className="mr-2 h-4 w-4" />
          Destinations
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Content
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <ImageIcon className="mr-2 h-4 w-4" />
          Media
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <PieChart className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Database className="mr-2 h-4 w-4" />
          Database
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    ),
  },
};

export const WithActiveItem: Story = {
  args: {
    children: (
      <div className="space-y-1 p-2">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant="default"
          className="w-full justify-start bg-primary/10 hover:bg-primary/20"
        >
          <Globe className="mr-2 h-4 w-4" />
          Destinations
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    ),
  },
};

export const WithNestedItems: Story = {
  args: {
    children: (
      <div className="space-y-1 p-2">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <div>
          <Button
            variant="default"
            className="w-full justify-start bg-primary/10 hover:bg-primary/20"
          >
            <Globe className="mr-2 h-4 w-4" />
            Destinations
          </Button>
          <div className="ml-6 mt-1 space-y-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
            <Button variant="ghost" className="w-full justify-start text-sm">
              All Destinations
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Add New
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Categories
            </Button>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    ),
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
