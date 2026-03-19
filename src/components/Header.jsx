import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import ApplicationForm from "./ApplicationForm";

const NAV_LINKS = [
  { to: "/",          label: "Dashboard" },
  { to: "/kanban",    label: "Kanban" },
  { to: "/analytics", label: "Analytics" },
];

function Header({ onAddApplication, onUpdateApplication, editingApplication, onClearEdit, addDialogOpen, onCloseAddDialog }) {
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

  return (
    <div className="header sticky top-0 z-10 pt-5 px-5 pb-0">
      <header className="header__bar mx-auto max-w-[1400px] w-full h-14 rounded-card bg-white border border-app-border flex items-center justify-between gap-4 px-6 flex-shrink-0" aria-label="Main navigation">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-app-accent shrink-0" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight shrink-0 text-foreground">ApplyTrack</h1>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-[10px] transition-colors ${
                  isActive
                    ? "bg-app-accent text-black font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="rounded-[10px] px-4 py-2 bg-app-dark text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </DialogTrigger>
          <DialogContent className="header__dialog max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingApplication ? "Edit Application" : "Add Application"}</DialogTitle>
            </DialogHeader>
            <ApplicationForm
              key={editingApplication?.id ?? "new"}
              initialData={editingApplication}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </header>
    </div>
  );
}

export default Header;
