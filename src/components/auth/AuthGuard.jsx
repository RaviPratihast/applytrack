// TODO: Uncomment Clerk hooks once @clerk/clerk-react is installed and AuthProvider is wired in.

// import { useAuth } from "@clerk/clerk-react";
// import { Navigate } from "react-router-dom";

function AuthGuard({ children }) {
  // const { isLoaded, isSignedIn } = useAuth();
  // if (!isLoaded) return <div className="flex items-center justify-center h-screen"><p className="text-sm text-muted-foreground">Loading...</p></div>;
  // if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

export default AuthGuard;
