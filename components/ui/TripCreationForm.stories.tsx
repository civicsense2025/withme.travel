import React from 'react';
import { TripCreationForm } from './TripCreationForm';

export default {
  title: 'Features/TripCreationForm',
  component: TripCreationForm,
};

export const Default = () => (
  <div className="p-6 bg-gray-50 rounded-xl">
    <TripCreationForm onSubmit={(data) => console.log('Form submitted:', data)} />
  </div>
);

export const WithValidationErrors = () => {
  const MockFormWithErrors = () => {
    const [showErrors, setShowErrors] = React.useState(false);

    const handleSubmit = (data: any) => {
      console.log('Form submitted:', data);
      setShowErrors(true);
    };

    React.useEffect(() => {
      // Simulate a form submission to show errors
      if (!showErrors) {
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }, [showErrors]);

    return <TripCreationForm onSubmit={handleSubmit} />;
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <MockFormWithErrors />
    </div>
  );
};

export const LoadingState = () => (
  <div className="p-6 bg-gray-50 rounded-xl">
    <TripCreationForm onSubmit={(data) => console.log('Form submitted:', data)} isLoading={true} />
  </div>
);

export const WithCancelHandler = () => (
  <div className="p-6 bg-gray-50 rounded-xl">
    <TripCreationForm
      onSubmit={(data) => console.log('Form submitted:', data)}
      onCancel={() => alert('Form cancelled')}
    />
  </div>
);

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
