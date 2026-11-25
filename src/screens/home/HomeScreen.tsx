import { Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, PanelsTopLeft, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeScreen() {
  return (
    <>
      <main className="home-main">
        <div className="eyebrow">Bogotá photo-fines</div>
        <h1 className="home-title">
          Mi Fotomulta <span>Clara</span>
        </h1>
        <p className="home-subtitle">
          Check, challenge and get your money back for photo-fines, in one place
        </p>
        <div className="role-grid">
          <section className="role-card citizen-role" aria-labelledby="role-citizen">
            <div className="role-icon">
              <UserRound size={25} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h2 id="role-citizen">For citizens</h2>
            <p>See your fines, challenge one in a few steps and follow your case.</p>
            <Button asChild className="role-button">
              <Link to="/citizen">
                I'm a citizen
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </section>
          <section className="role-card staff-role" aria-labelledby="role-staff">
            <div className="role-icon">
              <BriefcaseBusiness size={25} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h2 id="role-staff">For SDM staff</h2>
            <p>Review cases with AI support, decide, and apply legal acts at scale.</p>
            <Button variant="outline" asChild className="role-button">
              <Link to="/staff">
                I'm SDM staff
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </div>
        <div className="home-demo">
          <Button variant="link" asChild>
            <Link to="/demo">
              <PanelsTopLeft size={17} aria-hidden="true" />
              Open split-screen demo
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="home-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            All people, fines and cases are fictional. No real payments, submissions or personal
            data are collected. AI responses are simulated.
          </p>
        </div>
      </main>
    </>
  );
}
