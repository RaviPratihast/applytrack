import { useState } from "react";
import { Link2 } from "lucide-react";
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

const STATUS_CONFIG = {
  [APPLICATION_STATUS.APPLIED]:   { label: "Applied",   dot: "#3b82f6" },
  [APPLICATION_STATUS.INTERVIEW]: { label: "Interview", dot: "#eab308" },
  [APPLICATION_STATUS.REJECTED]:  { label: "Rejected",  dot: "#ef4444" },
  [APPLICATION_STATUS.OFFER]:     { label: "Offer",     dot: "#22c55e" },
};

function FieldLabel({ children }) {
  return (
    <span className="text-sm font-medium text-foreground leading-none">
      {children}
    </span>
  );
}

function FieldRow({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </FieldLabel>
      {children}
    </div>
  );
}

function ApplicationForm({ onSubmit, onCancel, initialData }) {
  const [company, setCompany]           = useState(() => initialData?.company ?? "");
  const [role, setRole]                 = useState(() => initialData?.role ?? "");
  const [status, setStatus]             = useState(() => initialData?.status ?? APPLICATION_STATUS.APPLIED);
  const [appliedDate, setAppliedDate]   = useState(() => initialData?.appliedDate?.slice(0, 10) ?? today());
  const [notes, setNotes]               = useState(() => initialData?.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(() => initialData?.followUpDate?.slice(0, 10) ?? "");
  const [location, setLocation]         = useState(() => initialData?.location ?? "");
  const [salaryRange, setSalaryRange]   = useState(() => initialData?.salaryRange ?? "");
  const [jobUrl, setJobUrl]             = useState(() => initialData?.jobUrl ?? "");
  const [companySize, setCompanySize]   = useState(() => initialData?.companySize ?? "");

  const isFormValid = company.trim() !== "" && role.trim() !== "";

  function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit({
      company, role, status, appliedDate, notes,
      followUpDate: followUpDate || null,
      location, salaryRange, jobUrl, companySize,
    });
    setCompany(""); setRole(""); setStatus(APPLICATION_STATUS.APPLIED);
    setAppliedDate(today()); setNotes("");
    setFollowUpDate(""); setLocation(""); setSalaryRange(""); setJobUrl(""); setCompanySize("");
  }

  const currentStatus = STATUS_CONFIG[status] ?? STATUS_CONFIG[APPLICATION_STATUS.APPLIED];

  return (
    <form onSubmit={handleSubmit} className="application-form flex flex-col gap-0">
      {/* Scrollable fields area */}
      <div className="flex flex-col gap-4 max-h-[62dvh] overflow-y-auto px-1 pb-4">

        {/* Row 1 — Company | Role */}
        <FieldRow>
          <Field label="Company" required>
            <Input
              className="h-11 rounded-[10px]"
              value={company}
              onChange={e => setCompany(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Role" required>
            <Input
              className="h-11 rounded-[10px]"
              placeholder="e.g. Product Designer"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </Field>
        </FieldRow>

        {/* Row 2 — Status | Applied Date */}
        <FieldRow>
          <Field label="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 rounded-[10px]">
                {/* Show dot + label from local state so there's no double-rendering */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentStatus.dot }}
                    aria-hidden
                  />
                  <span className="text-sm truncate">{currentStatus.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.dot }}
                        aria-hidden
                      />
                      {cfg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Applied Date">
            <Input
              className="h-11 rounded-[10px]"
              type="date"
              value={appliedDate}
              onChange={e => setAppliedDate(e.target.value)}
            />
          </Field>
        </FieldRow>

        {/* Row 3 — Location | Salary Range */}
        <FieldRow>
          <Field label="Location">
            <Input
              className="h-11 rounded-[10px]"
              placeholder="Remote / City, Country"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </Field>
          <Field label="Salary Range">
            <Input
              className="h-11 rounded-[10px]"
              placeholder="e.g. ₹8L–₹12L"
              value={salaryRange}
              onChange={e => setSalaryRange(e.target.value)}
            />
          </Field>
        </FieldRow>

        {/* Row 4 — Company Size */}
        <FieldRow>
          <Field label="Company Size">
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="h-11 rounded-[10px]">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </FieldRow>

        {/* Row 5 — Job URL | Follow-up Date */}
        <FieldRow>
          <Field label="Job URL">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none shrink-0" />
              <Input
                className="h-11 rounded-[10px] pl-9"
                placeholder="https://..."
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Follow-up Date">
            <Input
              className="h-11 rounded-[10px]"
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
          </Field>
        </FieldRow>

        {/* Notes — full width */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Notes</FieldLabel>
          <Textarea
            className="rounded-[10px] min-h-[80px] resize-none"
            placeholder="Add any notes about this application…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Modal Footer — sticky, matches Paper exactly */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-app-border sticky bottom-0 bg-background">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="rounded-[10px] h-11 px-5"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isFormValid}
            className="rounded-[10px] h-11 px-6 bg-app-accent text-black font-semibold hover:bg-app-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Application
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ApplicationForm;
