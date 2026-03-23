import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import Analytics from "./pages/Analytics";
import ApplicationDetailDrawer from "./components/ApplicationDetailDrawer";

const DEMO_APPLICATIONS = [
  {
    id: "demo-1",
    company: "Razorpay",
    role: "Frontend Engineer",
    status: "interview",
    appliedDate: "2026-03-08",
    notes: "Recruiter screening complete. Focus on React performance and accessibility examples.",
    followUpDate: "2026-03-24",
    salaryRange: "INR 22L - 30L",
    location: "Bengaluru, India (Hybrid)",
    jobUrl: "https://careers.razorpay.com/",
    companySize: "1000+",
    tags: [
      { id: "tag-frontend", name: "Frontend", color: "#3b82f6" },
      { id: "tag-priority", name: "Priority", color: "#22c55e" },
    ],
    timeline: [
      { id: "ev-1", eventType: "applied", note: "Applied via careers page", createdAt: "2026-03-08T10:30:00.000Z" },
      { id: "ev-2", eventType: "note", note: "Recruiter call scheduled", createdAt: "2026-03-10T06:45:00.000Z" },
    ],
  },
  {
    id: "demo-2",
    company: "CRED",
    role: "Product Engineer I",
    status: "applied",
    appliedDate: "2026-03-12",
    notes: "Tailor project stories around dashboard UX and data flow decisions.",
    followUpDate: "2026-03-26",
    salaryRange: "INR 18L - 25L",
    location: "Bengaluru, India",
    jobUrl: "https://careers.cred.club/",
    companySize: "1000+",
    tags: [{ id: "tag-product", name: "Product", color: "#8b5cf6" }],
    timeline: [{ id: "ev-3", eventType: "applied", note: "Application submitted", createdAt: "2026-03-12T14:10:00.000Z" }],
  },
  {
    id: "demo-3",
    company: "Postman",
    role: "Frontend Engineer",
    status: "offer",
    appliedDate: "2026-02-28",
    notes: "Offer received; evaluating role scope and growth path.",
    followUpDate: null,
    salaryRange: "INR 28L - 36L",
    location: "Remote (India)",
    jobUrl: "https://www.postman.com/company/careers/",
    companySize: "1000+",
    tags: [{ id: "tag-offer", name: "Offer", color: "#22c55e" }],
    timeline: [{ id: "ev-4", eventType: "offer", note: "Offer shared by hiring manager", createdAt: "2026-03-15T11:30:00.000Z" }],
  },
  {
    id: "demo-4",
    company: "Swiggy",
    role: "Software Development Engineer",
    status: "rejected",
    appliedDate: "2026-02-20",
    notes: "Reached final round. Need stronger distributed systems examples for similar roles.",
    followUpDate: null,
    salaryRange: "INR 20L - 27L",
    location: "Bengaluru, India",
    jobUrl: "https://careers.swiggy.com/",
    companySize: "1000+",
    tags: [{ id: "tag-learning", name: "Learning", color: "#ef4444" }],
    timeline: [{ id: "ev-5", eventType: "rejected", note: "Feedback received via recruiter", createdAt: "2026-03-04T09:00:00.000Z" }],
  },
  {
    id: "demo-5",
    company: "Zepto",
    role: "Frontend Engineer II",
    status: "interview",
    appliedDate: "2026-03-10",
    notes: "Take-home submitted. Waiting for panel round.",
    followUpDate: "2026-03-22",
    salaryRange: "INR 24L - 32L",
    location: "Mumbai, India",
    jobUrl: "https://www.zeptonow.com/careers",
    companySize: "1000+",
    tags: [{ id: "tag-fast", name: "Fast-moving", color: "#f59e0b" }],
    timeline: [{ id: "ev-6", eventType: "note", note: "Take-home sent to team", createdAt: "2026-03-13T16:00:00.000Z" }],
  },
  {
    id: "demo-6",
    company: "Atlassian",
    role: "Frontend Software Engineer",
    status: "applied",
    appliedDate: "2026-03-17",
    notes: "Role aligns with collaboration tooling experience.",
    followUpDate: "2026-03-29",
    salaryRange: "INR 30L - 40L",
    location: "Remote",
    jobUrl: "https://www.atlassian.com/company/careers",
    companySize: "1000+",
    tags: [{ id: "tag-remote", name: "Remote", color: "#0ea5e9" }],
    timeline: [{ id: "ev-7", eventType: "applied", note: "Referred by ex-colleague", createdAt: "2026-03-17T07:30:00.000Z" }],
  },
];

function getInitialTheme() {
  const stored = localStorage.getItem("applytrack-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [applications, setApplications] = useState(DEMO_APPLICATIONS);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("applytrack-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function addApplication(payload) {
    const now = new Date().toISOString();
    const newItem = {
      id: crypto.randomUUID?.() ?? `app-${Date.now()}`,
      ...payload,
      timeline: [{ id: `ev-${Date.now()}`, eventType: "applied", note: "Application added", createdAt: now }],
      tags: [],
    };
    setApplications((prev) => [newItem, ...prev]);
  }

  function updateApplication(updated) {
    setApplications((prev) => prev.map((app) => (app.id === updated.id ? { ...app, ...updated } : app)));
  }

  function handleDeleteApplication(id) {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }

  function handleExportCsv() {
    const headers = ["id", "company", "role", "status", "appliedDate", "location", "salaryRange", "companySize", "followUpDate"];
    const rows = applications.map((a) =>
      headers.map((h) => `"${String(a[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app min-h-screen flex flex-col bg-muted/30">
      <Header
        onAddApplication={addApplication}
        onUpdateApplication={updateApplication}
        editingApplication={editingApplication}
        onClearEdit={() => setEditingApplication(null)}
        addDialogOpen={addDialogOpen}
        onCloseAddDialog={() => setAddDialogOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              applications={applications}
              loading={false}
              error={null}
              onRetry={() => {}}
              onEditApplication={setEditingApplication}
              onViewApplication={setViewingApplication}
              onExportCsv={handleExportCsv}
              onAddApplicationOpen={() => setAddDialogOpen(true)}
            />
          }
        />
        <Route
          path="/kanban"
          element={
            <KanbanBoard
              applications={applications}
              onUpdateApplication={updateApplication}
              onDeleteApplication={handleDeleteApplication}
              onEditApplication={setEditingApplication}
              onViewApplication={setViewingApplication}
            />
          }
        />
        <Route
          path="/analytics"
          element={<Analytics applications={applications} />}
        />
      </Routes>
      <ApplicationDetailDrawer
        application={viewingApplication}
        onClose={() => setViewingApplication(null)}
      />
    </div>
  );
}

export default App;
