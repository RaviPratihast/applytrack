import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

const STORAGE_KEY = "applytrack_applications";

function App() {
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse stored applications:", error);
    }
    return [];
  });
  const [editingApplication, setEditingApplication] = useState(null);

  // Save applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

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
        onDeleteApplication={handleDeleteApplication}
        onEditApplication={setEditingApplication}
      />
    </div>
  );
}

export default App;
