import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaForm } from './GroupIdeaForm';

const meta: Meta<typeof GroupIdeaForm> = {
  title: 'Features/Groups/Organisms/GroupIdeaForm',
  component: GroupIdeaForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GroupIdeaForm>;

export const CreateNew: Story = {
  args: {
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: false,
    layout: 'inline',
  },
};

export const EditExisting: Story = {
  args: {
    initialData: {
      id: 'idea123',
      title: 'Visit the Eiffel Tower',
      description: 'We should definitely check out the Eiffel Tower while in Paris. Best at sunset for amazing photos.',
      type: 'place',
      link: 'https://example.com/eiffel-tower',
      notes: 'Remember to book tickets in advance!',
    },
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: false,
    layout: 'inline',
  },
};

export const WithDates: Story = {
  args: {
    initialData: {
      id: 'activity123',
      title: 'Wine Tasting Tour',
      description: 'Day trip to Loire Valley wine region',
      type: 'activity',
      start_date: '2024-08-15T09:00:00Z',
      end_date: '2024-08-15T18:00:00Z',
    },
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: false,
    layout: 'inline',
  },
};

export const CompactLayout: Story = {
  args: {
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: false,
    compact: true,
    layout: 'inline',
  },
};

export const DialogLayout: Story = {
  args: {
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: false,
    layout: 'dialog',
    onCancel: () => console.log('Form cancelled'),
  },
};

export const Submitting: Story = {
  args: {
    onSubmit: async (formData) => {
      console.log('Form submitted:', formData);
      return Promise.resolve();
    },
    isSubmitting: true,
    layout: 'inline',
  },
}; 