import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { Text } from './Text';

const meta: Meta<typeof Accordion> = {
  title: 'Core UI/Inputs/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accordion component for collapsible content panels. Built on Radix UI Accordion primitive for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['single', 'multiple'],
      description: 'Determines whether multiple items can be opened simultaneously',
      table: {
        defaultValue: { summary: 'single' },
      },
    },
    collapsible: {
      control: 'boolean',
      description:
        'When type is "single", allows closing content when clicking the trigger of an open item',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    defaultValue: {
      control: 'text',
      description: 'The value of the item to be opened by default (controlled)',
    },
    value: {
      control: 'text',
      description: 'The controlled value of the item to be opened',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Event handler called when the value changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is this trip refundable?</AccordionTrigger>
        <AccordionContent>
          <Text>
            Yes, full refunds are available up to 14 days before departure. Partial refunds are
            available up to 7 days before departure.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What should I pack?</AccordionTrigger>
        <AccordionContent>
          <Text>
            We recommend lightweight, breathable clothing, comfortable walking shoes, a hat,
            sunscreen, and a reusable water bottle. Don't forget your camera!
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Are meals included?</AccordionTrigger>
        <AccordionContent>
          <Text>
            Breakfast is included daily. Lunch and dinner are included on select excursions as
            indicated in the itinerary details.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default accordion with collapsible items. Only one item can be open at a time.',
      },
    },
  },
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>Destination Details</AccordionTrigger>
        <AccordionContent>
          <Text className="mb-2">
            Tokyo is Japan's bustling capital city, blending ultramodern and traditional elements.
          </Text>
          <Text>Best time to visit: Spring (March to May) and Fall (September to November).</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Transportation Options</AccordionTrigger>
        <AccordionContent>
          <Text>
            Tokyo's public transportation system is extensive and efficient. The Japan Rail Pass
            provides unlimited access to JR trains, including the Shinkansen (bullet train) for
            intercity travel.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Accommodation</AccordionTrigger>
        <AccordionContent>
          <Text>
            Options range from traditional ryokans to luxury hotels and budget-friendly hostels. We
            recommend booking accommodations in Shinjuku or Shibuya for convenient access to major
            attractions and transport hubs.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple-type accordion allows multiple items to be opened simultaneously.',
      },
    },
  },
};

export const WithDefaultValue: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-2" className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>Trip Logistics</AccordionTrigger>
        <AccordionContent>
          <Text>
            Detailed travel information including meeting points and transfer details will be
            provided approximately 2 weeks before departure.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Pricing & Payment</AccordionTrigger>
        <AccordionContent>
          <Text>
            The trip cost is $2,499 per person based on double occupancy. A deposit of $500 is
            required to secure your reservation. Final payment is due 60 days prior to departure.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Cancellation Policy</AccordionTrigger>
        <AccordionContent>
          <Text>
            Cancellations made more than 60 days prior to departure receive a full refund minus the
            deposit. Cancellations within 60-30 days receive a 50% refund. No refunds for
            cancellations within 30 days of departure.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordion with a specific item opened by default using the defaultValue prop.',
      },
    },
  },
};

export const FAQExample: Story = {
  render: () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Frequently Asked Questions</h2>
        <Text className="text-muted-foreground">
          Find answers to common questions about our travel services.
        </Text>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="booking">
          <AccordionTrigger>How do I book a trip?</AccordionTrigger>
          <AccordionContent>
            <Text>
              Booking a trip is easy! Simply browse our destinations, select your preferred dates,
              and follow the checkout process. You can book online, by phone, or through our mobile
              app. Our customer service team is available 24/7 to assist with any questions during
              the booking process.
            </Text>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payments">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            <Text className="mb-2">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover),
              PayPal, Apple Pay, and Google Pay. For select destinations, we also offer payment
              plans with 0% interest.
            </Text>
            <Text>
              All payments are processed through our secure payment gateway with industry-standard
              encryption.
            </Text>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="insurance">
          <AccordionTrigger>Do I need travel insurance?</AccordionTrigger>
          <AccordionContent>
            <Text>
              While not required, we strongly recommend purchasing travel insurance for all trips.
              Our premium travel insurance covers trip cancellation, medical emergencies, travel
              delays, and lost luggage. You can add insurance during the checkout process or up to
              14 days after booking.
            </Text>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancellation">
          <AccordionTrigger>What is your cancellation policy?</AccordionTrigger>
          <AccordionContent>
            <Text>
              Cancellation policies vary by trip type and destination. Generally, cancellations made
              more than 60 days before departure receive a full refund minus the deposit.
              Cancellations between 60-30 days receive a 50% refund, and no refunds are provided for
              cancellations within 30 days of departure. We recommend reviewing the specific
              cancellation policy for your trip before booking.
            </Text>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="documents">
          <AccordionTrigger>What travel documents do I need?</AccordionTrigger>
          <AccordionContent>
            <Text>
              Required travel documents vary by destination. For international travel, you'll
              typically need a valid passport with at least six months validity beyond your return
              date. Some countries also require visas, travel permits, or proof of vaccination. We
              provide destination-specific document requirements during the booking process and in
              your pre-departure information packet.
            </Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordion used in a Frequently Asked Questions section with longer content.',
      },
    },
  },
};
