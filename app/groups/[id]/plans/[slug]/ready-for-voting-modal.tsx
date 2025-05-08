'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ThumbsUp, 
  Users, 
  ArrowRight,
  MapPin,
  Calendar,
  Activity,
  DollarSign,
  FileText
} from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { ColumnId as LocalColumnId } from './store/idea-store';
import { Progress } from '@/components/ui/progress';

interface ReadyForVotingModalProps {
  onClose: () => void;
  groupId: string;
  planSlug: string;
}

export function ReadyForVotingModal({
  onClose,
  groupId,
  planSlug
}: ReadyForVotingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [ideasByType, setIdeasByType] = useState<Record<LocalColumnId, number>>({
    destination: 0,
    date: 0,
    activity: 0,
    budget: 0,
    other: 0
  });
  
  // Fetch group ideas and members
  useEffect(() => {
    async function fetchData() {
      if (!groupId) return;
      
      try {
        const supabase = getBrowserClient();
        
        // Fetch group members
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            id,
            user_id,
            profiles:user_id (
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .eq('status', 'active');
          
        if (membersError) throw membersError;
        setActiveMembers(membersData || []);
        
        // Fetch ideas count
        const { data: ideasData, error: ideasError } = await supabase
          .from('group_ideas')
          .select('id, type')
          .eq('group_id', groupId);
          
        if (ideasError) throw ideasError;
        
        setTotalIdeas(ideasData?.length || 0);
        
        // Count ideas by type
        const counts: Record<LocalColumnId, number> = {
          destination: 0,
          date: 0,
          activity: 0,
          budget: 0,
          other: 0
        };
        
        ideasData?.forEach(idea => {
          if (idea.type && (['destination','date','activity','budget','other'] as LocalColumnId[]).includes(idea.type)) {
            counts[idea.type as LocalColumnId]++;
          }
        });
        
        setIdeasByType(counts);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load group data.",
          variant: "destructive"
        });
      }
    }
    
    fetchData();
  }, [groupId, toast]);
  
  const handleStartVoting = async () => {
    setIsLoading(true);
    
    try {
      // Update the group status to "voting" in the database
      const { error } = await getBrowserClient()
        .from('groups')
        .update({ status: 'voting' })
        .eq('id', groupId);
        
      if (error) throw error;
      
      // Navigate to the voting page
      setTimeout(() => {
        router.push(`/groups/${groupId}/plans/${planSlug}/vote`);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting voting phase:', error);
      toast({
        title: "Error",
        description: "Failed to start voting. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Calculate if all idea types have at least one idea
  const allTypesHaveIdeas = Object.values(ideasByType).every(count => count > 0);

  // Calculate progress percentage (0-100)
  const progressPercentage = Object.values(ideasByType).filter(count => count > 0).length * 20;
  
  // Get icon for each idea type
  const getTypeIcon = (type: LocalColumnId) => {
    switch (type) {
      case 'destination': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'date': return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'activity': return <Activity className="h-4 w-4 text-green-500" />;
      case 'budget': return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'other': return <FileText className="h-4 w-4 text-purple-500" />;
    }
  };
  
  // Get background color for progress items
  const getProgressColor = (type: LocalColumnId, isComplete: boolean) => {
    if (!isComplete) return 'bg-gray-100';
    
    switch (type) {
      case 'destination': return 'bg-blue-100 border-blue-300';
      case 'date': return 'bg-yellow-100 border-yellow-300';
      case 'activity': return 'bg-green-100 border-green-300';
      case 'budget': return 'bg-orange-100 border-orange-300';
      case 'other': return 'bg-purple-100 border-purple-300';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Ready for Voting!
          </DialogTitle>
          <DialogDescription>
            Your group has collected {totalIdeas} ideas. Now it's time to vote on them!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Progress indicator */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Idea Collection Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-5 gap-2 mt-4">
              {(['destination', 'date', 'activity', 'budget', 'other'] as LocalColumnId[]).map((type) => {
                const isComplete = ideasByType[type] > 0;
                return (
                  <motion.div
                    key={type}
                    className={`flex flex-col items-center p-3 rounded-lg border ${getProgressColor(type, isComplete)}`}
                    whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-1">
                      {getTypeIcon(type)}
                    </div>
                    <div className="text-xs font-medium text-center capitalize">
                      {type}
                    </div>
                    <div className="text-xs mt-1">
                      {isComplete ? (
                        <Badge variant="outline" className="bg-white">
                          {ideasByType[type]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white text-gray-400">
                          0
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          <div className="flex items-center justify-center space-x-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ThumbsUp className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-1 w-20 bg-primary rounded-full origin-left"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Users className="h-10 w-10 text-primary" />
            </motion.div>
          </div>
          
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Group Progress</h3>
                <Badge variant={allTypesHaveIdeas ? "default" : "outline"} className={allTypesHaveIdeas ? "bg-green-50 text-green-700" : ""}>
                  {allTypesHaveIdeas ? "All Categories Complete" : "Categories In Progress"}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your group has brainstormed {totalIdeas} ideas across all categories!
                Now it's time to vote on which ones to include in your trip.
              </p>
              
              {/* Ideas by category */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📍</span>
                  <span className="text-sm">Destinations: {ideasByType.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">📅</span>
                  <span className="text-sm">Dates: {ideasByType.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🏄‍♂️</span>
                  <span className="text-sm">Activities: {ideasByType.activity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">💰</span>
                  <span className="text-sm">Budget: {ideasByType.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">💭</span>
                  <span className="text-sm">Other: {ideasByType.other}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                <div className="flex -space-x-3">
                  {activeMembers.slice(0, 5).map(member => (
                    <Avatar key={member.id} className="border-2 border-background">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {(member.profiles?.full_name || 'Guest').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {activeMembers.length > 5 && (
                    <Avatar className="border-2 border-background">
                      <AvatarFallback>+{activeMembers.length - 5}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <span className="text-sm">
                  {activeMembers.length} group members can vote
                </span>
              </div>
            </CardContent>
          </Card>
          
          <div className="rounded-lg border p-4 bg-amber-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">What happens next?</p>
                <p>Moving to voting will allow all group members to vote on favorite ideas. The most popular ideas will be used to create your trip.</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartVoting}
            disabled={isLoading || totalIdeas === 0} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Start Voting
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 