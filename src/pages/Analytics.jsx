import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { APPLICATION_STATUS } from "@/types/application";
import { monthKey } from "@/lib/dates";

const STATUS_COLORS = {
  [APPLICATION_STATUS.APPLIED]:   "#3b82f6",
  [APPLICATION_STATUS.INTERVIEW]: "#eab308",
  [APPLICATION_STATUS.OFFER]:     "#22c55e",
  [APPLICATION_STATUS.REJECTED]:  "#ef4444",
};

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  }
  return months;
}

function SummaryCard({ label, value, sub }) {
  return (
    <div className="rounded-card border border-app-border bg-card p-6 text-card-foreground">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Analytics({ applications }) {
  const total = applications.length;
  const byStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const applied   = byStatus[APPLICATION_STATUS.APPLIED]   ?? 0;
  const interview = byStatus[APPLICATION_STATUS.INTERVIEW] ?? 0;
  const offer     = byStatus[APPLICATION_STATUS.OFFER]     ?? 0;
  const rejected  = byStatus[APPLICATION_STATUS.REJECTED]  ?? 0;

  const conversionRate = total > 0 ? ((offer / total) * 100).toFixed(1) : "0.0";
  const interviewRate  = total > 0 ? ((interview / total) * 100).toFixed(1) : "0.0";

  const months = getLast6Months();
  const monthCounts = {};
  months.forEach(m => { monthCounts[m] = 0; });
  applications.forEach(a => {
    const key = monthKey(a.appliedDate);
    if (key && monthCounts[key] !== undefined) monthCounts[key]++;
  });
  const barData = months.map(m => ({ month: m, applications: monthCounts[m] }));

  const pieData = Object.entries(byStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status] ?? "#6b7280",
  }));

  const funnelSteps = [
    { label: "Applications sent",  value: total,             pct: "100%" },
    { label: "Got to interview",    value: interview + offer, pct: total > 0 ? `${(((interview + offer) / total) * 100).toFixed(0)}%` : "—" },
    { label: "Received an offer",   value: offer,             pct: total > 0 ? `${((offer / total) * 100).toFixed(0)}%` : "—" },
  ];

  if (total === 0) {
    return (
      <main className="pt-3 px-5 pb-5 w-full flex-1">
        <div className="mx-auto max-w-[1400px] w-full flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-muted-foreground">Add some applications to see analytics.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-3 px-5 pb-5 w-full flex-1 flex flex-col gap-3">
      <div className="mx-auto max-w-[1400px] w-full flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Analytics</h2>
          <p className="text-sm text-muted-foreground">Overview of your job search performance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Total"     value={total} />
          <SummaryCard label="Applied"   value={applied} />
          <SummaryCard label="Interview" value={interview} />
          <SummaryCard label="Offer"     value={offer} />
          <SummaryCard label="Rejected"  value={rejected} />
          <SummaryCard label="Offer Rate" value={`${conversionRate}%`} sub="offers / total" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-card border border-app-border bg-card p-6">
            <h3 className="text-base font-semibold mb-4">Applications Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#DDF159" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-card border border-app-border bg-card p-6">
            <h3 className="text-base font-semibold mb-4">Status Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-card border border-app-border bg-card p-6">
          <h3 className="text-base font-semibold mb-4">Conversion Funnel</h3>
          <div className="space-y-3 max-w-md">
            {funnelSteps.map((step, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{step.label}</span>
                      <span className="text-sm font-medium">
                        {step.value}{" "}
                        <span className="text-muted-foreground text-xs">({step.pct})</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DDF159] rounded-full transition-all"
                        style={{ width: step.pct }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm max-w-md">
            <div>
              <span className="text-muted-foreground">Interview rate</span>
              <p className="font-semibold">{interviewRate}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Offer rate</span>
              <p className="font-semibold">{conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Analytics;
