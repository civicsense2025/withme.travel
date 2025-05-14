// Group-related constants for withme.travel
export const GROUP_TABLES = {
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  GROUP_PLANS: 'group_plans',
  GROUP_PLAN_IDEAS: 'group_plan_ideas',
  GROUP_PLAN_IDEA_COMMENTS: 'group_plan_idea_comments',
  GROUP_PLAN_IDEA_REACTIONS: 'group_plan_idea_reactions',
  GROUP_PLAN_IDEA_VOTES: 'group_plan_idea_votes',
  GROUP_PLAN_EVENTS: 'group_plan_events',
  GROUP_ROLES: 'group_roles',
  GROUP_TRIPS: 'group_trips',
  GROUP_ACTIVITIES: 'group_activities',
  GROUP_BOARD_LOG: 'group_board_log',
  GROUP_PLANS_LOG: 'group_plans_log',
  GROUP_GUEST_MEMBERS: 'group_guest_members',
  GROUP_IDEAS: 'group_ideas',
};

export const GROUP_ENUMS = {
  GROUP_MEMBER_ROLES: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
  },
  GROUP_MEMBER_STATUSES: {
    INVITED: 'invited',
    ACTIVE: 'active',
    LEFT: 'left',
    REMOVED: 'removed',
  },
  GROUP_PLAN_IDEA_TYPE: {
    DESTINATION: 'destination',
    DATE: 'date',
    ACTIVITY: 'activity',
    BUDGET: 'budget',
    OTHER: 'other',
    QUESTION: 'question',
    NOTE: 'note',
    PLACE: 'place',
  },
};

export const GROUP_FIELDS = {
  GROUPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
    SLUG: 'slug',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  GROUP_PLAN_IDEAS: {
    ID: 'id',
    GROUP_ID: 'group_id',
    CREATED_BY: 'created_by',
    GUEST_TOKEN: 'guest_token',
    TYPE: 'type',
    TITLE: 'title',
    DESCRIPTION: 'description',
    POSITION: 'position',
    VOTES_UP: 'votes_up',
    VOTES_DOWN: 'votes_down',
    SELECTED: 'selected',
    META: 'meta',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
};
