import ApplicationCard from "@/components/ApplicationCard";
import { Button } from "@/components/ui/button";

function Dashboard({ applications, loading, error, onRetry, onDeleteApplication, onEditApplication }) {
  if (loading) {
    return (
      <main className="dashboard px-4 py-6 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-screen-2xl w-full px-6 flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="dashboard px-4 py-6 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-screen-2xl w-full px-6 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground space-y-3" role="alert" aria-live="polite">
            <p className="text-sm">{error}</p>
            <Button
              type="button"
              size="sm"
              onClick={onRetry}
              className="rounded-sm bg-[#DDF159] text-black hover:bg-[#DDF159]/90 font-medium"
            >
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }
  if (applications.length === 0) {
    return (
      <main className="dashboard px-4 py-6 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-screen-2xl w-full px-6 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="text-sm">No applications added yet.</p>
            <p className="text-xs">
              Click &quot;Add Application&quot; to start tracking your job applications.
            </p>
          </div>
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
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={onEditApplication}
              onDelete={onDeleteApplication}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
