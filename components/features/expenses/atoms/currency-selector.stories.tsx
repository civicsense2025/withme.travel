import { Meta, StoryObj } from '@storybook/react';
import { CurrencySelector, DEFAULT_CURRENCIES } from './currency-selector';
import { useState } from 'react';

const meta: Meta<typeof CurrencySelector> = {
  title: 'Expenses/Atoms/CurrencySelector',
  component: CurrencySelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 'USD',
    onChange: (value) => console.log('Currency changed:', value),
    currencies: DEFAULT_CURRENCIES,
    disabled: false,
    placeholder: 'Select currency',
  },
};

export default meta;
type Story = StoryObj<typeof CurrencySelector>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Choose a currency...',
  },
};

export const LimitedCurrencies: Story = {
  args: {
    currencies: [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
    ],
  },
};

// Interactive story with state
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currency, setCurrency] = useState<string>('USD');
    
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Selected currency: {currency}</p>
        <CurrencySelector
          value={currency}
          onChange={setCurrency}
        />
      </div>
    );
  },
}; 