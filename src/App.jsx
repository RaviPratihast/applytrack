import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import Analytics from "./pages/Analytics";
import ApplicationDetailDrawer from "./components/ApplicationDetailDrawer";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function App() {
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadApplications() {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/applications`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(data => {
        setApplications(data.applications ?? []);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load applications:", err);
        setError("Failed to load applications.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadApplications(); }, []);

  function addApplication(payload) {
    fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => { if (!res.ok) throw new Error("Failed to add"); return res.json(); })
      .then(data => setApplications(prev => [...prev, data]))
      .catch(err => { console.error("Failed to add application:", err); setError("Failed to add application."); });
  }

  function updateApplication(updated) {
    fetch(`${API_BASE}/api/applications/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then(res => { if (!res.ok) throw new Error("Failed to update"); return res.json(); })
      .then(data => setApplications(prev => prev.map(app => app.id === data.id ? data : app)))
      .catch(err => { console.error("Failed to update application:", err); setError("Failed to update application."); });
  }

  function handleDeleteApplication(id) {
    fetch(`${API_BASE}/api/applications/${id}`, { method: "DELETE" })
      .then(res => { if (!res.ok) throw new Error("Failed to delete"); setApplications(prev => prev.filter(app => app.id !== id)); })
      .catch(err => { console.error("Failed to delete application:", err); setError("Failed to delete application."); });
  }

  function handleExportCsv() {
    fetch(`${API_BASE}/api/applications/export/csv`)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "applications.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(err => console.error("Export failed:", err));
  }

  return (
    <div className="app min-h-screen flex flex-col" data-build="2025-03-kanban">
      <Header
        onAddApplication={addApplication}
        onUpdateApplication={updateApplication}
        editingApplication={editingApplication}
        onClearEdit={() => setEditingApplication(null)}
        addDialogOpen={addDialogOpen}
        onCloseAddDialog={() => setAddDialogOpen(false)}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              applications={applications}
              loading={loading}
              error={error}
              onRetry={loadApplications}
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
