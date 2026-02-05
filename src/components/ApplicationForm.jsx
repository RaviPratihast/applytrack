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

function ApplicationForm({ onSubmit, initialData }) {
  const [company, setCompany] = useState(() => initialData?.company ?? "");
  const [role, setRole] = useState(() => initialData?.role ?? "");
  const [status, setStatus] = useState(
    () => initialData?.status ?? APPLICATION_STATUS.APPLIED
  );
  const [notes, setNotes] = useState(() => initialData?.notes ?? "");

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
    <form onSubmit={handleSubmit} className="application-form space-y-4">
      <div className="application-form__company space-y-1">
        <Label>Company</Label>
        <Input
          className="rounded-sm"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoFocus
        />
      </div>

      <div className="application-form__role space-y-1">
        <Label>Role</Label>
        <Input
          className="rounded-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="application-form__status space-y-1">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="rounded-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={APPLICATION_STATUS.APPLIED}>Applied</SelectItem>
            <SelectItem value={APPLICATION_STATUS.INTERVIEW}>
              Interview
            </SelectItem>
            <SelectItem value={APPLICATION_STATUS.REJECTED}>
              Rejected
            </SelectItem>
            <SelectItem value={APPLICATION_STATUS.OFFER}>Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="application-form__notes space-y-1">
        <Label>Notes</Label>
        <Textarea
          className="rounded-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="application-form__submit rounded-sm bg-[#DDF159] text-black hover:bg-[#DDF159]/90"
      >
        Save Application
      </Button>
    </form>
  );
}

export default ApplicationForm;
