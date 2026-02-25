import { Button } from "@/components/ui/button";

function Hero({ onAddClick }) {
  return (
    <section className="hero border-b border-border bg-muted/30">
      <div className="mx-auto max-w-screen-2xl w-full px-4 pt-8 pb-6 sm:px-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ApplyTrack
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Track your job applications in one place. Add roles, track status, and never lose a lead.
          </p>
          <Button
            size="lg"
            onClick={onAddClick}
            className="rounded-sm bg-[#DDF159] text-black hover:bg-[#DDF159]/90 font-medium"
          >
            Add Application
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
