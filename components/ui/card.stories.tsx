import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Molecules/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card. You can put any content in here.</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1546412414-e1885e51148b?w=800&auto=format&fit=crop&q=60"
        alt="Scenic mountain landscape"
        className="w-full h-48 object-cover"
      />
      <CardHeader>
        <h3 className="text-lg font-semibold">Mountain Retreat</h3>
        <p className="text-sm text-gray-500">Alpine, Switzerland</p>
      </CardHeader>
      <CardContent>
        <p>Stunning views and peaceful surroundings make this an ideal getaway destination.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm">$299 / night</p>
        <button className="px-3 py-1 bg-primary text-white text-sm rounded-md">Book Now</button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-[350px] p-4">
      <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
      <p>A card without using the subcomponents.</p>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader>
        <h3 className="text-lg font-semibold">Interactive Card</h3>
        <p className="text-sm text-gray-500">Hover to see effect</p>
      </CardHeader>
      <CardContent>
        <p>This card has hover effects and appears clickable.</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <button className="px-3 py-1 text-primary text-sm hover:underline">Learn More →</button>
      </CardFooter>
    </Card>
  ),
};

export const GroupedCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-[720px]">
      <Card>
        <CardHeader>
          <h3 className="font-medium">Basic Plan</h3>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4">
            $9<span className="text-sm font-normal">/mo</span>
          </p>
          <ul className="space-y-2 text-sm">
            <li>• 5 projects</li>
            <li>• Up to 10 users</li>
            <li>• 5GB storage</li>
          </ul>
        </CardContent>
        <CardFooter>
          <button className="w-full py-2 bg-gray-100 rounded-md text-sm font-medium">
            Get Started
          </button>
        </CardFooter>
      </Card>

      <Card className="border-primary">
        <CardHeader className="border-b">
          <div className="font-medium text-primary">Pro Plan</div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4">
            $29<span className="text-sm font-normal">/mo</span>
          </p>
          <ul className="space-y-2 text-sm">
            <li>• Unlimited projects</li>
            <li>• Unlimited users</li>
            <li>• 100GB storage</li>
            <li>• Priority support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <button className="w-full py-2 bg-primary text-white rounded-md text-sm font-medium">
            Upgrade Now
          </button>
        </CardFooter>
      </Card>
    </div>
  ),
};
