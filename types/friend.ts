import { Profile } from './profile';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at?: string | null;
}

export interface FriendRequestWithProfiles extends FriendRequest {
  sender_profile?: Profile;
  receiver_profile?: Profile;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: string;
}

export interface FriendshipWithProfile extends Friendship {
  friend_profile: Profile;
}

export interface FriendRequestAction {
  request_id: string;
  action: 'accept' | 'decline';
}
