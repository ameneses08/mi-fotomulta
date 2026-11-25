import { Building2, Phone } from "lucide-react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";

export function HelpScreen() {
  return (
    <CitizenLayout>
      <h1 className="page-title">Help</h1>
      <p className="page-subtitle">You can always talk to a person instead of using this app.</p>
      <div className="mt-6 grid gap-4 @2xl:grid-cols-2">
        <section className="panel">
          <h2 className="flex items-center gap-2 font-semibold">
            <Phone size={17} aria-hidden="true" />
            Línea 195
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bogotá's citizen line. Ask about fines, challenges and refunds.
          </p>
        </section>
        <section className="panel">
          <h2 className="flex items-center gap-2 font-semibold">
            <Building2 size={17} aria-hidden="true" />
            Centro de Servicios de Movilidad
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Visit in person with your ID. Staff can file a challenge for you.
          </p>
        </section>
      </div>
    </CitizenLayout>
  );
}
