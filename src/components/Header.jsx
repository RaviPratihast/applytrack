import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">ApplyTrack</h1>
        <Button size="sm">
          Add Application
        </Button>
      </div>
    </header>
  );
}

export default Header;
