import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Moon, Plus, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApplicationForm from "./ApplicationForm";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/kanban", label: "Kanban" },
  { to: "/analytics", label: "Analytics" },
];

function Header({
  onAddApplication,
  onUpdateApplication,
  editingApplication,
  onClearEdit,
  addDialogOpen,
  onCloseAddDialog,
  theme,
  onToggleTheme,
}) {
  const [openByTrigger, setOpenByTrigger] = useState(false);
  const open = openByTrigger || !!editingApplication || addDialogOpen;

  function handleOpenChange(value) {
    setOpenByTrigger(value);
    if (!value) {
      onClearEdit();
      onCloseAddDialog?.();
    }
  }

  function handleSubmit(data) {
    if (editingApplication) {
      onUpdateApplication({ ...editingApplication, ...data });
      onClearEdit();
    } else {
      onAddApplication(data);
    }
    setOpenByTrigger(false);
  }

  const navLinkClass = ({ isActive }) =>
    `shrink-0 px-3 py-1.5 text-sm rounded-[10px] transition-colors whitespace-nowrap ${
      isActive
        ? "bg-app-accent text-black font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div className="header sticky top-0 z-10 pt-4 sm:pt-5 px-5 pb-0 bg-muted/30 backdrop-blur-sm">
      <header
        className="header__bar mx-auto max-w-[1400px] w-full rounded-card bg-card border border-app-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 sm:px-6 sm:py-0 sm:h-14 sm:min-h-[3.5rem] flex-shrink-0"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-3 sm:contents">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-app-accent shrink-0" aria-hidden />
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate text-foreground">
              ApplyTrack
            </h1>
          </div>

          <div className="sm:hidden flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-[10px] h-9 w-9 border border-app-border bg-background text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="rounded-[10px] px-3 py-2 bg-app-dark text-white text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              aria-label="Add application"
              onClick={() => setOpenByTrigger(true)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav
          className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-1 px-1 sm:flex-1 sm:justify-center sm:pb-0"
          aria-label="Primary"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-[10px] h-9 w-9 border border-app-border bg-background text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="rounded-[10px] px-4 py-2 bg-app-dark text-white text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            onClick={() => setOpenByTrigger(true)}
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </header>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="header__dialog w-[min(92vw,680px)] max-w-[680px] max-h-[90dvh] overflow-hidden flex flex-col gap-0 p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {editingApplication ? "Edit Application" : "Add Application"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {editingApplication
                ? "Update this application."
                : "Track a new job opportunity"}
            </DialogDescription>
          </DialogHeader>
          <ApplicationForm
            key={editingApplication?.id ?? "new"}
            initialData={editingApplication}
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;
