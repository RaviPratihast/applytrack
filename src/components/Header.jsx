import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ApplicationForm from "./ApplicationForm";

function Header() {
  function handleAddApplication(data) {
    console.log("New application:", data);
  }

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">ApplyTrack</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Add Application</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Application</DialogTitle>
            </DialogHeader>

            <ApplicationForm onSubmit={handleAddApplication} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

export default Header;
