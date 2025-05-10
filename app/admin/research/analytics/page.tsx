'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/ssr';
import { ArrowLeft, BarChart, Users, FileSpreadsheet, Target, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend as ReLegend
} from 'recharts';
import { DataTable } from '@/components/ui/data-table';
import { MilestoneType } from '@/types/research';

// Mapping of milestone types to human-readable names
const MILESTONE_LABELS = {
  [MilestoneType.COMPLETE_ONBOARDING]: 'Completed Onboarding',
  [MilestoneType.ITINERARY_MILESTONE_3_ITEMS]: 'Added 3+ Itinerary Items',
  [MilestoneType.GROUP_FORMATION_COMPLETE]: 'Created a Group',
  [MilestoneType.VOTE_PROCESS_USED]: 'Used Voting Feature',
  [MilestoneType.TRIP_FROM_TEMPLATE_CREATED]: 'Created Trip from Template'
};

export default function ResearchAnalyticsPage() {
  const searchParams = useSearchParams();
  const studyId = searchParams.get('studyId');
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(studyId);
  const [studies, setStudies] = useState<any[]>([]);
  const [studyName, setStudyName] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [milestoneData, setMilestoneData] = useState<any[]>([]);
  const [surveyCompletionData, setSurveyCompletionData] = useState<any[]>([]);
  const [eventsOverTime, setEventsOverTime] = useState<any[]>([]);
  const [variantData, setVariantData] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load available studies
  useEffect(() => {
    const loadStudies = async () => {
      const { data: studiesData, error } = await supabase
        .from('research_studies')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading studies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load research studies.',
          variant: 'destructive',
        });
        return;
      }
      
      setStudies(studiesData || []);
      
      // If studyId was passed in URL and exists in the list, set it as selected
      if (studyId) {
        const study = studiesData?.find(s => s.id === studyId);
        if (study) {
          setSelectedStudyId(studyId);
          setStudyName(study.name);
        }
      }
    };
    
    loadStudies();
  }, [supabase, studyId, toast]);
  
  // Load analytics data when study is selected
  useEffect(() => {
    if (!selectedStudyId) {
      setIsLoading(false);
      return;
    }
    
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      try {
        // Get study name
        const { data: studyData } = await supabase
          .from('research_studies')
          .select('name')
          .eq('id', selectedStudyId)
          .single();
          
        if (studyData) {
          setStudyName(studyData.name);
        }
        
        // Get participant count
        const { count: participantCount } = await supabase
          .from('research_participants')
          .select('*', { count: 'exact', head: true })
          .eq('study_id', selectedStudyId);
          
        setParticipantCount(participantCount || 0);
        
        // Get milestone completions
        const { data: milestones } = await supabase
          .from('milestone_completions')
          .select('milestone_type, count(*)')
          .eq('study_id', selectedStudyId)
          .group('milestone_type');
          
        // Format milestone data for chart
        const formattedMilestones = (milestones || []).map(milestone => ({
          name: MILESTONE_LABELS[milestone.milestone_type as MilestoneType] || milestone.milestone_type,
          value: milestone.count
        }));
        
        setMilestoneData(formattedMilestones);
        
        // Get survey completions
        const { data: surveyShown } = await supabase
          .from('research_events')
          .select('count(*)')
          .eq('study_id', selectedStudyId)
          .eq('event_type', 'survey_shown')
          .single();
          
        const { data: surveyCompleted } = await supabase
          .from('research_events')
          .select('count(*)')
          .eq('study_id', selectedStudyId)
          .eq('event_type', 'survey_completed')
          .single();
          
        const { data: surveyDismissed } = await supabase
          .from('research_events')
          .select('count(*)')
          .eq('study_id', selectedStudyId)
          .eq('event_type', 'survey_dismissed')
          .single();
          
        // Format survey completion data
        const surveyData = [
          { name: 'Completed', value: surveyCompleted?.count || 0 },
          { name: 'Dismissed', value: surveyDismissed?.count || 0 },
          { 
            name: 'Not Interacted', 
            value: Math.max(
              0, 
              (surveyShown?.count || 0) - (surveyCompleted?.count || 0) - (surveyDismissed?.count || 0)
            )
          }
        ];
        
        setSurveyCompletionData(surveyData);
        
        // Get event counts over time (last 10 days)
        const today = new Date();
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(today.getDate() - 10);
        
        const { data: dailyEvents } = await supabase
          .from('research_events')
          .select('created_at')
          .eq('study_id', selectedStudyId)
          .gte('created_at', tenDaysAgo.toISOString());
          
        // Group by day
        const eventsByDay = new Map();
        const days = [];
        
        // Create a list of the last 10 days
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          days.unshift(dateStr); // Add to beginning so dates are in ascending order
          eventsByDay.set(dateStr, 0);
        }
        
        // Count events by day
        (dailyEvents || []).forEach(event => {
          const dateStr = event.created_at.split('T')[0];
          if (eventsByDay.has(dateStr)) {
            eventsByDay.set(dateStr, eventsByDay.get(dateStr) + 1);
          }
        });
        
        // Format for chart
        const eventsOverTimeData = days.map(day => ({
          date: day,
          events: eventsByDay.get(day) || 0
        }));
        
        setEventsOverTime(eventsOverTimeData);
        
        // Get variant distribution data
        const { data: variants } = await supabase
          .from('ab_test_variants')
          .select('id, name')
          .eq('study_id', selectedStudyId);
          
        if (variants && variants.length > 0) {
          // For each variant, get count of participants
          const variantPromises = variants.map(async variant => {
            const { count } = await supabase
              .from('participant_variants')
              .select('*', { count: 'exact', head: true })
              .eq('variant_id', variant.id);
              
            return {
              name: variant.name,
              value: count || 0
            };
          });
          
          const variantCounts = await Promise.all(variantPromises);
          setVariantData(variantCounts);
        }
        
        // Get raw events for data table (latest 100)
        const { data: events } = await supabase
          .from('research_events')
          .select('id, participant_id, event_type, event_data, created_at')
          .eq('study_id', selectedStudyId)
          .order('created_at', { ascending: false })
          .limit(100);
          
        setRawEvents(events || []);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load research analytics data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [selectedStudyId, supabase, toast]);
  
  // Export events as CSV
  const exportEvents = async () => {
    if (!selectedStudyId) return;
    
    try {
      // Get all events for the study
      const { data: allEvents, error } = await supabase
        .from('research_events')
        .select('*')
        .eq('study_id', selectedStudyId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert to CSV
      const headers = ['id', 'participant_id', 'study_id', 'event_type', 'created_at', 'event_data'];
      
      let csv = headers.join(',') + '\n';
      
      allEvents.forEach(event => {
        const row = [
          event.id,
          event.participant_id,
          event.study_id,
          event.event_type,
          event.created_at,
          JSON.stringify(event.event_data || {}).replace(/,/g, ';') // Replace commas in JSON to not break CSV
        ];
        
        csv += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `study_${selectedStudyId}_events.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Export complete',
        description: 'Events exported successfully.',
      });
    } catch (error) {
      console.error('Error exporting events:', error);
      toast({
        title: 'Export error',
        description: 'Failed to export research events.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/research">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Research Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedStudyId || ''} onValueChange={setSelectedStudyId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a study" />
            </SelectTrigger>
            <SelectContent>
              {studies.map(study => (
                <SelectItem key={study.id} value={study.id}>
                  {study.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedStudyId && (
            <Button variant="outline" size="sm" onClick={exportEvents}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>
      </div>
      
      {!selectedStudyId ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a study to view analytics</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{participantCount}</div>
                <p className="text-xs text-muted-foreground">
                  Unique research participants
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Survey Completions</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {surveyCompletionData.find(d => d.name === 'Completed')?.value || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Surveys completed by participants
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Milestone Completions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {milestoneData.reduce((sum, d) => sum + d.value, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total milestones reached
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Tracked</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rawEvents.length > 0 ? '100+' : '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Research events recorded
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="surveys">Surveys</TabsTrigger>
              {variantData.length > 0 && (
                <TabsTrigger value="variants">A/B Tests</TabsTrigger>
              )}
              <TabsTrigger value="rawData">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Events Over Time</CardTitle>
                  <CardDescription>
                    Research events captured over the last 10 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {eventsOverTime.length > 0 ? (
                    <ChartContainer config={{}}>
                      <ReBarChart
                        data={eventsOverTime}
                        index="date"
                        categories={['events']}
                        colors={['blue']}
                        yAxisWidth={40}
                        showLegend={false}
                      >
                        <XAxis
                          dataKey="date"
                          tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString();
                          }}
                        />
                        <YAxis />
                        <ReTooltip
                          labelFormatter={(value) => {
                            return `Events: ${value}`;
                          }}
                        />
                      </ReBarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No event data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Completion</CardTitle>
                    <CardDescription>
                      Distribution of completed milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {milestoneData.length > 0 ? (
                      <ChartContainer config={{}}>
                        <RePieChart
                          data={milestoneData}
                          index="name"
                          valueKey="value"
                          colors={['blue', 'green', 'yellow', 'red', 'purple']}
                        >
                          <Pie
                            data={milestoneData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {milestoneData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            labelFormatter={(value) => {
                              return `${value} participants`;
                            }}
                          />
                          <ReLegend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                          />
                        </RePieChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No milestone data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Interaction</CardTitle>
                    <CardDescription>
                      How participants interact with surveys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {surveyCompletionData.some(d => d.value > 0) ? (
                      <ChartContainer config={{}}>
                        <RePieChart
                          data={surveyCompletionData}
                          index="name"
                          valueKey="value"
                          colors={['green', 'yellow', 'red']}
                        >
                          <Pie
                            data={surveyCompletionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {surveyCompletionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            labelFormatter={(value) => {
                              return `${value} participants`;
                            }}
                          />
                          <ReLegend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                          />
                        </RePieChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No survey data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="milestones">
              <Card>
                <CardHeader>
                  <CardTitle>Milestone Completion Details</CardTitle>
                  <CardDescription>
                    Detailed breakdown of user progress through research milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {milestoneData.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Completion Rates</h3>
                          <div className="space-y-4">
                            {milestoneData.map(milestone => (
                              <div key={milestone.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{milestone.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {milestone.value} participants
                                  </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{
                                      width: `${Math.min(100, (milestone.value / participantCount) * 100)}%`
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {participantCount > 0
                                    ? `${((milestone.value / participantCount) * 100).toFixed(1)}% of participants`
                                    : '0% of participants'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Milestone Distribution</h3>
                          <div className="h-[300px]">
                            <ChartContainer config={{}}>
                              <RePieChart
                                data={milestoneData}
                                index="name"
                                valueKey="value"
                                colors={['blue', 'green', 'yellow', 'red', 'purple']}
                              >
                                <Pie
                                  data={milestoneData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {milestoneData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  labelFormatter={(value) => {
                                    return `${value} participants`;
                                  }}
                                />
                                <ReLegend
                                  layout="vertical"
                                  verticalAlign="middle"
                                  align="right"
                                />
                              </RePieChart>
                            </ChartContainer>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Milestone Funnel</h3>
                        <div className="flex items-end h-[200px] space-x-2">
                          {Object.values(MilestoneType).map(milestoneType => {
                            const data = milestoneData.find(
                              d => d.name === MILESTONE_LABELS[milestoneType as MilestoneType]
                            );
                            const value = data?.value || 0;
                            const percentage = participantCount > 0
                              ? (value / participantCount) * 100
                              : 0;
                              
                            return (
                              <div
                                key={milestoneType}
                                className="flex-1 flex flex-col items-center"
                              >
                                <div className="text-sm font-medium mb-2">
                                  {percentage.toFixed(1)}%
                                </div>
                                <div
                                  className="w-full bg-primary rounded-t-md"
                                  style={{ height: `${Math.max(10, percentage)}%` }}
                                />
                                <div className="text-xs text-muted-foreground mt-2 text-center">
                                  {MILESTONE_LABELS[milestoneType as MilestoneType]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No milestone data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="surveys">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Response Analytics</CardTitle>
                  <CardDescription>
                    Detailed analysis of survey responses and completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {surveyCompletionData.some(d => d.value > 0) ? (
                    <div className="space-y-8">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Response Rates</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Completion Rate</span>
                                <span className="text-sm text-muted-foreground">
                                  {surveyCompletionData.find(d => d.name === 'Completed')?.value || 0} / 
                                  {surveyCompletionData.reduce((sum, d) => sum + d.value, 0)} surveys
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${
                                      surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                        ? ((surveyCompletionData.find(d => d.name === 'Completed')?.value || 0) /
                                           surveyCompletionData.reduce((sum, d) => sum + d.value, 0)) * 100
                                        : 0
                                    }%`
                                  }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                  ? `${(
                                      ((surveyCompletionData.find(d => d.name === 'Completed')?.value || 0) /
                                       surveyCompletionData.reduce((sum, d) => sum + d.value, 0)) * 100
                                    ).toFixed(1)}% completion rate`
                                  : '0% completion rate'}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Dismissal Rate</span>
                                <span className="text-sm text-muted-foreground">
                                  {surveyCompletionData.find(d => d.name === 'Dismissed')?.value || 0} / 
                                  {surveyCompletionData.reduce((sum, d) => sum + d.value, 0)} surveys
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-destructive"
                                  style={{
                                    width: `${
                                      surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                        ? ((surveyCompletionData.find(d => d.name === 'Dismissed')?.value || 0) /
                                           surveyCompletionData.reduce((sum, d) => sum + d.value, 0)) * 100
                                        : 0
                                    }%`
                                  }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                  ? `${(
                                      ((surveyCompletionData.find(d => d.name === 'Dismissed')?.value || 0) /
                                       surveyCompletionData.reduce((sum, d) => sum + d.value, 0)) * 100
                                    ).toFixed(1)}% dismissal rate`
                                  : '0% dismissal rate'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Survey Interaction Distribution</h3>
                          <div className="h-[300px]">
                            <ChartContainer config={{}}>
                              <RePieChart
                                data={surveyCompletionData}
                                index="name"
                                valueKey="value"
                                colors={['green', 'red', 'gray']}
                              >
                                <Pie
                                  data={surveyCompletionData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {surveyCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  labelFormatter={(value) => {
                                    return `${value} participants`;
                                  }}
                                />
                                <ReLegend
                                  layout="vertical"
                                  verticalAlign="middle"
                                  align="right"
                                />
                              </RePieChart>
                            </ChartContainer>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Survey Response Funnel</h3>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Surveys Shown</span>
                          <span>Surveys Completed</span>
                        </div>
                        <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-primary rounded-l-full"
                            style={{
                              width: `${
                                surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                  ? 100
                                  : 0
                              }%`
                            }}
                          />
                          <div
                            className="absolute inset-y-0 left-0 bg-green-500"
                            style={{
                              width: `${
                                surveyCompletionData.reduce((sum, d) => sum + d.value, 0) > 0
                                  ? ((surveyCompletionData.find(d => d.name === 'Completed')?.value || 0) /
                                     surveyCompletionData.reduce((sum, d) => sum + d.value, 0)) * 100
                                  : 0
                              }%`
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {surveyCompletionData.find(d => d.name === 'Completed')?.value || 0} / 
                            {surveyCompletionData.reduce((sum, d) => sum + d.value, 0)} surveys completed
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No survey data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {variantData.length > 0 && (
              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle>A/B Test Variants</CardTitle>
                    <CardDescription>
                      Distribution and performance of A/B test variants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {variantData.length > 0 ? (
                      <div className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Variant Assignment</h3>
                            <div className="space-y-4">
                              {variantData.map(variant => (
                                <div key={variant.name} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{variant.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {variant.value} participants
                                    </span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (variant.value /
                                            variantData.reduce((sum, d) => sum + d.value, 0)) *
                                            100
                                        )}%`
                                      }}
                                    />
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {variantData.reduce((sum, d) => sum + d.value, 0) > 0
                                      ? `${(
                                          (variant.value /
                                            variantData.reduce((sum, d) => sum + d.value, 0)) *
                                          100
                                        ).toFixed(1)}% of participants`
                                      : '0% of participants'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Variant Distribution</h3>
                            <div className="h-[300px]">
                              <ChartContainer config={{}}>
                                <RePieChart
                                  data={variantData}
                                  index="name"
                                  valueKey="value"
                                  colors={['blue', 'green', 'yellow', 'red', 'purple']}
                                >
                                  <Pie
                                    data={variantData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {variantData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    labelFormatter={(value) => {
                                      return `${value} participants`;
                                    }}
                                  />
                                  <ReLegend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                  />
                                </RePieChart>
                              </ChartContainer>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">No A/B test data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="rawData">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Event Data</CardTitle>
                  <CardDescription>
                    Recent research events (latest 100)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rawEvents.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left font-medium">Event Type</th>
                            <th className="p-2 text-left font-medium">Participant ID</th>
                            <th className="p-2 text-left font-medium">Timestamp</th>
                            <th className="p-2 text-left font-medium">Event Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rawEvents.map(event => (
                            <tr key={event.id} className="border-t">
                              <td className="p-2">{event.event_type}</td>
                              <td className="p-2 font-mono text-xs">
                                {event.participant_id.substring(0, 8)}...
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {new Date(event.created_at).toLocaleString()}
                              </td>
                              <td className="p-2 max-w-xs overflow-hidden text-ellipsis">
                                {event.event_data ? (
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(event.event_data, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-muted-foreground">No data</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No event data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 