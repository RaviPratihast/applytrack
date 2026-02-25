import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AppNav from "./components/AppNav";
import Dashboard from "./pages/Dashboard";
import SettingsPlaceholder from "./pages/SettingsPlaceholder";

const STORAGE_KEY = "applytrack_applications";
const API_BASE = "http://localhost:3001";

function App() {
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");

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

  // Save applications to localStorage whenever they change (local backup)
  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications, loading]);

  function addApplication(application) {
    setApplications((prev) => [...prev, application]);
  }

  function updateApplication(updatedApplication) {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      )
    );
  }

  function handleDeleteApplication(id) {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }

  const dialogOpen = addDialogOpen || !!editingApplication;
  const handleDialogOpenChange = (open) => {
    setAddDialogOpen(open);
    if (!open) setEditingApplication(null);
  };

  return (
    <div className="app min-h-screen flex flex-col">
      <Header
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onAddApplication={addApplication}
        onUpdateApplication={updateApplication}
        editingApplication={editingApplication}
        onClearEdit={() => setEditingApplication(null)}
      />
      <Hero onAddClick={() => setAddDialogOpen(true)} />
      <AppNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "applications" && (
        <div id="panel-applications" role="tabpanel" aria-labelledby="tab-applications" className="flex flex-1 flex-col min-h-0">
          <Dashboard
            applications={applications}
            loading={loading}
            error={error}
            onRetry={loadApplications}
            onDeleteApplication={handleDeleteApplication}
            onEditApplication={setEditingApplication}
          />
        </div>
      )}
      {activeTab === "settings" && (
        <div id="panel-settings" role="tabpanel" aria-labelledby="tab-settings" className="flex flex-1 flex-col">
          <SettingsPlaceholder />
        </div>
      )}
    </div>
  );
}

export default App;
