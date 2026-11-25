import { Link } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import { useMemo } from "react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { HERO_REFUND_ID } from "@/data/mockData";
import { REFUND_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP } from "@/lib/format";
import { recoverableAmount } from "@/lib/refund";
import { useAppStore } from "@/store/appStore";
import { useRefund } from "@/store/selectors";
import { FineCard } from "./FineCard";

export function MyFinesScreen() {
  const citizen = useAppStore((s) => s.citizen);
  const allFines = useAppStore((s) => s.fines);
  const refunds = useAppStore((s) => s.refunds);
  const heroRefund = useRefund(HERO_REFUND_ID);
  const fines = useMemo(
    () => allFines.filter((f) => f.ownerDocument === citizen.document),
    [allFines, citizen.document],
  );
  const amount = recoverableAmount(refunds, citizen.document);

  return (
    <CitizenLayout back={{ to: "/", label: "Home" }}>
      <h1 className="page-title">Hello, {citizen.firstName}</h1>
      <p className="page-subtitle">Here is where your photo-fines stand.</p>
      <section className="panel money-panel" aria-labelledby="money-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="money-title" className="flex items-center gap-2 font-semibold text-primary">
            <Wallet size={19} aria-hidden="true" />
            Money to recover
          </h2>
          {heroRefund && (
            <StatusBadge text={heroRefund.status} tone={REFUND_STATUS_TONES[heroRefund.status]} />
          )}
        </div>
        <div className="money-value">{formatCOP(amount)}</div>
        {heroRefund && (
          <p className="text-sm text-muted-foreground">
            Refund {heroRefund.id} · fine {heroRefund.fineId}
          </p>
        )}
        <Button variant="link" asChild className="mt-2 px-0">
          <Link to="/citizen/refunds/$id" params={{ id: HERO_REFUND_ID }}>
            View my refund
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Button>
      </section>
      <div className="section-heading">
        <h2>My fines</h2>
        <span className="text-sm text-muted-foreground">{fines.length} records</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{citizen.plate}</span> · Cédula{" "}
        {citizen.document}
      </p>
      {fines.map((fine) => (
        <FineCard key={fine.id} fine={fine} />
      ))}
    </CitizenLayout>
  );
}
