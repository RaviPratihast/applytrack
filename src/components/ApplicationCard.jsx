import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ExternalLink } from "lucide-react";
import { APPLICATION_STATUS } from "@/types/application";

function getStatusVariant(status) {
  return { [APPLICATION_STATUS.APPLIED]: "applied", [APPLICATION_STATUS.INTERVIEW]: "interview", [APPLICATION_STATUS.REJECTED]: "rejected", [APPLICATION_STATUS.OFFER]: "offer" }[status] || "default";
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(dateString) {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

function ApplicationCard({ application, onEdit, onDelete, onView }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const followUpOverdue = isOverdue(application.followUpDate);

  return (
    <TooltipProvider>
      <>
        <Card className="application-card hover:shadow-sm transition-shadow">
          <CardHeader className="application-card__header pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-0.5 truncate">{application.company}</CardTitle>
                <CardDescription className="text-base font-medium text-foreground truncate">
                  {application.role}
                </CardDescription>
                {application.location && (
                  <p className="text-xs text-muted-foreground mt-0.5">{application.location}</p>
                )}
              </div>
              <Badge variant={getStatusVariant(application.status)} className="shrink-0 mt-1">
                {formatStatus(application.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="application-card__content space-y-2 pt-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Applied</span>
              <span className="font-medium">{formatDate(application.appliedDate) ?? "—"}</span>
            </div>

            {application.salaryRange && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium">{application.salaryRange}</span>
              </div>
            )}

            {application.resumeVersion && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resume</span>
                <span className="font-medium text-xs">{application.resumeVersion}</span>
              </div>
            )}

            {application.followUpDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Follow-up</span>
                <span className={`font-medium flex items-center gap-1 ${followUpOverdue ? "text-destructive" : ""}`}>
                  {followUpOverdue && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>Follow-up date has passed</TooltipContent>
                    </Tooltip>
                  )}
                  {formatDate(application.followUpDate)}
                </span>
              </div>
            )}

            {application.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground line-clamp-2">{application.notes}</p>
              </div>
            )}

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Job posting
              </a>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 pt-4">
            {onView && (
              <Button variant="ghost" size="sm" className="rounded-[10px]" onClick={() => onView(application)}>
                View
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-[10px]" onClick={() => onEdit(application)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" className="rounded-[10px]" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </CardFooter>
        </Card>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete application?</DialogTitle>
              <DialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{application.role}</span> at{" "}
                <span className="font-medium text-foreground">{application.company}</span>.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" className="rounded-[10px]" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" className="rounded-[10px]" onClick={() => { onDelete(application.id); setConfirmOpen(false); }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}

export default ApplicationCard;
