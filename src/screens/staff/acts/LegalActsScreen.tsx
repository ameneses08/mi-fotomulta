import { CheckCircle2, FileText, Undo2 } from "lucide-react";
import { useMemo } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { BULK_ACT_ID } from "@/data/mockData";
import { formatCOP, formatTimestamp } from "@/lib/format";
import { previewAct } from "@/lib/revocation";
import { useAppStore } from "@/store/appStore";
import { useRulesContext } from "@/store/selectors";
import { RegisterActDialog } from "./RegisterActDialog";
import { ScenarioBanner } from "./ScenarioBanner";

export function LegalActsScreen() {
  const ctx = useRulesContext();
  const revert = useAppStore((s) => s.revertLegalAct);
  const canRevert = useAppStore((s) => s.actSnapshot !== null);
  const act = ctx.legalActs.find((a) => a.id === BULK_ACT_ID);
  const preview = useMemo(() => (act ? previewAct(act, ctx) : undefined), [act, ctx]);
  const others = ctx.legalActs.filter((a) => a.id !== BULK_ACT_ID);
  if (!act || !preview) return null;

  return (
    <StaffLayout active="acts">
      <div className="eyebrow">Inspector workspace</div>
      <h1 className="page-title mt-3">Legal acts</h1>
      <p className="page-subtitle">Acts that change many fines at once. Fictional documents.</p>
      <ScenarioBanner act={act} />
      <article className="panel mt-6" aria-labelledby="act-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <FileText size={24} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 id="act-title" className="text-lg font-semibold">
                {act.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {act.number} · {act.issuer}
              </p>
            </div>
          </div>
          <StatusBadge text={act.status} tone={act.status === "In force" ? "success" : "warning"} />
        </div>
        <p className="mt-4">{act.summary}</p>
        <p className="mt-3 text-sm text-muted-foreground">Cameras: {act.cameraIds.join(", ")}</p>
        {act.status === "Draft" ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <p className="text-sm">
              Applies to <strong>{preview.affectedFines.length} fines</strong> · refunds released:{" "}
              <strong>{formatCOP(preview.totalRefund)}</strong>
            </p>
            <RegisterActDialog act={act} preview={preview} />
          </div>
        ) : (
          <div className="mt-5 border-t pt-5">
            <Notice icon={CheckCircle2} variant="success" role="status">
              Signed by {act.registeredBy}
              {act.registeredAt && ` on ${formatTimestamp(act.registeredAt)}`}. Applied to each fine
              individually; each citizen was notified.
            </Notice>
            {canRevert && (
              <Button variant="ghost" className="mt-3" onClick={revert}>
                <Undo2 size={16} aria-hidden="true" />
                Revert (demo only)
              </Button>
            )}
          </div>
        )}
      </article>
      <h2 className="mt-10 text-lg font-semibold">Earlier acts</h2>
      {others.map((other) => (
        <article
          key={other.id}
          className="panel mt-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <p className="font-medium">{other.title}</p>
            <p className="text-sm text-muted-foreground">{other.number}</p>
          </div>
          <StatusBadge text={other.status} tone="success" />
        </article>
      ))}
    </StaffLayout>
  );
}
