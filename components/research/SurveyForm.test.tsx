/**
 * Tests for SurveyForm component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SurveyForm, Survey } from './SurveyForm';

// Mock survey data for testing
const MOCK_SURVEY: Survey = {
  id: 'test-survey',
  title: 'Test Survey',
  description: 'This is a test survey',
  questions: [
    {
      id: 'q1',
      text: 'Question 1',
      type: 'text',
      required: true
    },
    {
      id: 'q2',
      text: 'Question 2',
      type: 'radio',
      required: false,
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ]
    }
  ]
};

// Mock functions
const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

// Reset mocks before each test
beforeEach(() => {
  mockOnSubmit.mockClear();
});

describe('SurveyForm', () => {
  test('renders survey title and description', () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Test Survey')).toBeInTheDocument();
    expect(screen.getByText('This is a test survey')).toBeInTheDocument();
  });
  
  test('renders the first question initially', () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.queryByText('Question 2')).not.toBeInTheDocument();
  });
  
  test('shows validation error when trying to proceed with an empty required field', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Try to proceed to next question without filling required field
    fireEvent.click(screen.getByText('Next'));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
  
  test('allows navigation to next question after filling required field', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Fill in the required field
    const inputField = screen.getByLabelText(/Question 1/i);
    fireEvent.change(inputField, { target: { value: 'Test answer' } });
    
    // Navigate to next question
    fireEvent.click(screen.getByText('Next'));
    
    // Should show second question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
  });
  
  test('shows previous button disabled on first question', () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Previous button should be disabled
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });
  
  test('allows navigation back to previous question', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Fill in the required field
    const inputField = screen.getByLabelText(/Question 1/i);
    fireEvent.change(inputField, { target: { value: 'Test answer' } });
    
    // Navigate to next question
    fireEvent.click(screen.getByText('Next'));
    
    // Now on question 2, navigate back
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Previous'));
    
    // Should show first question again
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.queryByText('Question 2')).not.toBeInTheDocument();
    });
  });
  
  test('shows Submit button on the last question', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Fill in the required field
    const inputField = screen.getByLabelText(/Question 1/i);
    fireEvent.change(inputField, { target: { value: 'Test answer' } });
    
    // Navigate to next question
    fireEvent.click(screen.getByText('Next'));
    
    // On last question, should show Submit button
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });
  
  test('submits the form with all responses', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Fill in the first question
    const inputField = screen.getByLabelText(/Question 1/i);
    fireEvent.change(inputField, { target: { value: 'Answer to Q1' } });
    
    // Navigate to next question
    fireEvent.click(screen.getByText('Next'));
    
    // Fill in the second question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
    
    const radioOption = screen.getByLabelText('Option A');
    fireEvent.click(radioOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Check that onSubmit was called with the correct responses
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        q1: 'Answer to Q1',
        q2: 'a'
      });
    });
  });
  
  test('shows completion screen after successful submission', async () => {
    render(<SurveyForm survey={MOCK_SURVEY} onSubmit={mockOnSubmit} />);
    
    // Fill in the first question
    const inputField = screen.getByLabelText(/Question 1/i);
    fireEvent.change(inputField, { target: { value: 'Answer to Q1' } });
    
    // Navigate to next question
    fireEvent.click(screen.getByText('Next'));
    
    // Fill in the second question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
    
    const radioOption = screen.getByLabelText('Option A');
    fireEvent.click(radioOption);
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Check that completion screen is shown
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });
  });
}); 