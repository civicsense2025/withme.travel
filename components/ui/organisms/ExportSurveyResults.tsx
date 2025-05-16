'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Survey } from './SurveyContainer';

interface ExportSurveyResultsProps {
  surveyId: string;
  sessions?: Array<{
    id: string;
    responses: Array<{
      fieldId: string;
      value: any;
    }>;
    completedAt?: string;
  }>;
  survey?: Survey;
}

type ExportFormat = 'csv' | 'json';

/**
 * Component for exporting survey results in different formats
 */
export function ExportSurveyResults({ surveyId, sessions = [], survey }: ExportSurveyResultsProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would call an API or process data
      // For demo purposes, we'll generate a simple export
      
      // Create a data structure for export
      const exportData = sessions.map(session => {
        // Create a response object
        const responseObj: Record<string, any> = {
          session_id: session.id,
          completed_at: session.completedAt || 'incomplete',
        };
        
        // Add each response using field ID as key
        session.responses.forEach(response => {
          // Find the field label if survey is available
          const field = survey?.fields.find(f => f.id === response.fieldId);
          const key = field ? `${response.fieldId}_${field.label}` : response.fieldId;
          responseObj[key] = response.value;
        });
        
        return responseObj;
      });
      
      // Format the data according to selected format
      let content: string;
      let mimeType: string;
      let filename: string;
      
      if (format === 'csv') {
        // Create CSV content
        const headers = Array.from(
          new Set(
            exportData.flatMap(item => Object.keys(item))
          )
        );
        
        const csvRows = [
          headers.join(','), // Header row
          ...exportData.map(item => {
            return headers.map(header => {
              // Escape any commas or quotes in the value
              const value = item[header] || '';
              const valueStr = String(value);
              return valueStr.includes(',') || valueStr.includes('"') 
                ? `"${valueStr.replace(/"/g, '""')}"`
                : valueStr;
            }).join(',');
          })
        ];
        
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        filename = `survey_${surveyId}_results.csv`;
      } else {
        // JSON format
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        filename = `survey_${surveyId}_results.json`;
      }
      
      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting survey results:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="flex space-x-2 items-center">
      <Select
        value={format}
        onValueChange={(value) => setFormat(value as ExportFormat)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">
            <div className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>CSV</span>
            </div>
          </SelectItem>
          <SelectItem value="json">
            <div className="flex items-center">
              <FileJson className="h-4 w-4 mr-2" />
              <span>JSON</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleExport} 
        disabled={isExporting || sessions.length === 0}
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );
} 