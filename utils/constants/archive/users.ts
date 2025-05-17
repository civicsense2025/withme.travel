// User-related constants for withme.travel
export const USER_TABLES = {
  USERS: 'profiles',
  PROFILES: 'profiles',
  USER_PREFERENCES: 'user_preferences',
  USER_PRESENCE: 'user_presence',
  USER_INTERESTS: 'user_interests',
  USER_LOGIN_HISTORY: 'user_login_history',
  USER_TESTING_SIGNUPS: 'user_testing_signups',
  USER_TRAVEL: 'user_travel',
};

export const USER_ENUMS = {
  USER_ROLE: {
    ADMIN: 'admin',
    MEMBER: 'member',
    GUEST: 'guest',
    PARTICIPANT: 'participant',
  },
};

export const USER_FIELDS = {
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    AVATAR_URL: 'avatar_url',
  },
};
