'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, DownloadIcon, FilterIcon, RefreshCwIcon } from 'lucide-react';
import { EventType } from '@/types/research';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface EventsTableProps {
  events: any[];
  isLoading: boolean;
}

const EventsTable: React.FC<EventsTableProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No events found matching your criteria</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Session ID</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="whitespace-nowrap">
              {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-xs">
                {event.event_type}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {event.user_id || 'N/A'}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {event.session_id?.substring(0, 8) || 'N/A'}
            </TableCell>
            <TableCell>
              {event.source || 'N/A'}
              {event.component && ` / ${event.component}`}
            </TableCell>
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">View</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium">Event Data</h3>
                    <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                      {JSON.stringify(event.event_data, null, 2)}
                    </pre>
                  </div>
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface EventsSummaryProps {
  events: any[];
  isLoading: boolean;
}

const EventsSummary: React.FC<EventsSummaryProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Count events by type
  const eventCounts: Record<string, number> = {};
  const userCounts = new Set();
  const sessionCounts = new Set();

  events.forEach(event => {
    // Count by event type
    eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    
    // Count unique users and sessions
    if (event.user_id) userCounts.add(event.user_id);
    if (event.session_id) sessionCounts.add(event.session_id);
  });

  // Sort event types by count (descending)
  const sortedEventTypes = Object.keys(eventCounts).sort(
    (a, b) => eventCounts[b] - eventCounts[a]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionCounts.size}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Events by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEventTypes.map(eventType => (
            <Card key={eventType}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Badge variant="outline" className="font-mono text-xs">
                    {eventType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventCounts[eventType]}</div>
                <p className="text-xs text-muted-foreground">
                  {((eventCounts[eventType] / events.length) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function EventsDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('table');
  const [filters, setFilters] = useState({
    eventType: '',
    userId: '',
    sessionId: '',
    source: '',
    component: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
  });
  
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.eventType) searchParams.append('event_type', filters.eventType);
      if (filters.userId) searchParams.append('user_id', filters.userId);
      if (filters.sessionId) searchParams.append('session_id', filters.sessionId);
      if (filters.source) searchParams.append('source', filters.source);
      if (filters.component) searchParams.append('component', filters.component);
      if (filters.fromDate) searchParams.append('from', filters.fromDate.toISOString());
      if (filters.toDate) searchParams.append('to', filters.toDate.toISOString());
      
      const response = await fetch(`/api/research/events?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleApplyFilters = () => {
    fetchEvents();
  };
  
  const handleClearFilters = () => {
    setFilters({
      eventType: '',
      userId: '',
      sessionId: '',
      source: '',
      component: '',
      fromDate: null,
      toDate: null,
    });
  };
  
  const handleExportCSV = () => {
    // Convert events to CSV format
    const headers = ['timestamp', 'event_type', 'user_id', 'session_id', 'source', 'component', 'event_data'];
    const csvRows = [
      headers.join(','),
      ...events.map(event => {
        const row = [
          event.timestamp,
          event.event_type,
          event.user_id || '',
          event.session_id || '',
          event.source || '',
          event.component || '',
          JSON.stringify(event.event_data || {})
        ];
        return row.join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze user events tracked throughout the application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            className="h-8 gap-1"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow down the events by applying filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Input
                placeholder="Filter by event type"
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session ID</label>
              <Input
                placeholder="Filter by session ID"
                value={filters.sessionId}
                onChange={(e) => handleFilterChange('sessionId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input
                placeholder="Filter by source"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Component</label>
              <Input
                placeholder="Filter by component"
                value={filters.component}
                onChange={(e) => handleFilterChange('component', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.fromDate ? (
                        format(filters.fromDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.fromDate || undefined}
                      onSelect={(date) => handleFilterChange('fromDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.toDate ? (
                        format(filters.toDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.toDate || undefined}
                      onSelect={(date) => handleFilterChange('toDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="summary">Summary & Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Events Table</CardTitle>
              <CardDescription>
                Showing {events.length} events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsTable events={events} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Events Summary</CardTitle>
              <CardDescription>
                Analysis of {events.length} events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsSummary events={events} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 