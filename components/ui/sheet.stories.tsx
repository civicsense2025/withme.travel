import type { Meta, StoryObj } from '@storybook/react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetFooter, SheetHeader } from './sheet';

/**
 * Storybook stories for the Sheet and related components
 * @module ui/Sheet
 */
const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet description.</SheetDescription>
        </SheetHeader>
        <div>Sheet content goes here.</div>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}; 