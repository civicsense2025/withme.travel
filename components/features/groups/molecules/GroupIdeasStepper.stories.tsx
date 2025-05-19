import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeasStepper } from './GroupIdeasStepper';

const meta: Meta<typeof GroupIdeasStepper> = {
  title: 'Features/Groups/Molecules/GroupIdeasStepper',
  component: GroupIdeasStepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GroupIdeasStepper>;

export const Step1: Story = {
  args: {
    currentStep: 1,
  },
};

export const Step2: Story = {
  args: {
    currentStep: 2,
  },
};

export const Step3: Story = {
  args: {
    currentStep: 3,
  },
};

export const CustomClassName: Story = {
  args: {
    currentStep: 2,
    className: 'bg-blue-50 p-4 rounded-lg',
  },
}; 