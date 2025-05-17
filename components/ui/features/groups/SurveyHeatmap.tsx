'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Survey } from '@/components/ui/atoms/SurveyContainer';

export interface QuestionMetric {
  fieldId: string;
  avgTimeSpent: number; // in seconds
  completionRate: number; // 0-1
  dropoffRate: number; // 0-1
  changeRate: number; // 0-1 how often users changed their answer
}

export interface SurveyHeatmapProps {
  survey: Survey;
  metrics?: QuestionMetric[];
}

/**
 * Component that visualizes survey question metrics as a heatmap
 * Shows which questions users struggled with or spent the most time on
 */
export function SurveyHeatmap({ survey, metrics = [] }: SurveyHeatmapProps) {
  // Group fields by milestone
  const milestoneGroups = useMemo(() => {
    const groups: Record<string, Array<typeof survey.fields[0]>> = {};
    
    survey.milestones.forEach(milestone => {
      groups[milestone] = survey.fields.filter(field => field.milestone === milestone);
    });
    
    return groups;
  }, [survey]);
  
  // Get color intensity based on metric value (0-1)
  const getHeatColor = (value: number, metric: 'time' | 'completion' | 'dropoff' | 'change') => {
    // Different color scales for different metrics
    if (metric === 'time') {
      // Red scale for time spent (higher = more intense)
      const intensity = Math.min(1, value / 60); // Normalize to 0-1 (60+ seconds = max)
      return `rgba(220, 53, 69, ${intensity * 0.7})`;
    } else if (metric === 'completion') {
      // Green scale for completion rate (lower = more intense)
      const intensity = 1 - value;
      return `rgba(25, 135, 84, ${intensity * 0.7})`;
    } else if (metric === 'dropoff') {
      // Orange scale for dropoff rate (higher = more intense)
      return `rgba(255, 193, 7, ${value * 0.7})`;
    } else {
      // Blue scale for change rate (higher = more intense)
      return `rgba(13, 110, 253, ${value * 0.7})`;
    }
  };
  
  // Find metrics for a specific field
  const getFieldMetrics = (fieldId: string) => {
    return metrics.find(m => m.fieldId === fieldId) || {
      fieldId,
      avgTimeSpent: 0,
      completionRate: 1,
      dropoffRate: 0,
      changeRate: 0
    };
  };
  
  // Format seconds to readable time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Response Heatmap</CardTitle>
        <CardDescription>
          Visualizes where users struggled or spent more time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-sm bg-red-500 mr-2"></div>
              <span>Time Spent</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-sm bg-green-500 mr-2"></div>
              <span>Low Completion</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-sm bg-yellow-500 mr-2"></div>
              <span>Dropoff</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-sm bg-blue-500 mr-2"></div>
              <span>Answer Changes</span>
            </div>
          </div>
          
          {/* Milestone groups */}
          {survey.milestones.map(milestone => (
            <div key={milestone} className="mt-4">
              <h3 className="text-md font-medium mb-2 capitalize">{milestone.replace('_', ' ')}</h3>
              <div className="space-y-2">
                {milestoneGroups[milestone]?.map(field => {
                  const fieldMetrics = getFieldMetrics(field.id);
                  
                  return (
                    <div key={field.id} className="p-3 border rounded-md">
                      <div className="flex justify-between mb-1">
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-muted-foreground">{field.type}</div>
                      </div>
                      
                      <div className="flex items-center mt-2 text-xs space-x-4">
                        {/* Time spent indicator */}
                        <div 
                          className="flex-1 p-2 rounded" 
                          style={{ 
                            backgroundColor: getHeatColor(fieldMetrics.avgTimeSpent, 'time') 
                          }}
                        >
                          <span>{formatTime(fieldMetrics.avgTimeSpent)}</span>
                        </div>
                        
                        {/* Completion rate indicator */}
                        <div 
                          className="flex-1 p-2 rounded" 
                          style={{ 
                            backgroundColor: getHeatColor(fieldMetrics.completionRate, 'completion') 
                          }}
                        >
                          <span>{Math.round(fieldMetrics.completionRate * 100)}% completed</span>
                        </div>
                        
                        {/* Dropoff rate indicator */}
                        <div 
                          className="flex-1 p-2 rounded" 
                          style={{ 
                            backgroundColor: getHeatColor(fieldMetrics.dropoffRate, 'dropoff') 
                          }}
                        >
                          <span>{Math.round(fieldMetrics.dropoffRate * 100)}% dropoff</span>
                        </div>
                        
                        {/* Change rate indicator */}
                        <div 
                          className="flex-1 p-2 rounded" 
                          style={{ 
                            backgroundColor: getHeatColor(fieldMetrics.changeRate, 'change') 
                          }}
                        >
                          <span>{Math.round(fieldMetrics.changeRate * 100)}% changed</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 