import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { ProgressSteps } from "@/components/ProgressSteps";
import { StatusBadge } from "@/components/StatusBadge";
import { REFUND_STATUS_TONES } from "@/data/statusMessages";
import { useHighlightOnChange } from "@/hooks/useHighlightOnChange";
import { formatCOP } from "@/lib/format";
import { refundMessage, refundSteps } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { useRefund } from "@/store/selectors";
import type { RefundStatus } from "@/types";
import { BankDetailsForm } from "./BankDetailsForm";
import { NotFoundScreen } from "./NotFoundScreen";

const ACCEPTS_DETAILS = new Set<RefundStatus>(["On hold", "Eligible", "Needs correction"]);

export function RefundScreen({ id }: { id: string }) {
  const refund = useRefund(id);
  const highlight = useHighlightOnChange(refund?.status ?? "");
  if (!refund) return <NotFoundScreen label="Refund" />;

  return (
    <CitizenLayout>
      <h1 className="page-title">Your refund</h1>
      <p className="page-subtitle">
        Refund {refund.id} · Fine {refund.fineId}
      </p>
      <div className="money-value">{formatCOP(refund.amount)}</div>
      <div className={cn("tracker", highlight && "tracker-flash")}>
        <ProgressSteps steps={refundSteps(refund)} label="Refund progress" />
        <section className="panel" aria-live="polite">
          <StatusBadge text={refund.status} tone={REFUND_STATUS_TONES[refund.status]} />
          <p className="mt-4 text-lg font-semibold leading-snug">{refundMessage(refund)}</p>
        </section>
      </div>
      {ACCEPTS_DETAILS.has(refund.status) && <BankDetailsForm refund={refund} />}
    </CitizenLayout>
  );
}
