import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ApplicationCard from "@/components/ApplicationCard";
import StatusBar from "@/components/StatusBar";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";

function sortApplications(apps, sortBy) {
  return [...apps].sort((a, b) => {
    if (sortBy === "date-asc")     return new Date(a.appliedDate) - new Date(b.appliedDate);
    if (sortBy === "company-asc")  return a.company.localeCompare(b.company);
    if (sortBy === "company-desc") return b.company.localeCompare(a.company);
    return new Date(b.appliedDate) - new Date(a.appliedDate);
  });
}

function Dashboard({ applications, loading, error, onRetry, onDeleteApplication, onEditApplication, onViewApplication, onExportCsv }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const filtered = useMemo(() => {
    let result = applications;
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(a =>
        a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
      );
    }
    return sortApplications(result, sortBy);
  }, [applications, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <main className="dashboard px-5 py-5 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard px-5 py-5 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground space-y-3" role="alert" aria-live="polite">
            <p className="text-sm">{error}</p>
            <Button type="button" size="sm" onClick={onRetry} className="rounded-[10px] bg-app-accent text-black hover:opacity-90 font-medium">
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard px-5 py-5 w-full flex flex-1 flex-col gap-3">
      <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex flex-col gap-3">
        <div className="dashboard__header">
          <h2 className="text-2xl font-semibold mb-1">Applications</h2>
          <p className="text-sm text-muted-foreground">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>

        <StatusBar applications={applications} />
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onExportCsv={onExportCsv}
        />

        {filtered.length === 0 ? (
          <div className="rounded-card border border-app-border bg-white p-8 flex items-center justify-center min-h-[280px]">
            <div className="text-center text-muted-foreground space-y-2">
              {applications.length === 0 ? (
                <>
                  <p className="text-sm">No applications added yet.</p>
                  <p className="text-xs">Click &quot;Add Application&quot; to start tracking your job applications.</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <Link
                      to="/kanban"
                      className="inline-flex items-center justify-center rounded-[10px] border border-app-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Open Kanban board →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm">No applications match your search or filters.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-app-border bg-white p-6 flex flex-col gap-0">
            <div className="dashboard__grid grid gap-4 md:grid-cols-2">
            {filtered.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onEdit={onEditApplication}
                onDelete={onDeleteApplication}
                onView={onViewApplication}
              />
            ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
