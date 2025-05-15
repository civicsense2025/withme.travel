'use client';

import React from 'react';

export default function CSSTest() {
  return (
    <div className="p-12 space-y-8">
      <h1 className="text-4xl font-bold text-travel-purple">Tailwind CSS Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Card with Basic Styling</h2>
          <p className="text-gray-600">This card uses basic Tailwind utilities like padding, border, and rounded corners.</p>
          <button className="mt-4 bg-travel-blue text-white px-4 py-2 rounded-md hover:bg-travel-blue-dark">
            Button
          </button>
        </div>
        
        {/* Card 2 */}
        <div className="bg-gradient-to-br from-travel-pink to-travel-purple p-6 rounded-xl shadow-md text-white">
          <h2 className="text-2xl font-semibold mb-3">Gradient Background</h2>
          <p className="opacity-90">This card has a gradient background using Tailwind's gradient utilities.</p>
          <div className="mt-4 flex space-x-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Tag 1</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Tag 2</span>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border-base dark:border-border-base-dark">
          <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-3">Dark Mode Support</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark">This card should adapt to both light and dark modes using our custom color variables.</p>
          <div className="mt-4 flex justify-between">
            <button className="bg-travel-mint text-travel-mint-foreground px-4 py-2 rounded-md">
              Accept
            </button>
            <button className="bg-travel-peach text-travel-peach-foreground px-4 py-2 rounded-md">
              Decline
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Animation Tests</h2>
        <div className="flex space-x-6">
          <div className="w-16 h-16 bg-travel-yellow rounded-full animate-float"></div>
          <div className="w-16 h-16 bg-travel-blue rounded-full animate-pulse-soft"></div>
          <div className="w-16 h-16 bg-travel-purple rounded-full animate-bounce-slow"></div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Typography</h2>
        <h1 className="text-4xl font-bold mb-2">H1 Heading (4xl)</h1>
        <h2 className="text-3xl font-bold mb-2">H2 Heading (3xl)</h2>
        <h3 className="text-2xl font-bold mb-2">H3 Heading (2xl)</h3>
        <h4 className="text-xl font-semibold mb-2">H4 Heading (xl)</h4>
        <p className="text-base mb-2">Base paragraph text</p>
        <p className="text-sm">Small text (sm)</p>
      </div>
    </div>
  );
} 