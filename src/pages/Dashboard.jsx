import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import StatusBar from "@/components/StatusBar";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/types/application";

const STATUS_COLORS = {
  [APPLICATION_STATUS.APPLIED]: "#3b82f6",
  [APPLICATION_STATUS.INTERVIEW]: "#eab308",
  [APPLICATION_STATUS.OFFER]: "#22c55e",
  [APPLICATION_STATUS.REJECTED]: "#ef4444",
};

const AVATAR_COLORS = ["#93c5fd", "#fcd34d", "#86efac", "#fca5a5", "#a5b4fc"];
const AVATAR_TEXT_COLORS = ["#1e40af", "#b45309", "#166534", "#b91c1c", "#3730a3"];

function sortApplications(apps, sortBy) {
  return [...apps].sort((a, b) => {
    if (sortBy === "date-asc") return new Date(a.appliedDate) - new Date(b.appliedDate);
    if (sortBy === "company-asc") return a.company.localeCompare(b.company);
    if (sortBy === "company-desc") return b.company.localeCompare(a.company);
    return new Date(b.appliedDate) - new Date(a.appliedDate);
  });
}

function formatShortDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitial(str) {
  return (str || "?").charAt(0).toUpperCase();
}

function getAvatarColors(company) {
  const i = (company || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = Math.abs(i) % AVATAR_COLORS.length;
  return { bg: AVATAR_COLORS[idx], text: AVATAR_TEXT_COLORS[idx] };
}

function isOverdue(dateString) {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

function getFollowUpLabel(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Overdue - ${formatShortDate(dateString)}`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow - " + formatShortDate(dateString);
  return formatShortDate(dateString);
}

function Dashboard({ applications, loading, error, onRetry, onViewApplication, onExportCsv, onAddApplicationOpen }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const filtered = useMemo(() => {
    let result = applications;
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          (a.role && a.role.toLowerCase().includes(q))
      );
    }
    return sortApplications(result, sortBy);
  }, [applications, search, statusFilter, sortBy]);

  const recentApplications = useMemo(() => filtered.slice(0, 5), [filtered]);

  const followUps = useMemo(() => {
    return applications
      .filter((a) => a.followUpDate)
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
      .slice(0, 5);
  }, [applications]);

  const overdueCount = useMemo(
    () => followUps.filter((a) => isOverdue(a.followUpDate)).length,
    [followUps]
  );

  const counts = useMemo(() => {
    const c = {
      [APPLICATION_STATUS.APPLIED]: 0,
      [APPLICATION_STATUS.INTERVIEW]: 0,
      [APPLICATION_STATUS.OFFER]: 0,
      [APPLICATION_STATUS.REJECTED]: 0,
    };
    applications.forEach((a) => {
      if (a.status in c) c[a.status]++;
    });
    return c;
  }, [applications]);

  const total = applications.length;
  const offerRate = total > 0 ? ((counts[APPLICATION_STATUS.OFFER] / total) * 100).toFixed(1) : "0.0";
  const interviewRate = total > 0 ? Math.round((counts[APPLICATION_STATUS.INTERVIEW] / total) * 100) : 0;
  const thisMonth = useMemo(() => {
    const now = new Date();
    return applications.filter((a) => {
      const d = new Date(a.appliedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [applications]);

  if (loading) {
    return (
      <main className="dashboard pt-3 px-5 pb-5 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard pt-3 px-5 pb-5 w-full flex flex-1">
        <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground space-y-3" role="alert" aria-live="polite">
            <p className="text-sm">{error}</p>
            <Button
              type="button"
              size="sm"
              onClick={onRetry}
              className="rounded-[10px] bg-app-accent text-black hover:opacity-90 font-medium"
            >
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard w-full flex flex-1 flex-col pt-3 px-5 pb-5">
      <div className="dashboard__inner mx-auto max-w-[1400px] w-full flex flex-col gap-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left column: ~2/3 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Recent Applications */}
            <div className="rounded-card border border-app-border bg-white overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-app-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
                <span className="text-sm text-muted-foreground">{filtered.length} total</span>
              </div>
              <div className="divide-y divide-app-border">
                {recentApplications.length === 0 ? (
                  <div className="p-6 py-8 text-center text-sm text-muted-foreground">
                    No applications yet. Click &quot;Add Application&quot; to start.
                  </div>
                ) : (
                  recentApplications.map((app) => {
                    const avatarColors = getAvatarColors(app.company);
                    const statusColor = STATUS_COLORS[app.status] ?? "#6b7280";
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => onViewApplication(app)}
                        className="w-full min-h-[48px] px-6 py-3 flex items-center gap-3 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                          style={{ backgroundColor: avatarColors.bg, color: avatarColors.text }}
                          aria-hidden
                        >
                          {getInitial(app.company)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-foreground truncate">{app.company}</p>
                          <p className="text-sm text-muted-foreground truncate">{app.role || "—"}</p>
                        </div>
                        <div className="w-24 flex flex-col items-end gap-0.5 shrink-0">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${statusColor}20`,
                              color: statusColor,
                            }}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(app.appliedDate)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Kanban Board teaser */}
            <div className="rounded-card border border-app-border bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Kanban Board</h2>
                  <p className="text-sm text-muted-foreground">Drag cards between columns to update status</p>
                </div>
                <Link
                  to="/kanban"
                  className="rounded-[10px] px-4 py-2 bg-app-dark text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                  Open Board
                </Link>
              </div>
              <div className="mt-4 flex gap-2 items-end h-8">
                <div className="flex-1 rounded bg-[#3b82f6]/20 h-full max-w-[80px]" title="Applied" />
                <div className="flex-1 rounded bg-[#eab308]/20 h-4/5 max-w-[80px]" title="Interview" />
                <div className="flex-1 rounded bg-[#22c55e]/20 h-3/5 max-w-[80px]" title="Offer" />
                <div className="flex-1 rounded bg-[#ef4444]/20 h-2/5 max-w-[80px]" title="Rejected" />
              </div>
            </div>
          </div>

          {/* Right column: ~1/3 */}
          <div className="flex flex-col gap-6">
            {/* Follow-ups */}
            <div className="rounded-card border border-app-border bg-white overflow-hidden">
              <div className="p-6 pb-4 border-b border-app-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">Follow-ups</h2>
                {overdueCount > 0 && (
                  <span className="text-xs font-medium text-destructive">{overdueCount} overdue</span>
                )}
              </div>
              <div className="divide-y divide-app-border">
                {followUps.length === 0 ? (
                  <div className="px-6 py-6 text-center text-sm text-muted-foreground">No follow-ups scheduled</div>
                ) : (
                  followUps.map((app) => {
                    const overdue = isOverdue(app.followUpDate);
                    const isTomorrow =
                      app.followUpDate &&
                      Math.ceil((new Date(app.followUpDate) - new Date()) / (1000 * 60 * 60 * 24)) === 1;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => onViewApplication(app)}
                        className={`w-full min-h-[48px] px-6 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors ${
                          overdue ? "bg-destructive/5" : isTomorrow ? "bg-[#eab308]/5" : ""
                        }`}
                      >
                        <div
                          className="w-1 h-10 rounded-full shrink-0"
                          style={{
                            backgroundColor: overdue ? "#ef4444" : isTomorrow ? "#eab308" : "#9ca3af",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {app.company} - {app.role}
                          </p>
                          <p className="text-xs text-muted-foreground">{getFollowUpLabel(app.followUpDate)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Offer rate card */}
            <div className="rounded-card bg-app-dark text-white p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70 mb-1">Offer rate</p>
              <p className="text-4xl font-bold text-app-accent">{offerRate}%</p>
              <p className="text-sm text-white/80 mt-1">
                {counts[APPLICATION_STATUS.OFFER]} offers from {total} applications
              </p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/20 text-sm">
                <span>Interview rate {interviewRate}%</span>
                <span>Applied this month {thisMonth}</span>
              </div>
            </div>

            {/* Track new role CTA */}
            <button
              type="button"
              onClick={onAddApplicationOpen}
              className="rounded-card bg-app-accent border border-app-accent p-6 flex items-center justify-between gap-4 text-left hover:opacity-95 transition-opacity"
            >
              <div>
                <p className="font-semibold text-black">Track a new role</p>
                <p className="text-sm text-black/80">Add it before you forget</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-app-dark text-white flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
