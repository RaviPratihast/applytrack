import { APPLICATION_STATUS } from "@/types/application";

const STATUS_CONFIG = [
  { key: APPLICATION_STATUS.APPLIED,   label: "Applied",   color: "#3b82f6" },
  { key: APPLICATION_STATUS.INTERVIEW, label: "Interview", color: "#eab308" },
  { key: APPLICATION_STATUS.OFFER,     label: "Offer",     color: "#22c55e" },
  { key: APPLICATION_STATUS.REJECTED,  label: "Rejected",  color: "#ef4444" },
];

function StatusBar({ applications }) {
  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex gap-3 h-[100px] flex-shrink-0">
      {STATUS_CONFIG.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex-1 min-w-0 flex flex-col justify-between rounded-card bg-white border border-app-border py-5 px-6"
        >
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold" style={{ color }}>{counts[key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export default StatusBar;
