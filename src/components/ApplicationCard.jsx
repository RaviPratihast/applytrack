import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/types/application";

function getStatusVariant(status) {
  const statusMap = {
    [APPLICATION_STATUS.APPLIED]: "applied",
    [APPLICATION_STATUS.INTERVIEW]: "interview",
    [APPLICATION_STATUS.REJECTED]: "rejected",
    [APPLICATION_STATUS.OFFER]: "offer",
  };
  return statusMap[status] || "default";
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return formatDate(dateString);
  if (diffDays === 0) return "Applied today";
  if (diffDays === 1) return "Applied yesterday";
  if (diffDays < 7) return `Applied ${diffDays} days ago`;
  if (diffDays < 30) return `Applied ${Math.floor(diffDays / 7)} wk ago`;
  return formatDate(dateString);
}

function ApplicationCard({ application, onEdit, onDelete }) {
  return (
    <Card className="application-card hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="application-card__header pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="application-card__title text-xl mb-0.5 truncate">
              {application.company}
            </CardTitle>
            <CardDescription className="application-card__role text-base font-medium text-foreground truncate">
              {application.role}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(application.status)} className="shrink-0">
            {formatStatus(application.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {getRelativeTime(application.appliedDate)}
        </p>
      </CardHeader>
      <CardContent className="application-card__content pt-0">
        {application.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {application.notes}
          </p>
        )}
      </CardContent>
      <CardFooter className="application-card__footer flex justify-end gap-2 pt-4">
        <Button
          size="sm"
          className="application-card__edit-button rounded-sm bg-[#DDF159] text-black hover:bg-[#DDF159]/90"
          onClick={() => onEdit(application)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="application-card__delete-button rounded-sm"
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to delete this application?"
            );
            if (confirmed) onDelete(application.id);
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ApplicationCard;
