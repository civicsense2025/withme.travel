# Forms Feature Documentation

## Overview

The Forms feature provides a dynamic system for creating, managing, and rendering **conversational, one-question-at-a-time forms** within the withme.travel application, similar in style to platforms like Typeform. It allows users (admins or specific roles) to build engaging custom forms with various question types, enabling end-users to fill them out seamlessly in a mobile-optimized, chat-like interface. This feature is built with flexibility in mind, allowing for future integration with trips, user preferences, and collaborative planning.

## Core Components

The feature is primarily composed of the following key components located in `app/forms/`:

1.  **`FormBuilder.tsx` (`app/forms/components/FormBuilder.tsx`)**

    - **Purpose:** Enables users to create new forms or edit existing ones through a user-friendly interface.
    - **Features:**
      - **Step-by-Step Creation:** Guides users through defining form details (title, description, emoji), adding questions, and configuring settings.
      - **Question Management:** Allows adding, removing, reordering, and editing various question types.
      - **Styling & Theming:** Provides options for basic customization like theme colors and font families.
      - **Settings:** Configures form visibility, response options (anonymous, progress bar, question numbers).
      - **Templates:** Includes predefined templates (e.g., Customer Feedback, Event Registration, Travel Preferences) to kickstart form creation.
      - **Local Persistence:** Saves draft forms in the browser's local storage to prevent data loss during creation.
      - **Preview:** (Planned) Allows builders to see how the form will look to respondents.

2.  **`FormRenderer.tsx` (`app/forms/components/FormRenderer.tsx`)**

    - **Purpose:** Renders a published form for end-users to view and submit responses, focusing on a **one-question-at-a-time, conversational flow**.
    - **Features:**
      - **Conversational Rendering:** Displays questions individually, adapting the input component based on the question type (Short Text, Long Text, Single Choice, Multiple Choice, Yes/No, Rating, Date, Email, Number, Statement).
      - **Conditional Logic:** (Basic implementation) Shows or hides the _next_ question based on answers to the current question, enhancing the conversational flow.
      - **Validation:** Uses the Zod schemas defined in `FormTypes.ts` to validate user input in real-time and on submission.
      - **Progress Tracking:** Optionally displays a progress bar and question numbers, crucial for longer conversational forms.
      - **Navigation:** Provides "Next" and "Previous" buttons for navigating through questions.
      - **Submission:** Handles the final submission process, including sending data (currently conceptual, needs backend integration) and displaying a customizable completion screen (Thank You type).
      - **Response Timing:** Tracks time spent per question and total completion time.

3.  **`FormTypes.ts` (`app/forms/FormTypes.ts`)**
    - **Purpose:** Acts as the single source of truth for data structures related to the forms feature.
    - **Contents:**
      - **TypeScript Enums:** Defines standard values for `QuestionType` (including `WELCOME` and `THANK_YOU` screen types), `FormVisibility`, `FormStatus`, etc.
      - **Database Types (`Db*`)**: Represents the expected structure of data stored in the Supabase database.
      - **Application Types:** Defines the shapes of objects used within the React components (e.g., `Form`, `Question`, `ResponseSession`).
      - **Zod Schemas:** Provides runtime validation schemas (`createFormSchema`, `createQuestionSchema`, etc.).
      - **Mapping Functions:** Includes helper functions (`mapDbFormToForm`, `mapDbQuestionToQuestion`, etc.).

## Key Features Implemented

- **Form Creation & Editing:** A multi-step builder interface.
- **Conversational Form Rendering:** Displays questions one at a time.
- **Variety of Question Types:** Support for common inputs, plus Welcome/Statement/Thank You screens.
- **Client-Side Validation:** Robust input validation using Zod.
- **Basic Styling Options:** Theme color and font family.
- **Draft Persistence:** Builder progress saved locally.
- **Basic Conditional Logic:** Show/hide next question.

## Future Expansion Ideas for a Typeform-like Experience

To further enhance the conversational nature and feature set:

1.  **Database Integration:**
    - Fully implement saving/loading forms (`forms`, `questions`) and responses (`responses`, `response_sessions`) to Supabase.
    - Implement `form_templates` table for reusable, shared templates.
2.  **Layout & Rendering Options:**
    - **Explicit Layout Toggle:** Add a setting in `FormBuilder` and `forms` table to explicitly choose between "One Question at a Time" vs. traditional multi-question page layouts.
    - **Enhanced Styling:** Allow custom background images/videos, more font choices, button style customization (store in `forms.theme_options JSONB`?).
    - **Welcome & Thank You Screens:** Fully implement the `WELCOME` and `THANK_YOU` question types in the `FormRenderer` with customizable text, images, and button links.
3.  **Advanced Conversational Features:**
    - **Answer Piping:** Modify `FormRenderer` to inject answers from previous questions into the text of later questions (e.g., "Okay {name}, what's your main goal for this trip?").
    - **Advanced Conditional Logic:** Implement full branching stored in the `question_branching` table, allowing jumps to non-sequential questions.
    - **Hidden Fields:** Allow passing pre-filled data (e.g., user ID, trip ID) into the form submission without showing it to the user.
4.  **Trip & User Integration:**
    - Link forms to trips (`forms.trip_id` or junction table).
    - Use forms for:
      - **Pre-Trip Surveys:** Gather preferences (dietary needs, budget, activity interests, travel style).
      - **Post-Trip Feedback / Reviews:** Collect feedback on the trip experience or specific activities/accommodations.
      - **Bug Reports / Feature Requests:** Allow users to submit feedback about the application itself.
      - **Waivers/Agreements:** Handle simple waivers or agreements.
      - **RSVPs:** Manage RSVPs for specific trip events or activities.
    - Pre-fill fields from `profiles`.
    - Link responses to `user_id` (`response_sessions.respondent_id`).
    - (Optional) Save specific answers back to `user_preferences`.
5.  **Collaboration & Permissions:**
    - Implement `form_collaborators` table and logic for multi-user editing.
    - Refine RLS policies for secure access based on roles and form visibility.
6.  **Enhanced Features:**
    - **Response Analysis:** Dashboard view for aggregated/individual responses.
    - **File Uploads:** Implement `FILE_UPLOAD` question type with Supabase Storage.
    - **Location Question Type:** Integrate map input.
    - **Template Library:** Build rich, shareable travel `form_templates`.
    - **Notifications:** Use `notifications` table for response alerts.
    - **Integrations:** Connect to other tools (Slack, Google Sheets, etc.) via Supabase Functions or webhooks triggered on form submission.
    - **Embedding:** Provide easy options (iframe, script) to embed forms on external sites or within the app.

## Database Schema

The corresponding SQL schema definitions required to support this feature in the Supabase database are provided in the `forms_schema.sql` file. This schema includes tables for forms, questions, responses, sessions, collaborators, and templates.

_(For more information on Markdown syntax, see the [Markdown Guide](https://www.markdownguide.org/getting-started/))_
