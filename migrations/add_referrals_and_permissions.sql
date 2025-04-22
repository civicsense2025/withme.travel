-- Add referral_code to users/profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES profiles(referral_code);

-- Create a function to generate a random referral code
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
  length INTEGER := 8;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate referral codes for new users
CREATE OR REPLACE FUNCTION create_referral_code() RETURNS TRIGGER AS $
BEGIN
  -- Only generate if null
  IF NEW.referral_code IS NULL THEN
    -- Try up to 5 times to generate a unique code
    FOR i IN 1..5 LOOP
      NEW.referral_code := generate_referral_code();
      
      -- Check if code exists
      IF NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = NEW.referral_code) THEN
        EXIT; -- Exit loop if unique
      END IF;
      
      -- If we've tried 5 times and still have conflicts, add timestamp to ensure uniqueness
      IF i = 5 THEN
        NEW.referral_code := NEW.referral_code || to_char(now(), 'SSMS');
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_referral_code();

-- Create table for tracking invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  token TEXT UNIQUE NOT NULL,
  UNIQUE(trip_id, email)
);

-- Create table for permission requests
CREATE TABLE IF NOT EXISTS permission_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  requested_role TEXT NOT NULL DEFAULT 'editor',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(trip_id, user_id, status)
);

-- Update existing trip_members table to include invited_by
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id);
