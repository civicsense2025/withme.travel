-- Seed default form templates
INSERT INTO public.form_templates (title, description, category, tags, form_type, is_published, version, template_data)
VALUES
-- Accommodation Form Template
(
    'Accommodation Preferences',
    'Collect accommodation preferences from trip members',
    'accommodation',
    ARRAY['accommodation', 'lodging', 'preferences'],
    'accommodation',
    true,
    1,
    '{
        "questions": [
            {
                "title": "What type of accommodation do you prefer?",
                "description": "Select all that apply",
                "question_type": "multi_select",
                "is_required": true,
                "position": 1,
                "options": {
                    "choices": ["Hotel", "Hostel", "Airbnb/Vacation Rental", "Resort", "Boutique Hotel", "Camping", "RV/Campervan"]
                }
            },
            {
                "title": "What is your preferred budget range per night?",
                "question_type": "select",
                "is_required": true,
                "position": 2,
                "options": {
                    "choices": ["Budget ($0-$50)", "Economy ($51-$100)", "Mid-range ($101-$200)", "Luxury ($201-$500)", "Ultra-luxury ($500+)"]
                }
            },
            {
                "title": "What amenities are most important to you?",
                "description": "Select up to 5",
                "question_type": "multi_select",
                "is_required": true,
                "position": 3,
                "options": {
                    "choices": ["Free WiFi", "Breakfast included", "Swimming pool", "Fitness center", "Air conditioning", "Kitchen", "Private bathroom", "Laundry facilities", "24-hour front desk", "Restaurant on-site", "Bar on-site", "Room service", "Spa services", "Business center", "Pet-friendly", "Family-friendly", "Accessible features"]
                }
            },
            {
                "title": "Do you have any accessibility needs?",
                "question_type": "multi_select",
                "is_required": false,
                "position": 4,
                "options": {
                    "choices": ["Elevator access", "Ground floor room", "Wheelchair accessible", "Accessible bathroom", "Roll-in shower", "Hearing accessible", "No special needs"]
                }
            },
            {
                "title": "Room preference?",
                "question_type": "select",
                "is_required": true,
                "position": 5,
                "options": {
                    "choices": ["Private room", "Shared room with trip members", "No preference"]
                }
            },
            {
                "title": "Bed preference?",
                "question_type": "select",
                "is_required": false,
                "position": 6,
                "options": {
                    "choices": ["King", "Queen", "Double", "Twin", "Single", "No preference"]
                }
            },
            {
                "title": "Any additional accommodation requests or notes?",
                "question_type": "text",
                "is_required": false,
                "position": 7
            }
        ]
    }'::jsonb
),

-- Transportation Form Template
(
    'Transportation Preferences',
    'Collect transportation preferences from trip members',
    'transportation',
    ARRAY['transportation', 'travel', 'preferences'],
    'transportation',
    true,
    1,
    '{
        "questions": [
            {
                "title": "What is your preferred mode of transportation to the destination?",
                "question_type": "select",
                "is_required": true,
                "position": 1,
                "options": {
                    "choices": ["Airplane", "Train", "Bus", "Car", "Ship/Ferry", "Other"]
                }
            },
            {
                "title": "Preferred airline alliance (if applicable)?",
                "question_type": "select",
                "is_required": false,
                "position": 2,
                "options": {
                    "choices": ["Star Alliance", "SkyTeam", "Oneworld", "No preference", "Not applicable"]
                }
            },
            {
                "title": "Preferred cabin class for flights?",
                "question_type": "select",
                "is_required": true,
                "position": 3,
                "options": {
                    "choices": ["Economy", "Premium Economy", "Business", "First Class", "No preference"]
                }
            },
            {
                "title": "What is your preferred transportation while at the destination?",
                "description": "Select all that apply",
                "question_type": "multi_select",
                "is_required": true,
                "position": 4,
                "options": {
                    "choices": ["Rental car", "Rideshare (Uber/Lyft)", "Taxi", "Public transportation", "Walking", "Biking", "Organized tours", "Private driver"]
                }
            },
            {
                "title": "If renting a car, what type do you prefer?",
                "question_type": "select",
                "is_required": false,
                "position": 5,
                "options": {
                    "choices": ["Economy", "Compact", "Mid-size", "Full-size", "SUV", "Luxury", "Van/Minivan", "Not applicable"]
                }
            },
            {
                "title": "Are you willing to drive during the trip?",
                "question_type": "select",
                "is_required": true,
                "position": 6,
                "options": {
                    "choices": ["Yes", "No", "Only in certain conditions"]
                }
            },
            {
                "title": "Any special considerations for transportation (e.g., mobility issues, motion sickness)?",
                "question_type": "text",
                "is_required": false,
                "position": 7
            }
        ]
    }'::jsonb
),

-- Activities Form Template
(
    'Activities Preferences',
    'Collect activity preferences from trip members',
    'activities',
    ARRAY['activities', 'experiences', 'preferences'],
    'activities',
    true,
    1,
    '{
        "questions": [
            {
                "title": "What types of activities are you interested in?",
                "description": "Select all that apply",
                "question_type": "multi_select",
                "is_required": true,
                "position": 1,
                "options": {
                    "choices": ["Cultural sites/Museums", "Outdoor adventure", "Beach/Water activities", "Food and drink experiences", "Shopping", "Nightlife", "Relaxation/Spa", "Guided tours", "Local experiences", "Historical sites", "Nature/Wildlife", "Theme parks", "Sports events"]
                }
            },
            {
                "title": "What is your preferred activity pace?",
                "question_type": "select",
                "is_required": true,
                "position": 2,
                "options": {
                    "choices": ["Relaxed (few planned activities)", "Balanced (mix of activities and free time)", "Active (lots of planned activities)", "Very active (packed itinerary)"]
                }
            },
            {
                "title": "Activity budget preference per person per day?",
                "question_type": "select",
                "is_required": true,
                "position": 3,
                "options": {
                    "choices": ["Budget ($0-$50)", "Moderate ($51-$100)", "Premium ($101-$200)", "Luxury ($201+)"]
                }
            },
            {
                "title": "Are you interested in guided tours?",
                "question_type": "select",
                "is_required": true,
                "position": 4,
                "options": {
                    "choices": ["Yes, I prefer guided experiences", "Sometimes, depends on the activity", "No, I prefer self-guided exploration"]
                }
            },
            {
                "title": "Any physical activity limitations to consider?",
                "question_type": "text",
                "is_required": false,
                "position": 5
            },
            {
                "title": "Any specific activities or attractions you''re excited about?",
                "question_type": "text",
                "is_required": false,
                "position": 6
            },
            {
                "title": "Any activities you want to avoid?",
                "question_type": "text",
                "is_required": false,
                "position": 7
            }
        ]
    }'::jsonb
),

-- Food Preferences Form Template
(
    'Food Preferences',
    'Collect dietary preferences and food interests from trip members',
    'food',
    ARRAY['food', 'dining', 'preferences'],
    'food',
    true,
    1,
    '{
        "questions": [
            {
                "title": "Do you have any dietary restrictions?",
                "description": "Select all that apply",
                "question_type": "multi_select",
                "is_required": true,
                "position": 1,
                "options": {
                    "choices": ["None", "Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "Kosher", "Halal", "Low-carb", "Keto", "Nut allergy", "Shellfish allergy", "Other food allergies"]
                }
            },
            {
                "title": "If you selected food allergies, please provide details:",
                "question_type": "text",
                "is_required": false,
                "position": 2
            },
            {
                "title": "What type of dining experiences are you interested in?",
                "description": "Select all that apply",
                "question_type": "multi_select",
                "is_required": true,
                "position": 3,
                "options": {
                    "choices": ["Local cuisine", "Fine dining", "Casual restaurants", "Street food", "Food tours", "Cooking classes", "Markets", "Quick/Fast food", "Picnics", "Self-catering"]
                }
            },
            {
                "title": "Preferred dining budget per person per meal?",
                "question_type": "select",
                "is_required": true,
                "position": 4,
                "options": {
                    "choices": ["Budget ($0-$15)", "Moderate ($16-$30)", "Premium ($31-$60)", "Luxury ($61+)"]
                }
            },
            {
                "title": "How important is trying local cuisine to you?",
                "question_type": "select",
                "is_required": true,
                "position": 5,
                "options": {
                    "choices": ["Very important", "Somewhat important", "Not very important", "Not important at all"]
                }
            },
            {
                "title": "Any specific food or drinks you want to try on this trip?",
                "question_type": "text",
                "is_required": false,
                "position": 6
            },
            {
                "title": "Any additional food preferences or notes?",
                "question_type": "text",
                "is_required": false,
                "position": 7
            }
        ]
    }'::jsonb
),

-- Trip Feedback Form Template
(
    'Trip Feedback',
    'Collect feedback from trip members after the trip',
    'feedback',
    ARRAY['feedback', 'survey', 'review'],
    'feedback',
    true,
    1,
    '{
        "questions": [
            {
                "title": "Overall, how would you rate your trip experience?",
                "question_type": "select",
                "is_required": true,
                "position": 1,
                "options": {
                    "choices": ["Excellent", "Very good", "Good", "Fair", "Poor"]
                }
            },
            {
                "title": "What were your favorite activities or experiences from the trip?",
                "question_type": "text",
                "is_required": true,
                "position": 2
            },
            {
                "title": "How satisfied were you with the accommodation?",
                "question_type": "select",
                "is_required": true,
                "position": 3,
                "options": {
                    "choices": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
                }
            },
            {
                "title": "How satisfied were you with the transportation arrangements?",
                "question_type": "select",
                "is_required": true,
                "position": 4,
                "options": {
                    "choices": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
                }
            },
            {
                "title": "How satisfied were you with the activities and itinerary?",
                "question_type": "select",
                "is_required": true,
                "position": 5,
                "options": {
                    "choices": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
                }
            },
            {
                "title": "How satisfied were you with the food experiences?",
                "question_type": "select",
                "is_required": true,
                "position": 6,
                "options": {
                    "choices": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
                }
            },
            {
                "title": "What would you change or improve about this trip?",
                "question_type": "text",
                "is_required": false,
                "position": 7
            },
            {
                "title": "Would you recommend this destination to others?",
                "question_type": "select",
                "is_required": true,
                "position": 8,
                "options": {
                    "choices": ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"]
                }
            },
            {
                "title": "Any other comments or feedback?",
                "question_type": "text",
                "is_required": false,
                "position": 9
            }
        ]
    }'::jsonb
);

-- Set secure RLS policies for form templates
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Everyone can view published templates" ON public.form_templates;
    DROP POLICY IF EXISTS "Creators can view their own templates" ON public.form_templates;
    DROP POLICY IF EXISTS "Creators can update their own templates" ON public.form_templates;
    DROP POLICY IF EXISTS "Creators can delete their own templates" ON public.form_templates;
    DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.form_templates;
    
    CREATE POLICY "Everyone can view published templates" ON public.form_templates
        FOR SELECT
        USING (is_published = true);
        
    CREATE POLICY "Creators can view their own templates" ON public.form_templates
        FOR SELECT
        USING (auth.uid() = created_by);
        
    CREATE POLICY "Authenticated users can create templates" ON public.form_templates
        FOR INSERT
        WITH CHECK (auth.uid() = created_by);
        
    CREATE POLICY "Creators can update their own templates" ON public.form_templates
        FOR UPDATE
        USING (auth.uid() = created_by)
        WITH CHECK (auth.uid() = created_by);
        
    CREATE POLICY "Creators can delete their own templates" ON public.form_templates
        FOR DELETE
        USING (auth.uid() = created_by);
END
$$; 