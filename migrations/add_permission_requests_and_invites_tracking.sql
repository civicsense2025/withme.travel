-- Add table for permission requests
CREATE TABLE IF NOT EXISTS permission_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Add invited_by field to trip_members table
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);

-- Add referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Add collaborative editing sessions table
CREATE TABLE IF NOT EXISTS collaborative_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'notes', 'itinerary', etc.
  document_id TEXT NOT NULL,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, document_type, document_id)
);

-- Add presence tracking table
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  document_id TEXT,
  status TEXT NOT NULL DEFAULT 'viewing', -- viewing, editing
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trip_id, document_id)
);
