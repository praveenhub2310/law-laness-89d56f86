import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import CaseSelector from '@/components/CaseSelector';
import moment from 'moment';

interface EditFormProps {
  editHearing: any;
  setEditHearing: (hearing: any) => void;
  handleUpdateHearing: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const EditHearingForm: React.FC<EditFormProps> = ({
  editHearing,
  setEditHearing,
  handleUpdateHearing,
  isSubmitting,
  onCancel
}) => {
  return (
    <form onSubmit={handleUpdateHearing} className="space-y-4">
      <div>
        <Label htmlFor="edit_case_id">Associated Case</Label>
        <CaseSelector
          value={editHearing.case_id}
          onValueChange={(value) => setEditHearing((prev: any) => ({ ...prev, case_id: value }))}
          placeholder="Select a case (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_hearing_number">Hearing Number</Label>
          <Input
            id="edit_hearing_number"
            value={editHearing.hearing_number}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, hearing_number: e.target.value }))}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="edit_title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit_title"
            value={editHearing.title}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit_hearing_date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit_hearing_date"
            type="date"
            min={moment().format('YYYY-MM-DD')}
            value={editHearing.hearing_date}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, hearing_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_hearing_time">
            Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit_hearing_time"
            type="time"
            value={editHearing.hearing_time}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, hearing_time: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_duration">
            Duration <span className="text-destructive">*</span>
          </Label>
          <Select value={editHearing.duration} onValueChange={(value) => setEditHearing((prev: any) => ({ ...prev, duration: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="00:30:00">30 minutes</SelectItem>
              <SelectItem value="01:00:00">1 hour</SelectItem>
              <SelectItem value="01:30:00">1.5 hours</SelectItem>
              <SelectItem value="02:00:00">2 hours</SelectItem>
              <SelectItem value="03:00:00">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_court_name">
            Court Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit_court_name"
            value={editHearing.court_name}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, court_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_court_room">Court Room</Label>
          <Input
            id="edit_court_room"
            value={editHearing.court_room}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, court_room: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit_judge_name">Judge Name</Label>
          <Input
            id="edit_judge_name"
            value={editHearing.judge_name}
            onChange={(e) => setEditHearing((prev: any) => ({ ...prev, judge_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit_hearing_type">Hearing Type</Label>
          <Select value={editHearing.hearing_type} onValueChange={(value) => setEditHearing((prev: any) => ({ ...prev, hearing_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Motion Hearing">Motion Hearing</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Settlement Conference">Settlement Conference</SelectItem>
              <SelectItem value="Final Hearing">Final Hearing</SelectItem>
              <SelectItem value="Status Conference">Status Conference</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit_status">Status</Label>
        <Select value={editHearing.status} onValueChange={(value) => setEditHearing((prev: any) => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="edit_description">Description</Label>
        <Textarea
          id="edit_description"
          value={editHearing.description}
          onChange={(e) => setEditHearing((prev: any) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button 
          type="submit" 
          className="flex-1 pointer-events-auto cursor-pointer relative z-10"
          disabled={isSubmitting || !editHearing.title || !editHearing.hearing_date || !editHearing.court_name}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Hearing'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="pointer-events-auto cursor-pointer relative z-10"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditHearingForm;
