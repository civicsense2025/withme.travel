import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from './toast';
import React, { useState } from 'react';

/**
 * Storybook stories for the Toast and related components
 * @module ui/Toast
 */
const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Toast open>
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>This is a toast message.</ToastDescription>
        <ToastAction altText="Undo">Undo</ToastAction>
        <ToastClose />
      </Toast>
    </ToastProvider>
  ),
};

export const Destructive: Story = {
  render: () => (
    <ToastProvider>
      <Toast open variant="destructive">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong.</ToastDescription>
        <ToastClose />
      </Toast>
    </ToastProvider>
  ),
}; 