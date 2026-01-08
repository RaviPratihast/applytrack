import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { APPLICATION_STATUS } from "@/types/application";

function ApplicationForm({ onSubmit }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(APPLICATION_STATUS.APPLIED);
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      company,
      role,
      status,
      notes,
    });

    setCompany("");
    setRole("");
    setStatus(APPLICATION_STATUS.APPLIED);
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Company</Label>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Role</Label>
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={APPLICATION_STATUS.APPLIED}>Applied</SelectItem>
            <SelectItem value={APPLICATION_STATUS.INTERVIEW}>Interview</SelectItem>
            <SelectItem value={APPLICATION_STATUS.REJECTED}>Rejected</SelectItem>
            <SelectItem value={APPLICATION_STATUS.OFFER}>Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <Button type="submit">Save Application</Button>
    </form>
  );
}

export default ApplicationForm;
