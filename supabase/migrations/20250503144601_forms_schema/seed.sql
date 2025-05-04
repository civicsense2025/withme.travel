-- Seed data for testing form functionality
BEGIN;

-- Insert template form
INSERT INTO forms (
  id,
  title,
  description,
  form_type,
  is_template,
  status,
  created_by,
  is_published
) VALUES (
  '00000000-0000-4000-a000-000000000001',
  'Dietary Restrictions Form',
  'Collect dietary preferences and restrictions from trip participants',
  'logistics',
  true,
  'published',
  (SELECT auth.uid()),
  true
);

-- Insert questions for template
INSERT INTO form_questions (
  form_id,
  question_text,
  description,
  question_type,
  is_required,
  position
) VALUES
(
  '00000000-0000-4000-a000-000000000001',
  'Do you have any dietary restrictions?',
  'Please let us know about any food allergies or restrictions',
  'yes_no',
  true,
  1
),
(
  '00000000-0000-4000-a000-000000000001',
  'What type of dietary restrictions do you have?',
  'Select all that apply',
  'multiple_choice',
  false,
  2
),
(
  '00000000-0000-4000-a000-000000000001',
  'Please provide details about your dietary needs',
  'Any additional information that would help us accommodate your needs',
  'long_text',
  false,
  3
);

-- Get the ID of the second question for options
DO $$
DECLARE
  dietary_question_id UUID;
BEGIN
  SELECT id INTO dietary_question_id FROM form_questions 
  WHERE form_id = '00000000-0000-4000-a000-000000000001' AND position = 2;
  
  -- Insert options for multiple choice question
  INSERT INTO form_question_options (
    question_id,
    option_text,
    option_value,
    position
  ) VALUES
  (dietary_question_id, 'Vegetarian', 'vegetarian', 1),
  (dietary_question_id, 'Vegan', 'vegan', 2),
  (dietary_question_id, 'Gluten-free', 'gluten_free', 3),
  (dietary_question_id, 'Dairy-free', 'dairy_free', 4),
  (dietary_question_id, 'Nut allergy', 'nut_allergy', 5),
  (dietary_question_id, 'Shellfish allergy', 'shellfish_allergy', 6),
  (dietary_question_id, 'Kosher', 'kosher', 7),
  (dietary_question_id, 'Halal', 'halal', 8);
END $$;

-- Insert a test trip if none exists
DO $$
DECLARE
  test_trip_id UUID;
BEGIN
  -- Check if a test trip exists
  SELECT id INTO test_trip_id FROM trips LIMIT 1;
  
  -- If no trip exists, create one
  IF test_trip_id IS NULL THEN
    INSERT INTO trips (
      name,
      description,
      created_by
    ) VALUES (
      'Test Trip for Forms',
      'A test trip to demonstrate form functionality',
      (SELECT auth.uid())
    ) RETURNING id INTO test_trip_id;
    
    -- Add the current user as an admin
    INSERT INTO trip_members (
      trip_id,
      user_id,
      role
    ) VALUES (
      test_trip_id,
      (SELECT auth.uid()),
      'admin'
    );
  END IF;
  
  -- Insert a trip-specific form based on template
  INSERT INTO forms (
    trip_id,
    title,
    description,
    form_type,
    template_id,
    status,
    created_by,
    is_published
  ) VALUES (
    test_trip_id,
    'Dietary Needs for Test Trip',
    'Please share your dietary needs for our trip planning',
    'logistics',
    '00000000-0000-4000-a000-000000000001',
    'published',
    (SELECT auth.uid()),
    true
  );
  
  -- Insert logistics item linked to the form
  INSERT INTO trip_logistics (
    trip_id,
    type,
    title,
    form_id,
    created_by
  ) VALUES (
    test_trip_id,
    'form',
    'Dietary Needs Form',
    (SELECT id FROM forms WHERE trip_id = test_trip_id AND template_id = '00000000-0000-4000-a000-000000000001'),
    (SELECT auth.uid())
  );
END $$;

COMMIT;