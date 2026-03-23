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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-h-0 flex-shrink-0 auto-rows-fr">
      {STATUS_CONFIG.map(({ key, label, color }) => {
        const isOffer = key === APPLICATION_STATUS.OFFER;
        return (
          <div
            key={key}
            className={`min-h-[88px] md:h-[100px] md:min-h-[100px] flex flex-col justify-between rounded-card border py-4 px-4 md:py-5 md:px-6 ${
              isOffer
                ? "bg-app-accent border-app-accent"
                : "bg-card border-app-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className={`text-sm font-medium ${isOffer ? "text-black" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            <span className={`text-2xl font-semibold ${isOffer ? "text-black" : ""}`} style={isOffer ? undefined : { color }}>
              {counts[key] ?? 0}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatusBar;
