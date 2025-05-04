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
); 