import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadApplications() {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/applications`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setApplications(data.applications ?? []);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load applications:", err);
        setError("Failed to load applications.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function addApplication(payload) {
    fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add");
        return res.json();
      })
      .then((data) => setApplications((prev) => [...prev, data]))
      .catch((err) => {
        console.error("Failed to add application:", err);
        setError("Failed to add application.");
      });
  }

  function updateApplication(updated) {
    fetch(`${API_BASE}/api/applications/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((data) =>
        setApplications((prev) =>
          prev.map((app) => (app.id === data.id ? data : app))
        )
      )
      .catch((err) => {
        console.error("Failed to update application:", err);
        setError("Failed to update application.");
      });
  }

  function handleDeleteApplication(id) {
    fetch(`${API_BASE}/api/applications/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setApplications((prev) => prev.filter((app) => app.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete application:", err);
        setError("Failed to delete application.");
      });
  }

  return (
    <div className="app min-h-screen flex flex-col">
      <Header
        onAddApplication={addApplication}
        onUpdateApplication={updateApplication}
        editingApplication={editingApplication}
        onClearEdit={() => setEditingApplication(null)}
      />
      <Dashboard
        applications={applications}
        loading={loading}
        error={error}
        onRetry={loadApplications}
        onDeleteApplication={handleDeleteApplication}
        onEditApplication={setEditingApplication}
      />
    </div>
  );
}

export default App;
