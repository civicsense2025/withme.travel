-- Rollback script to undo form schema changes
BEGIN;

-- Drop views
DROP VIEW IF EXISTS user_saved_items;

-- Drop triggers
DROP TRIGGER IF EXISTS set_forms_updated_at ON forms;
DROP TRIGGER IF EXISTS set_form_questions_updated_at ON form_questions;
DROP TRIGGER IF EXISTS set_form_sessions_updated_at ON form_sessions;
DROP TRIGGER IF EXISTS set_form_responses_updated_at ON form_responses;
DROP TRIGGER IF EXISTS set_trip_logistics_updated_at ON trip_logistics;
DROP TRIGGER IF EXISTS set_form_session_expiration ON form_sessions;
DROP TRIGGER IF EXISTS update_analytics_on_completion ON form_sessions;

-- Drop functions
DROP FUNCTION IF EXISTS update_form_analytics_on_completion();
DROP FUNCTION IF EXISTS set_form_progress_expiration();

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS question_analytics;
DROP TABLE IF EXISTS form_analytics;
DROP TABLE IF EXISTS form_impacts;
DROP TABLE IF EXISTS form_responses;
DROP TABLE IF EXISTS form_sessions;
DROP TABLE IF EXISTS form_question_options;
DROP TABLE IF EXISTS form_questions;
DROP TABLE IF EXISTS trip_logistics;
DROP TABLE IF EXISTS forms;

COMMIT;