import { AIPanel } from "@/components/AIPanel";
import { AuditLog } from "@/components/AuditLog";
import { DataRow } from "@/components/DataRow";
import { FindingList } from "@/components/analysis/FindingList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiScripts } from "@/data/aiScripts";
import { isOpenFlag } from "@/lib/analysis";
import { formatCOP, formatDate } from "@/lib/format";
import { refundMessage } from "@/lib/messages";
import { useAnalysis, useCaseAudit, useFine } from "@/store/selectors";
import type { AnalysisFinding, RefundCase } from "@/types";
import { RefundDecisionPanel } from "./RefundDecisionPanel";

function briefFor(findings: AnalysisFinding[]): string {
  const open = findings.filter(isOpenFlag);
  if (open.some((f) => f.ruleId === "R11")) return aiScripts.refundBrief.onHold;
  if (open.some((f) => f.id.endsWith(":holder"))) return aiScripts.refundBrief.mismatch;
  return aiScripts.refundBrief.pass;
}

export function RefundDetail({ refund }: { refund: RefundCase }) {
  const fine = useFine(refund.fineId);
  const findings = useAnalysis(refund.id)?.findings ?? [];
  const audit = useCaseAudit(refund.id);
  const account = refund.bankAccount;

  return (
    <Tabs defaultValue="case">
      <TabsList>
        <TabsTrigger value="case">Refund</TabsTrigger>
        <TabsTrigger value="audit">Audit log ({audit.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="case">
        <div className="case-columns">
          <section className="staff-column" aria-labelledby="claimant-title">
            <h2 id="claimant-title" className="column-title">
              Claim
            </h2>
            <dl>
              <DataRow
                label="Claimant"
                value={`${refund.claimantName} · ${refund.claimantDocument}`}
                source="RUNT"
              />
              <DataRow label="Amount" value={formatCOP(refund.amount)} source="SIMIT" />
              {fine?.paidOn && (
                <DataRow label="Paid on" value={formatDate(fine.paidOn)} source="SIMIT" />
              )}
              <DataRow
                label="Bank account"
                value={
                  account
                    ? `${account.bank} ···${account.last4} · holder ${account.holderName}`
                    : "Not provided"
                }
              />
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              Citizen sees: {refundMessage(refund)}
            </p>
          </section>
          <section className="staff-column" aria-labelledby="refund-brief">
            <h2 id="refund-brief" className="column-title">
              Checks
            </h2>
            <AIPanel title="Refund brief" audience="staff" className="mt-0">
              <p>{briefFor(findings)}</p>
            </AIPanel>
            <h3 className="column-subtitle">AI analysis</h3>
            <FindingList findings={findings} />
          </section>
          <RefundDecisionPanel key={refund.status} refund={refund} />
        </div>
      </TabsContent>
      <TabsContent value="audit" className="mt-6">
        <AuditLog entries={audit} />
      </TabsContent>
    </Tabs>
  );
}
