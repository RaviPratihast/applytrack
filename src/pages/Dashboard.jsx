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

function Dashboard({ applications, onDeleteApplication, onEditApplication }) {
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

  if (applications.length === 0) {
    return (
      <main className="dashboard px-4 py-6 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-screen-2xl w-full px-6 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground text-center">No applications yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard px-4 py-6 w-full">
      <div className="dashboard__inner mx-auto max-w-screen-2xl w-full px-6">
      <div className="dashboard__header mb-6">
        <h2 className="text-2xl font-semibold mb-2">Applications</h2>
        <p className="text-sm text-muted-foreground">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <div className="dashboard__grid grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <Card
            key={application.id}
            className="application-card hover:shadow-md transition-shadow"
          >
            <CardHeader className="application-card__header">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="application-card__title text-xl mb-1">
                    {application.company}
                  </CardTitle>
                  <CardDescription className="application-card__role text-base font-medium text-foreground">
                    {application.role}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="application-card__content">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusVariant(application.status)}>
                    {formatStatus(application.status)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-sm font-medium">
                    {formatDate(application.appliedDate)}
                  </span>
                </div>

                {application.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {application.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="application-card__footer flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="application-card__edit-button rounded-sm"
                onClick={() => onEditApplication(application)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="application-card__delete-button rounded-sm"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete this application?"
                  );
                  if (confirmed) {
                    onDeleteApplication(application.id);
                  }
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      </div>
    </main>
  );
}

export default Dashboard;
