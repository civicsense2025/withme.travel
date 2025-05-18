import { Meta, StoryObj } from '@storybook/react';
import { ExpenseFormField } from './expense-form-field';
import { useState } from 'react';

const meta: Meta<typeof ExpenseFormField> = {
  title: 'Expenses/Molecules/ExpenseFormField',
  component: ExpenseFormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ExpenseFormField>;

// Interactive story for text input
export const TextInput = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <ExpenseFormField
        type="text"
        label="Expense Title"
        placeholder="Enter expense title"
        value={value}
        onChange={setValue}
        error=""
      />
    );
  },
};

// Interactive story for amount input
export const AmountInput = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <ExpenseFormField
        type="amount"
        label="Amount"
        value={value}
        onChange={setValue}
        error=""
      />
    );
  },
};

// Interactive story for date input
export const DateInput = {
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <ExpenseFormField
        type="date"
        label="Expense Date"
        value={value}
        onChange={setValue}
        error=""
      />
    );
  },
};

// Interactive story for category input
export const CategoryInput = {
  render: () => {
    const [value, setValue] = useState('food');
    return (
      <ExpenseFormField
        type="category"
        label="Category"
        value={value}
        onChange={setValue}
        error=""
      />
    );
  },
};

// Story for field with error
export const WithError: Story = {
  args: {
    type: 'text',
    label: 'Expense Title',
    placeholder: 'Enter expense title',
    value: '',
    onChange: () => {},
    error: 'This field is required',
  },
}; 