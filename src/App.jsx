import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import { createApplication } from "./types/application";

const STORAGE_KEY = "applytrack_applications";

function App() {
  const [applications, setApplications] = useState([]);

  // Load applications from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setApplications(parsed);
      } catch (error) {
        console.error("Failed to parse stored applications:", error);
      }
    }
  }, []);

  // Save applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  function handleAddApplication(data) {
    const newApplication = createApplication(data);
    console.log(newApplication);
    setApplications((prev) => [...prev, newApplication]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onAddApplication={handleAddApplication} />
      <Dashboard applications={applications} />
    </div>
  );
}

export default App;
