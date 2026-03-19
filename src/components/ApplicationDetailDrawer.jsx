import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS } from "@/types/application";
import { ExternalLink, Clock, MapPin, DollarSign, Briefcase, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function getStatusVariant(status) {
  return (
    {
      [APPLICATION_STATUS.APPLIED]: "applied",
      [APPLICATION_STATUS.INTERVIEW]: "interview",
      [APPLICATION_STATUS.REJECTED]: "rejected",
      [APPLICATION_STATUS.OFFER]: "offer",
    }[status] || "default"
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** A single metadata row: icon + label + value. Returns null when value is absent. */
function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm text-foreground leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}

function TimelineEvent({ event }) {
  return (
    <div className="flex gap-3">
      <div className="relative mt-1.5 shrink-0">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/30 ring-2 ring-background" />
      </div>
      <div className="pb-3 border-b border-border/50 last:border-0 last:pb-0 flex-1">
        <p className="text-sm text-foreground">{event.note || event.eventType}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(event.createdAt)}</p>
      </div>
    </div>
  );
}

function ApplicationDetailDrawer({ application, onClose }) {
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const isOpen = !!application;

  useEffect(() => {
    if (!application) return;
    const tid = setTimeout(() => {
      setEvents([]);
      setTags([]);
    }, 0);
    fetch(`${API_BASE}/api/applications/${application.id}/events`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {});
    fetch(`${API_BASE}/api/applications/${application.id}/tags`)
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []))
      .catch(() => {});
    return () => clearTimeout(tid);
  }, [application]);

  function handleAddNote() {
    if (!noteText.trim() || !application) return;
    setAddingNote(true);
    fetch(`${API_BASE}/api/applications/${application.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "note", note: noteText.trim() }),
    })
      .then((r) => r.json())
      .then((newEvent) => {
        setEvents((prev) => [...prev, newEvent]);
        setNoteText("");
      })
      .catch(() => {})
      .finally(() => setAddingNote(false));
  }

  const appliedDate = formatDate(application?.appliedDate);
  const followUpDate = application?.followUpDate ? formatDate(application.followUpDate) : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        {application && (
          <>
            {/* ── Header ───────────────────────────────────────── */}
            <div className="px-6 pt-6 pb-4 border-b border-border/60">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <SheetTitle className="text-xl font-semibold leading-tight truncate">
                    {application.company}
                  </SheetTitle>
                  <SheetDescription className="text-sm font-medium text-muted-foreground mt-0.5 leading-snug">
                    {application.role}
                  </SheetDescription>
                </div>
                <Badge
                  variant={getStatusVariant(application.status)}
                  className="shrink-0 mt-0.5 capitalize"
                >
                  {application.status}
                </Badge>
              </div>
            </div>

            {/* ── Scrollable body ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <MetaRow icon={Calendar} label="Applied" value={appliedDate} />
                <MetaRow icon={Calendar} label="Follow-up" value={followUpDate} />
                <MetaRow icon={MapPin}   label="Location"  value={application.location} />
                <MetaRow icon={DollarSign} label="Salary" value={application.salaryRange} />
                <MetaRow icon={Briefcase} label="Company size" value={application.companySize} />
                <MetaRow icon={Briefcase} label="Resume version" value={application.resumeVersion} />
              </div>

              {/* Job URL */}
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  View Job Posting
                </a>
              )}

              {/* Notes */}
              {application.notes && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Notes
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {application.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Timeline
                </p>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <div className="space-y-0">
                    {events.map((ev) => (
                      <TimelineEvent key={ev.id} event={ev} />
                    ))}
                  </div>
                )}

                {/* Add note */}
                <div className="mt-4 space-y-2">
                  <Textarea
                    className="rounded-[10px] text-sm resize-none"
                    placeholder="Add a note to the timeline…"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="rounded-[10px] bg-app-accent text-black hover:opacity-90 transition-opacity"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addingNote}
                  >
                    {addingNote ? "Saving…" : "Add Note"}
                  </Button>
                </div>
              </div>

            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ApplicationDetailDrawer;
