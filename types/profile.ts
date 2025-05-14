export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
