import { Link } from "@tanstack/react-router";
import { PanelsTopLeft } from "lucide-react";
import { useState } from "react";
import { CitizenSignIn } from "./CitizenSignIn";
import { RoleSwitch, type SignInRole } from "./RoleSwitch";
import { StaffSignIn } from "./StaffSignIn";

export function SignInScreen() {
  const [role, setRole] = useState<SignInRole>("citizen");
  return (
    <main className="signin-main">
      <section className="signin-card" aria-labelledby="signin-title">
        <h1 id="signin-title" className="text-3xl font-bold">
          Mi Fotomulta Clara
        </h1>
        <p className="mt-2 text-muted-foreground">
          Check, challenge and get your money back for photo-fines, in one place
        </p>
        <div className="mt-7">
          <RoleSwitch value={role} onChange={setRole} />
        </div>
        <div className="mt-6">{role === "citizen" ? <CitizenSignIn /> : <StaffSignIn />}</div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mock sign-in · prefilled fictional details · nothing is sent
        </p>
      </section>
      <Link to="/demo" className="presenter-link">
        <PanelsTopLeft size={15} aria-hidden="true" />
        Presenter: open split-screen demo
      </Link>
    </main>
  );
}
