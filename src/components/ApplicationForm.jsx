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

const today = () => new Date().toISOString().slice(0, 10);

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

function ApplicationForm({ onSubmit, initialData }) {
  const [company, setCompany] = useState(() => initialData?.company ?? "");
  const [role, setRole] = useState(() => initialData?.role ?? "");
  const [status, setStatus] = useState(() => initialData?.status ?? APPLICATION_STATUS.APPLIED);
  const [appliedDate, setAppliedDate] = useState(() => initialData?.appliedDate?.slice(0, 10) ?? today());
  const [notes, setNotes] = useState(() => initialData?.notes ?? "");
  const [resumeVersion, setResumeVersion] = useState(() => initialData?.resumeVersion ?? "");
  const [followUpDate, setFollowUpDate] = useState(() => initialData?.followUpDate?.slice(0, 10) ?? "");
  const [location, setLocation] = useState(() => initialData?.location ?? "");
  const [salaryRange, setSalaryRange] = useState(() => initialData?.salaryRange ?? "");
  const [jobUrl, setJobUrl] = useState(() => initialData?.jobUrl ?? "");
  const [companySize, setCompanySize] = useState(() => initialData?.companySize ?? "");

  const isFormValid = company.trim() !== "" && role.trim() !== "";

  function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit({ company, role, status, appliedDate, notes, resumeVersion, followUpDate: followUpDate || null, location, salaryRange, jobUrl, companySize });
    setCompany(""); setRole(""); setStatus(APPLICATION_STATUS.APPLIED);
    setAppliedDate(today()); setNotes(""); setResumeVersion("");
    setFollowUpDate(""); setLocation(""); setSalaryRange(""); setJobUrl(""); setCompanySize("");
  }

  return (
    <form onSubmit={handleSubmit} className="application-form space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Company <span className="text-destructive">*</span></Label>
          <Input className="rounded-sm" value={company} onChange={e => setCompany(e.target.value)} autoFocus />
        </div>
        <div className="space-y-1">
          <Label>Role <span className="text-destructive">*</span></Label>
          <Input className="rounded-sm" value={role} onChange={e => setRole(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={APPLICATION_STATUS.APPLIED}>Applied</SelectItem>
              <SelectItem value={APPLICATION_STATUS.INTERVIEW}>Interview</SelectItem>
              <SelectItem value={APPLICATION_STATUS.REJECTED}>Rejected</SelectItem>
              <SelectItem value={APPLICATION_STATUS.OFFER}>Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Applied Date</Label>
          <Input className="rounded-sm" type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Location</Label>
          <Input className="rounded-sm" placeholder="Remote / City, Country" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Salary Range</Label>
          <Input className="rounded-sm" placeholder="e.g. ₹8L–₹12L" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Resume Version</Label>
          <Input className="rounded-sm" placeholder="e.g. v3-product" value={resumeVersion} onChange={e => setResumeVersion(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Company Size</Label>
          <Select value={companySize} onValueChange={setCompanySize}>
            <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Job URL</Label>
        <Input className="rounded-sm" placeholder="https://..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Follow-up Date</Label>
        <Input className="rounded-sm" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea className="rounded-sm" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
      </div>

      <Button
        type="submit"
        disabled={!isFormValid}
        className={`rounded-sm w-full bg-[#DDF159] text-black hover:bg-[#DDF159]/90 ${!isFormValid ? "cursor-not-allowed opacity-50" : ""}`}
      >
        Save Application
      </Button>
    </form>
  );
}

export default ApplicationForm;
