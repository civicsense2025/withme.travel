# WithMe Forms

Travel planning involves more than just deciding where to go. It's about bringing friends together, making shared decisions, and creating experiences everyone will love. Our forms feature makes collecting opinions, preferences, and feedback a breeze—no more scrolling through endless group chats to find out who's vegetarian or who wants that sunset sailing trip.

## What Makes Our Forms Special

Unlike typical form builders, WithMe forms are designed specifically for group travel planning. They're conversational, mobile-optimized, and feel like chatting with a friend rather than filling out paperwork. One question at a time keeps focus high and form fatigue low.

### Key Features

- **Pre-populated Trip Forms**: Automatically create forms for common travel planning needs like dietary restrictions, budget preferences, and activity interests.
- **Rich Question Types**: Go beyond basic text inputs with visual selectors, sliders, interactive elements, and specialized trip planning inputs.
- **Smart Conditional Logic**: Show or hide questions based on previous answers to create personalized paths through the form.
- **Analytics & Insights**: Get valuable data on participation rates, response trends, and traveler preferences.
- **Templates Library**: Start with our pre-built templates or save your own custom forms for reuse.
- **Privacy Controls**: Let responders decide what personal details they're comfortable sharing with the group.

## Question Types

Our form system includes a comprehensive set of question types to collect different kinds of feedback and preferences:

### Text Questions
- **Short Text**: For quick, single-line responses
- **Long Text**: For detailed explanations or open-ended feedback
- **Email**: With proper validation for collecting contact information

### Choice Questions
- **Single Choice**: Traditional radio button selection
- **Multiple Choice**: Checkbox options for "select all that apply" scenarios
- **Yes/No**: Simple binary choice questions

### Rating Questions
- **Star Rating**: 1-5 star rating system
- **NPS (Net Promoter Score)**: 0-10 rating scale for satisfaction/recommendation
- **Numeric Scale**: Customizable numeric range (1-10, 1-7, etc.)

### Visual Selectors
- **Image Choice**: Select from a grid of image options
- **Color Picker**: Choose colors that represent mood or preferences
- **Emoji Reaction**: Quick, emotional response with emoji selectors

### Specialized Inputs
- **Date Picker**: Select dates or date ranges for availability
- **Budget Slider**: Set price ranges for accommodation, activities, etc.
- **Location Picker**: Select destinations from a map interface

### Interactive Elements
- **Drag-to-Rank**: Prioritize options by dragging items in order of preference
- **Budget Allocator**: Distribute a fixed budget across different categories
- **Matrix Rating**: Rate multiple aspects on the same scale

### Trip-Specific Questions
- **Activity Interest**: Rate interest levels for different activities
- **Accommodation Style**: Select preferred lodging types with images
- **Dining Preferences**: Special dietary needs and restaurant preferences

### Group Questions
- **Availability Matcher**: Find dates that work for everyone
- **Group Decision**: Anonymous voting on trip options
- **Responsibility Assignment**: Volunteer for trip planning tasks

### Information Screens
- **Welcome Screen**: Introduce the form's purpose and set expectations
- **Instructions**: Provide context or guide users on how to complete a section
- **Thank You**: Confirmation screen after form completion

## Templates & Pre-populated Forms

### Trip Planning Templates
- **Pre-trip Preferences**: Gather initial preferences before planning starts
- **Destination Voting**: Help the group decide where to go
- **Accommodation Survey**: Find out what kind of place everyone wants to stay in
- **Activity Interest**: Gauge interest in various activities and attractions
- **Budget Alignment**: Ensure everyone's on the same page about costs
- **Dietary Needs**: Collect food restrictions and preferences
- **Travel Style**: Understand pace and style preferences (early riser vs. night owl, etc.)

### Usage Scenarios

- **Before Planning**: Send a form to collect initial preferences and constraints
- **During Planning**: Use forms to make group decisions on specific aspects
- **During the Trip**: Gather real-time feedback and preferences as plans evolve
- **Post-Trip**: Collect memories, highlights, and feedback for future trips

## Analytics & Insights

### For Trip Organizers
- **Response Dashboard**: See who has responded and who still needs to
- **Preference Visualization**: Visual charts showing the group's collective preferences
- **Compatibility Analysis**: Identify areas of agreement and potential conflicts
- **Popular Options**: See which options received the most votes or highest ratings
- **Export Options**: Download response data for offline analysis

### For Admins
- **Form Performance**: Track completion rates, drop-off points, and time spent
- **Question Analysis**: Identify confusing or problematic questions
- **Usage Statistics**: Monitor form creation and submission metrics
- **Device Analytics**: See what devices people use to complete forms
- **Feature Adoption**: Track which question types and templates are most popular

## Implementation

Forms are built using React components with a modular architecture that supports:

- Progressive loading for fast initial display
- Keyboard navigation for accessibility
- Responsive design that works on all devices
- Offline support for completing forms without connectivity
- Real-time validation to catch errors early

### Adding Forms to Your Trip

```tsx
import { TripPreferenceForm } from '@/components/feedback/templates';

// In your trip component
function TripPage({ tripId, tripName }) {
  return (
    <div>
      <h1>{tripName}</h1>
      
      {/* Add a preference form */}
      <TripPreferenceForm 
        tripId={tripId}
        tripName={tripName}
        onSubmit={handlePreferencesSubmit}
      />
      
      {/* Rest of your trip page */}
    </div>
  );
}
```

### Viewing Form Analytics

```tsx
import { UserResponseSummary } from '@/components/feedback/analytics';

// In your trip dashboard
function TripPreferenceSummary({ tripId, questions, responses, members }) {
  return (
    <div>
      <h2>Group Preferences</h2>
      
      <UserResponseSummary
        tripId={tripId}
        tripName="Summer Getaway"
        formTitle="Trip Preferences"
        questions={questions}
        responses={responses}
        sessions={sessions}
        memberCount={members.length}
      />
    </div>
  );
}
```

## Integration with Other Features

- **Itinerary Builder**: Use form responses to auto-suggest itinerary items
- **Budget Planner**: Incorporate budget preferences into trip cost estimates
- **Destination Recommendations**: Suggest destinations based on group preferences
- **Trip Roles**: Assign planning responsibilities based on form responses
- **Custom Trip Homepage**: Personalize trip views based on traveler preferences

---

The forms system provides a foundation for collecting structured information throughout the trip planning process while maintaining the casual, conversational feel that makes WithMe unique.
