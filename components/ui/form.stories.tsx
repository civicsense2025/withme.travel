import type { Meta, StoryObj } from '@storybook/react';
import { Form, FormField, FormLabel, FormError, FormItem, FormControl, FormDescription } from './form';

/**
 * Storybook stories for the Form and related components
 * @module ui/Form
 */
const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <Form>
      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormControl>
          <input id="email" type="email" className="input" />
        </FormControl>
        <FormDescription>We'll never share your email.</FormDescription>
        <FormError>Email is required.</FormError>
      </FormField>
    </Form>
  ),
};

export const WithMultipleFields: Story = {
  render: () => (
    <Form>
      <FormField>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormControl>
          <input id="name" type="text" className="input" />
        </FormControl>
      </FormField>
      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
        <FormControl>
          <input id="password" type="password" className="input" />
        </FormControl>
        <FormError>Password is too short.</FormError>
      </FormField>
    </Form>
  ),
}; 