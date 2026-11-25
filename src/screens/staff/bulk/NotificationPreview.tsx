import { Mail } from "lucide-react";
import { LevelBadge } from "@/components/LevelBadge";
import { revocationNotice } from "@/lib/revocation";
import type { Fine, LegalAct } from "@/types";

/** The exact text each citizen receives: one example for an unpaid and one for a paid fine. */
export function NotificationPreview({ fines, act }: { fines: Fine[]; act: LegalAct }) {
  const examples = [fines.find((f) => !f.paidOn), fines.find((f) => f.paidOn)].filter(
    (fine): fine is Fine => Boolean(fine),
  );
  return (
    <section className="mt-8" aria-labelledby="notice-preview">
      <h2 id="notice-preview" className="flex flex-wrap items-center gap-3 text-lg font-semibold">
        Notification preview <LevelBadge level="A" withLabel />
      </h2>
      <p className="text-sm text-muted-foreground">
        Sent to each citizen, filled with their own fine.
      </p>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {examples.map((fine) => (
          <article key={fine.id} className="panel">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={15} aria-hidden="true" />
              To {fine.ownerName} · {fine.paidOn ? "paid fine" : "unpaid fine"}
            </p>
            <p className="mt-2">{revocationNotice(fine, act)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
