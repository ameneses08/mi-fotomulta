import { useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { MOCK_SIGN_IN } from "@/data/mockData";
import { validateStaffLogin } from "@/lib/signIn";

export function StaffSignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>(MOCK_SIGN_IN.staffUsername);
  const [password, setPassword] = useState<string>(MOCK_SIGN_IN.staffPassword);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const problem = validateStaffLogin(username, password);
    setError(problem ?? "");
    if (!problem) void navigate({ to: "/staff" });
  };

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      <label className="form-field mt-0">
        SDM username
        <input
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="form-field mt-0">
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="error-text mt-0" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="h-12 w-full">
        <LogIn size={18} aria-hidden="true" />
        Sign in
      </Button>
    </form>
  );
}
