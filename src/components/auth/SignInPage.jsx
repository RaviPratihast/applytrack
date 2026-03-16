// TODO: Uncomment once @clerk/clerk-react is installed.
// import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to ApplyTrack</h1>
        <p className="text-sm text-muted-foreground">
          Auth is not yet configured.{" "}
          <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="underline">
            Set up Clerk
          </a>{" "}
          to enable sign-in.
        </p>
        {/* TODO: <SignIn /> */}
      </div>
    </div>
  );
}

export default SignInPage;
