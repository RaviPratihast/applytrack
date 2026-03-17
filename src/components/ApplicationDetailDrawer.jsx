import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS } from "@/types/application";
import { ExternalLink, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function getStatusVariant(status) {
  return { [APPLICATION_STATUS.APPLIED]: "applied", [APPLICATION_STATUS.INTERVIEW]: "interview", [APPLICATION_STATUS.REJECTED]: "rejected", [APPLICATION_STATUS.OFFER]: "offer" }[status] || "default";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value}</span>
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
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(() => {});
    fetch(`${API_BASE}/api/applications/${application.id}/tags`)
      .then(r => r.json())
      .then(d => setTags(d.tags ?? []))
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
      .then(r => r.json())
      .then(newEvent => {
        setEvents(prev => [...prev, newEvent]);
        setNoteText("");
      })
      .catch(() => {})
      .finally(() => setAddingNote(false));
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full max-w-lg">
        {application && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-2 pr-6">
                <div>
                  <SheetTitle className="text-2xl">{application.company}</SheetTitle>
                  <SheetDescription className="text-base font-medium text-foreground mt-0.5">
                    {application.role}
                  </SheetDescription>
                </div>
                <Badge variant={getStatusVariant(application.status)} className="mt-1 shrink-0">
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Applied" value={formatDate(application.appliedDate)} />
                <DetailRow label="Follow-up" value={application.followUpDate ? formatDate(application.followUpDate) : null} />
                <DetailRow label="Location" value={application.location} />
                <DetailRow label="Salary Range" value={application.salaryRange} />
                <DetailRow label="Company Size" value={application.companySize} />
                <DetailRow label="Resume Version" value={application.resumeVersion} />
              </div>

              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Job Posting
                </a>
              )}

              {application.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
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

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Timeline
                </p>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map(ev => (
                      <div key={ev.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-sm">{ev.note || ev.eventType}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(ev.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <Textarea
                    className="rounded-[10px] text-sm"
                    placeholder="Add a note to the timeline…"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="rounded-[10px] bg-app-accent text-black hover:opacity-90"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addingNote}
                  >
                    Add Note
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
