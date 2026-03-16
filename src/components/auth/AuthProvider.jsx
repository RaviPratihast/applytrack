// TODO: Install @clerk/clerk-react and add VITE_CLERK_PUBLISHABLE_KEY to your .env to enable auth.
// Steps:
//   1. Sign up at https://clerk.com and create an application
//   2. Add to .env: VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
//   3. Run: pnpm add @clerk/clerk-react
//   4. Uncomment the Clerk imports and ClerkProvider wrapper below

// import { ClerkProvider } from "@clerk/clerk-react";

function AuthProvider({ children }) {
  // const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  // if (publishableKey) {
  //   return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
  // }
  return children;
}

export default AuthProvider;
