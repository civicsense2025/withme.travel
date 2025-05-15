import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanCard } from './group-plan-card';
import { GroupPlanIdea } from './group-plan-idea';
import { GroupMemberList } from './group-member-list';

// Create a wrapper component to display the Group screen
const GroupScreen = () => {
  const members = [
    { id: '1', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=john', role: 'admin', status: 'active' },
    { id: '2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=jane', role: 'member', status: 'active' },
    { id: '3', name: 'Mike Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=mike', role: 'member', status: 'active' },
    { id: '4', name: 'Sarah Williams', avatarUrl: 'https://i.pravatar.cc/150?u=sarah', role: 'member', status: 'active' },
    { id: '5', name: 'Alex Chen', avatarUrl: 'https://i.pravatar.cc/150?u=alex', role: 'member', status: 'active' },
  ];

  const plan = {
    id: '1',
    title: 'Paris Trip',
    description: 'A wonderful weekend in Paris',
    createdAt: '2023-07-20T12:00:00Z',
    createdBy: {
      id: '1',
      name: 'John Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=john',
    },
    votes: {
      upvotes: 5,
      downvotes: 1,
      userVote: null,
    },
    ideas: [
      {
        id: '1',
        title: 'Visit the Eiffel Tower',
        type: 'activity',
        votes: {
          upvotes: 4,
          downvotes: 1,
          userVote: 'up',
        },
      },
      {
        id: '2',
        title: 'Dinner at Le Jules Verne',
        type: 'activity',
        votes: {
          upvotes: 3,
          downvotes: 2,
          userVote: null,
        },
      },
      {
        id: '3',
        title: 'Louvre Museum',
        type: 'activity',
        votes: {
          upvotes: 5,
          downvotes: 0,
          userVote: 'up',
        },
      },
    ],
    members: members,
  };

  const handleVote = (id: string, voteType: 'up' | 'down' | 'none') => {
    console.log(`Voted ${voteType} on idea ${id}`);
  };

  const handleComment = (id: string) => {
    console.log(`Commenting on idea ${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paris Trip Planning</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plans and Members */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Group Plans</h2>
              <GroupPlanCard 
                plan={plan}
                onVote={(id, voteType) => console.log(`Voted ${voteType} on plan ${id}`)}
                onViewDetails={(id) => console.log(`Viewing details for plan ${id}`)}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <GroupMemberList 
                groupId="g1"
                members={members}
                currentUserId="1"
                canManageMembers={true}
                onRemoveMember={(userId) => console.log(`Remove member ${userId}`)}
                onPromoteToAdmin={(userId) => console.log(`Promote member ${userId} to admin`)}
                onDemoteToMember={(userId) => console.log(`Demote admin ${userId} to member`)}
              />
            </div>
          </div>
          
          {/* Middle and Right Columns - Ideas */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Ideas & Suggestions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GroupPlanIdea 
                  id="1" 
                  title="Visit the Eiffel Tower"
                  description="We should definitely visit the Eiffel Tower while in Paris. It's an iconic landmark and offers amazing views of the city."
                  type="activity"
                  createdBy={{
                    id: "1",
                    name: "John Smith",
                    avatarUrl: "https://i.pravatar.cc/150?u=john"
                  }}
                  createdAt="2023-06-20T14:30:00Z"
                  voteCount={5}
                  commentCount={3}
                  metadata={{
                    location: "Eiffel Tower, Paris, France"
                  }}
                  onVote={handleVote}
                  onComment={handleComment}
                />
                
                <GroupPlanIdea 
                  id="2" 
                  title="June 15-20, 2024"
                  description="These dates work well with everyone's schedule and avoid the peak tourist season."
                  type="date"
                  createdBy={{
                    id: "2",
                    name: "Jane Doe",
                    avatarUrl: "https://i.pravatar.cc/150?u=jane"
                  }}
                  createdAt="2023-06-19T10:15:00Z"
                  voteCount={4}
                  commentCount={2}
                  metadata={{
                    date: "June 15-20, 2024"
                  }}
                  onVote={handleVote}
                  onComment={handleComment}
                />
                
                <GroupPlanIdea 
                  id="3" 
                  title="$2,000 per person budget"
                  description="Based on flight costs, accommodation, and activities, we should budget around $2,000 per person for this trip."
                  type="budget"
                  createdBy={{
                    id: "1",
                    name: "John Smith",
                    avatarUrl: "https://i.pravatar.cc/150?u=john"
                  }}
                  createdAt="2023-06-17T16:20:00Z"
                  voteCount={3}
                  commentCount={8}
                  metadata={{
                    cost: "$2,000 per person"
                  }}
                  onVote={handleVote}
                  onComment={handleComment}
                />
                
                <GroupPlanIdea 
                  id="4" 
                  title="Louvre Museum"
                  description="Home to thousands of works of art including the Mona Lisa. We should plan to spend at least half a day here."
                  type="place"
                  imageUrl="https://images.unsplash.com/photo-1565198319382-413ee90b5b33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                  createdBy={{
                    id: "3",
                    name: "Mike Johnson",
                    avatarUrl: "https://i.pravatar.cc/150?u=mike"
                  }}
                  createdAt="2023-06-14T14:20:00Z"
                  voteCount={9}
                  currentVote="up"
                  commentCount={4}
                  metadata={{
                    location: "Louvre Museum, Paris, France"
                  }}
                  tags={["Museum", "Art", "History"]}
                  onVote={handleVote}
                  onComment={handleComment}
                  isPinned={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Screens/Groups/GroupPlanning',
  component: GroupScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GroupScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 