import type { Meta, StoryObj } from '@storybook/react';
import { IdeaStepper } from './IdeaStepper';

const meta: Meta<typeof IdeaStepper> = {
  title: 'Features/Groups/Molecules/IdeaStepper',
  component: IdeaStepper,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof IdeaStepper>;

export const Step1: Story = { args: { currentStep: 1 } };
export const Step2: Story = { args: { currentStep: 2 } };
export const Step3: Story = { args: { currentStep: 3 } }; 