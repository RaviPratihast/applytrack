import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ApplicationForm from "./ApplicationForm";

function Header({
  onAddApplication,
  onUpdateApplication,
  editingApplication,
  onClearEdit,
}) {
  const [openByTrigger, setOpenByTrigger] = useState(false);
  const open = openByTrigger || !!editingApplication;

  function handleOpenChange(value) {
    setOpenByTrigger(value);
    if (!value) onClearEdit();
  }

  function handleSubmit(data) {
    if (editingApplication) {
      onUpdateApplication({
        ...editingApplication,
        ...data,
      });
      onClearEdit();
    } else {
      onAddApplication(data);
    }
    setOpenByTrigger(false);
  }

  return (
    <div className="header sticky top-0 z-10 px-4 pt-4">
      <header className="header__bar mx-auto max-w-screen-2xl w-full rounded-lg border border-border bg-muted/50 shadow-md backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">ApplyTrack</h1>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="header__add-button rounded-sm font-medium bg-[#DDF159] text-black hover:bg-[#DDF159]/90">Add Application</Button>
          </DialogTrigger>

          <DialogContent className="header__dialog">
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
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
