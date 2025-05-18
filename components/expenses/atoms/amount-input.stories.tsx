import { Meta, StoryObj } from '@storybook/react';
import { AmountInput } from './amount-input';
import { useState } from 'react';

const meta: Meta<typeof AmountInput> = {
  title: 'Expenses/Atoms/AmountInput',
  component: AmountInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 125.75,
    onChange: (value) => console.log('Amount changed:', value),
    currency: '$',
    placeholder: '0.00',
  },
};

export default meta;
type Story = StoryObj<typeof AmountInput>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Invalid amount',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DifferentCurrency: Story = {
  args: {
    currency: '€',
    value: 99.99,
  },
};

// Interactive story with state
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [amount, setAmount] = useState<number>(75.50);
    
    return (
      <div className="w-64">
        <p className="mb-2 text-sm text-muted-foreground">Enter an amount (current value: {amount})</p>
        <AmountInput
          value={amount}
          onChange={setAmount}
          currency="$"
        />
      </div>
    );
  },
}; 