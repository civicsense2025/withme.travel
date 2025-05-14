/**
 * Storybook story for FeatureTabsProduct
 *
 * Demonstrates the marketing/demo use case for the tabbed feature component.
 *
 * @module components/FeatureTabsProduct.stories
 */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DollarSign, BarChart2, Lightbulb, Zap, User, Clock, Plus, Check } from 'lucide-react';
import FeatureTabsProduct, { FeatureTab, FeatureTabsProductProps } from './FeatureTabsProduct';
import { motion } from 'framer-motion';

const meta: Meta<typeof FeatureTabsProduct> = {
  title: 'Marketing/FeatureTabsProduct',
  component: FeatureTabsProduct,
  argTypes: {
    activeTabId: { control: 'select', options: ['expenses', 'polls', 'ideas', 'quicktrip'] },
  },
};
export default meta;

type Story = StoryObj<typeof FeatureTabsProduct>;

const sampleTabs: FeatureTab[] = [
  {
    id: 'expenses',
    label: 'Expenses',
    icon: <DollarSign className="h-5 w-5" />,
    emoji: '💰',
    actionButton: (
      <motion.button
        className="text-xs bg-travel-purple text-white font-medium px-3 py-1.5 rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Add Expense
      </motion.button>
    ),
    content: (
      <div>
        <p className="text-sm text-gray-500 mb-4">Track and split costs with your group</p>
        <div className="space-y-2 mt-4">
          <motion.div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between mb-1">
              <div className="font-medium text-gray-800">Hotel</div>
              <div className="font-bold text-gray-800">$1200.00</div>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-travel-blue rounded-full flex items-center justify-center text-xs text-white mr-1.5">A</div>
              <div className="text-xs text-gray-500">Paid by Alex</div>
            </div>
          </motion.div>
          <motion.div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between mb-1">
              <div className="font-medium text-gray-800">Tapas Dinner</div>
              <div className="font-bold text-gray-800">$180.00</div>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-travel-pink rounded-full flex items-center justify-center text-xs text-white mr-1.5">J</div>
              <div className="text-xs text-gray-500">Paid by Jamie</div>
            </div>
          </motion.div>
          <motion.div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between mb-1">
              <div className="font-medium text-gray-800">Beach Umbrellas</div>
              <div className="font-bold text-gray-800">$40.00</div>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-travel-mint rounded-full flex items-center justify-center text-xs text-white mr-1.5">T</div>
              <div className="text-xs text-gray-500">Paid by Taylor</div>
            </div>
          </motion.div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-700">Total</div>
              <div className="font-bold text-travel-purple text-lg">$1420.00</div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <motion.button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Settle Up</motion.button>
            <motion.button className="px-3 py-1.5 bg-travel-blue text-white text-xs font-medium rounded-full">Split Evenly</motion.button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'polls',
    label: 'Polls',
    icon: <BarChart2 className="h-5 w-5" />,
    emoji: '📊',
    actionButton: (
      <motion.button className="text-xs bg-travel-blue text-white font-medium px-3 py-1.5 rounded-full">Create Poll</motion.button>
    ),
    content: (
      <div>
        <p className="text-sm text-gray-500 mb-4">Make decisions without group chat chaos</p>
        <div className="space-y-4 mt-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-3">Which hotel should we book?</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Hotel Mirabelle</span>
                  <span className="font-medium text-travel-blue">4 votes</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-travel-blue h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Oceanview Resort</span>
                  <span className="font-medium text-gray-500">1 vote</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gray-300 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>5/6 voted</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Closes in 2 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ideas',
    label: 'Ideas',
    icon: <Lightbulb className="h-5 w-5" />,
    emoji: '💡',
    actionButton: (
      <motion.button className="text-xs bg-travel-mint text-white font-medium px-3 py-1.5 rounded-full">Add Idea</motion.button>
    ),
    content: (
      <div>
        <p className="text-sm text-gray-500 mb-4">Collect and rate group ideas together</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.div className="bg-white border-l-3 border-travel-blue border rounded-lg p-3 shadow-sm">
            <div className="flex items-start">
              <span className="text-xl mr-2">🏖️</span>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">Tulum Beach Day</h3>
                <p className="text-xs text-gray-500 mt-0.5">Visit white sand beaches</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Beach</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400 text-xs mr-0.5">★★★★</span>
                <span className="text-xs text-gray-500">4</span>
              </div>
            </div>
          </motion.div>
          <motion.div className="bg-white border-l-3 border-travel-purple border rounded-lg p-3 shadow-sm">
            <div className="flex items-start">
              <span className="text-xl mr-2">👨‍🍳</span>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">Cooking Class</h3>
                <p className="text-xs text-gray-500 mt-0.5">Learn local dishes</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Food</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400 text-xs mr-0.5">★★★★★</span>
                <span className="text-xs text-gray-500">5</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: 'quicktrip',
    label: 'Quick Trip',
    icon: <Zap className="h-5 w-5" />,
    emoji: '✈️',
    actionButton: (
      <motion.button className="text-xs bg-travel-pink text-white font-medium px-3 py-1.5 rounded-full">Create Trip</motion.button>
    ),
    content: (
      <div>
        <p className="text-sm text-gray-500 mb-4">Instantly create a trip from your ideas</p>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 text-sm">Select trip style:</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <motion.div className="bg-white border-2 border-travel-pink rounded-lg p-2 flex flex-col items-center shadow-sm">
              <span className="text-2xl mb-1">🏖️</span>
              <span className="text-xs font-medium">Beach</span>
            </motion.div>
            <motion.div className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col items-center">
              <span className="text-2xl mb-1">🏙️</span>
              <span className="text-xs font-medium">City</span>
            </motion.div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-xs text-gray-700 mb-2">Your trip will include:</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center text-xs text-gray-600">
                <Check className="h-3 w-3 text-travel-pink mr-1.5" />
                <span>3 pre-selected accommodations</span>
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <Check className="h-3 w-3 text-travel-pink mr-1.5" />
                <span>Daily activities based on preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    defaultTabId: 'expenses',
  },
}; 