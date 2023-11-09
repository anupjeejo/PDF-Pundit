import { SignIn } from "@clerk/nextjs";
 
export default function SignInPage() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <h1>Sign in route</h1>
      <SignIn />
    </div>
  );
}