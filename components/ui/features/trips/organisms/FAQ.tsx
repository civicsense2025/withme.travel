
import React from 'react';
import { FAQItem } from '@/components/ui/atoms/FAQItem';

export interface FAQProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQ: React.FC<FAQProps> = ({ items }) => {
  return (
    <div className="faq">
      {items.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};
