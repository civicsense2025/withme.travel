import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export interface MilestoneTriggerEditorProps {
  trigger: any;
  onChange: (t: any) => void;
  onDelete?: () => void;
  milestoneOptions?: { label: string; value: string }[];
}

export const MilestoneTriggerEditor: React.FC<MilestoneTriggerEditorProps> = ({
  trigger,
  onChange,
  onDelete,
  milestoneOptions = [],
}) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Milestone Trigger</span>
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
            ×
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Select
          value={trigger.milestone || ''}
          onValueChange={milestone => onChange({ ...trigger, milestone })}
        >
          <SelectTrigger><SelectValue placeholder="Milestone" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {milestoneOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={trigger.priority || 'medium'}
          onValueChange={priority => onChange({ ...trigger, priority })}
        >
          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Switch
          checked={!!trigger.is_required}
          onCheckedChange={is_required => onChange({ ...trigger, is_required })}
        />
        <span>Required</span>
      </div>
      <div className="grid gap-2 mb-2">
        <Select
          value={trigger.trigger_delay || 'immediately'}
          onValueChange={trigger_delay => onChange({ ...trigger, trigger_delay })}
        >
          <SelectTrigger><SelectValue placeholder="Show Survey" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="immediately">Immediately</SelectItem>
            <SelectItem value="delayed">After Delay</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MilestoneTriggerEditor; 