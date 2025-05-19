import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './data-table';

/**
 * Storybook stories for the DataTable component
 * @module ui/DataTable
 */
const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DataTable>;

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
];
const rows = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

export const Default: Story = {
  args: {
    columns,
    rows,
  },
};

export const Empty: Story = {
  args: {
    columns,
    rows: [],
  },
}; 