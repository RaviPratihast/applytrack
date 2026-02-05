import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS } from "@/types/application";

function Dashboard({ applications }) {
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
      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="text-muted-foreground">No applications yet.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Applications</h2>
        <p className="text-sm text-muted-foreground">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <Card
            key={application.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">
                    {application.company}
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {application.role}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
          </Card>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
