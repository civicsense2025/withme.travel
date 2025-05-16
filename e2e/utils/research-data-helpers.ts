/**
 * Research Data Helpers
 * 
 * Utilities for managing test data related to research system tests.
 * Provides methods to create test forms, fields, and seed responses.
 */
import { Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

export interface FormFieldData {
  id?: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  description?: string;
  milestone?: string; // Milestone this field belongs to
  order?: number;     // Order within the milestone
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  fields: FormFieldData[];
  completionMessage?: string;
  status?: 'draft' | 'active' | 'inactive';
  milestones?: string[]; // Array of milestone types
  milestone_trigger?: string; // Initial milestone trigger
}

/**
 * Helper class for managing research test data
 */
export class ResearchDataHelper {
  constructor(private page: Page) {}
  
  /**
   * Create a test form via the API for testing
   * 
   * @param formData The form definition
   * @returns The created form's ID
   */
  async createTestForm(formData: FormData): Promise<string> {
    // Fill in any missing data
    const completeFormData = {
      id: formData.id || `test-form-${uuidv4()}`,
      title: formData.title,
      description: formData.description || `Test form created at ${new Date().toISOString()}`,
      fields: formData.fields.map((field, index) => ({
        id: field.id || `field-${uuidv4()}`,
        label: field.label,
        type: field.type,
        options: field.options || [],
        required: field.required !== undefined ? field.required : true,
        placeholder: field.placeholder || '',
        description: field.description || '',
        milestone: field.milestone || null,
        order: field.order !== undefined ? field.order : index
      })),
      completionMessage: formData.completionMessage || 'Thank you for completing this test form!',
      status: formData.status || 'active',
      milestones: formData.milestones || [],
      milestone_trigger: formData.milestone_trigger || null
    };
    
    // Make API call to create the form
    const response = await this.page.request.post('/api/research/forms', {
      data: completeFormData
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to create test form: ${response.statusText()}`);
    }
    
    const result = await response.json();
    return result.id;
  }
  
  /**
   * Create a complete test form with typical fields
   * 
   * @returns The created form's ID
   */
  async createStandardTestForm(): Promise<string> {
    return this.createTestForm({
      title: 'Standard Test Survey',
      description: 'This is an automated test survey created for end-to-end testing',
      fields: [
        {
          label: 'What is your name?',
          type: 'text',
          placeholder: 'Full name',
          required: true
        },
        {
          label: 'How satisfied are you with our product?',
          type: 'rating',
          required: true
        },
        {
          label: 'What features would you like to see improved?',
          type: 'checkbox',
          options: ['User Interface', 'Performance', 'Documentation', 'Reliability'],
          required: false
        },
        {
          label: 'Please share any additional feedback',
          type: 'textarea',
          placeholder: 'Your feedback helps us improve...',
          required: false
        },
        {
          label: 'How did you hear about us?',
          type: 'select',
          options: ['Search Engine', 'Social Media', 'Friend', 'Advertisement', 'Other'],
          required: true
        }
      ],
      completionMessage: 'Thank you for participating in our research study!'
    });
  }
  
  /**
   * Create a multi-milestone survey for testing milestone-based flows
   * 
   * @returns The created form's ID
   */
  async createMultiMilestoneSurvey(): Promise<string> {
    // Define the milestones we'll use in our test form
    const milestones = [
      'onboarding_complete',
      'trip_created',
      'group_formation_complete',
      'vote_process_used',
      'trip_from_template'
    ];
    
    return this.createTestForm({
      title: 'Multi-Milestone Research Survey',
      description: 'This survey collects feedback at different stages of your travel planning journey',
      milestones: milestones,
      milestone_trigger: milestones[0], // Initial trigger is onboarding_complete
      fields: [
        // Onboarding milestone questions
        {
          label: 'How was your onboarding experience?',
          type: 'rating',
          required: true,
          milestone: 'onboarding_complete',
          order: 1
        },
        {
          label: 'What aspects of onboarding could be improved?',
          type: 'checkbox',
          options: ['Clarity', 'Speed', 'Information provided', 'User interface'],
          required: false,
          milestone: 'onboarding_complete',
          order: 2
        },
        
        // Trip creation milestone questions
        {
          label: 'How easy was it to create a trip?',
          type: 'rating',
          required: true,
          milestone: 'trip_created',
          order: 1
        },
        {
          label: 'What destination did you choose for your trip?',
          type: 'text',
          required: true,
          milestone: 'trip_created',
          order: 2
        },
        
        // Group formation milestone questions
        {
          label: 'How would you rate the process of adding people to your trip?',
          type: 'rating',
          required: true,
          milestone: 'group_formation_complete',
          order: 1
        },
        {
          label: 'What challenges did you face while forming your group?',
          type: 'textarea',
          required: false,
          milestone: 'group_formation_complete',
          order: 2
        },
        
        // Voting process milestone questions
        {
          label: 'How useful was the voting feature?',
          type: 'rating',
          required: true,
          milestone: 'vote_process_used',
          order: 1
        },
        {
          label: 'Did everyone in your group participate in voting?',
          type: 'radio',
          options: ['Yes, everyone voted', 'Most people voted', 'Only a few people voted', 'I was the only one who voted'],
          required: true,
          milestone: 'vote_process_used',
          order: 2
        },
        
        // Template usage milestone questions
        {
          label: 'How helpful was the trip template?',
          type: 'rating',
          required: true,
          milestone: 'trip_from_template',
          order: 1
        },
        {
          label: 'What additional templates would you like to see?',
          type: 'textarea',
          required: false,
          milestone: 'trip_from_template',
          order: 2
        }
      ],
      completionMessage: 'Thank you for providing feedback across multiple stages of your journey!'
    });
  }
  
  /**
   * Delete a test form after testing
   * 
   * @param formId The ID of the form to delete
   */
  async deleteTestForm(formId: string): Promise<void> {
    const response = await this.page.request.delete(`/api/research/forms/${formId}`);
    
    if (!response.ok()) {
      console.warn(`Warning: Failed to delete test form ${formId}: ${response.statusText()}`);
    }
  }
  
  /**
   * Create a milestone trigger for testing
   * 
   * @param params Configuration for the milestone trigger
   * @returns The created trigger's ID
   */
  async createMilestoneTrigger({
    formId,
    milestone,
    probability = 100,
    startDate,
    endDate
  }: {
    formId: string;
    milestone: string;
    probability?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    const triggerData = {
      form_id: formId,
      milestone,
      probability,
      start_date: startDate ? startDate.toISOString() : new Date().toISOString(),
      end_date: endDate ? endDate.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const response = await this.page.request.post('/api/research/milestone-triggers', {
      data: triggerData
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to create milestone trigger: ${response.statusText()}`);
    }
    
    const result = await response.json();
    return result.id;
  }
  
  /**
   * Track a milestone event for a user or session
   * 
   * @param eventType The type of event/milestone to track
   * @param details Additional event details
   * @returns The event ID
   */
  async trackMilestoneEvent(eventType: string, details: Record<string, any> = {}): Promise<string> {
    const eventData = {
      event_type: eventType,
      details,
      timestamp: new Date().toISOString()
    };
    
    const response = await this.page.request.post('/api/research/events', {
      data: eventData
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to track milestone event: ${response.statusText()}`);
    }
    
    const result = await response.json();
    return result.id;
  }
  
  /**
   * Get all responses for a specific form
   * 
   * @param formId The ID of the form
   * @returns Array of form responses
   */
  async getFormResponses(formId: string): Promise<any[]> {
    const response = await this.page.request.get(`/api/research/forms/${formId}/responses`);
    
    if (!response.ok()) {
      throw new Error(`Failed to get form responses: ${response.statusText()}`);
    }
    
    const result = await response.json();
    return result.responses;
  }
  
  /**
   * Generate fake user data for testing
   * 
   * @returns A user data object
   */
  generateTestUser() {
    const userId = `test-${uuidv4()}`;
    
    return {
      id: userId,
      email: `${userId}@example.com`,
      name: `Test User ${userId.slice(0, 5)}`,
      created_at: new Date().toISOString()
    };
  }
  
  /**
   * Create a complete testing setup with a form and milestone trigger
   * 
   * @returns Object with all created test resources
   */
  async setupCompleteTestEnvironment() {
    // Create a multi-milestone survey
    const formId = await this.createMultiMilestoneSurvey();
    
    // Create milestone triggers for the form
    const triggerIds = [];
    const milestones = [
      'onboarding_complete',
      'trip_created',
      'group_formation_complete',
      'vote_process_used',
      'trip_from_template'
    ];
    
    // Create triggers for each milestone
    for (const milestone of milestones) {
      const triggerId = await this.createMilestoneTrigger({
        formId,
        milestone,
        probability: 100
      });
      triggerIds.push(triggerId);
    }
    
    return {
      formId,
      triggerIds,
      milestones
    };
  }
  
  /**
   * Clean up all test resources
   * 
   * @param resources Object containing resource IDs to clean up
   */
  async cleanupTestResources(resources: {
    formId?: string;
    triggerIds?: string[];
  }) {
    // Delete any milestone triggers
    if (resources.triggerIds) {
      for (const triggerId of resources.triggerIds) {
        try {
          await this.page.request.delete(`/api/research/milestone-triggers/${triggerId}`);
        } catch (error) {
          console.warn(`Failed to delete trigger ${triggerId}:`, error);
        }
      }
    }
    
    // Delete the test form
    if (resources.formId) {
      await this.deleteTestForm(resources.formId);
    }
  }
} 