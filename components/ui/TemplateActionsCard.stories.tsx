import React from 'react';
import { TemplateActionsCard } from './TemplateActionsCard';

export default {
  title: 'Features/TemplateActionsCard',
  component: TemplateActionsCard,
};

export const Default = () => (
  <TemplateActionsCard
    onUse={() => alert('Use Template')}
    onShare={() => alert('Share')}
    onSave={() => alert('Save')}
    isSaved={false}
  />
);

export const Saved = () => (
  <TemplateActionsCard
    onUse={() => alert('Use Template')}
    onShare={() => alert('Share')}
    onSave={() => alert('Unsave')}
    isSaved={true}
  />
);

export const NoHandlers = () => <TemplateActionsCard />;

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
