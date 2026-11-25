import { AIPanel } from "@/components/AIPanel";
import { AuditLog } from "@/components/AuditLog";
import { DataRow } from "@/components/DataRow";
import { RuleCheckList } from "@/components/RuleCheckList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiScripts } from "@/data/aiScripts";
import { formatCOP, formatDate } from "@/lib/format";
import { refundMessage } from "@/lib/messages";
import { useCaseAudit, useFine, useRuleChecks } from "@/store/selectors";
import type { RefundCase, RuleCheck } from "@/types";
import { RefundDecisionPanel } from "./RefundDecisionPanel";

function briefFor(checks: RuleCheck[]): string {
  if (checks.some((c) => c.ruleId === "R11" && c.result !== "Pass"))
    return aiScripts.refundBrief.onHold;
  if (checks.some((c) => c.ruleId === "R12" && c.result === "Fail"))
    return aiScripts.refundBrief.mismatch;
  return aiScripts.refundBrief.pass;
}

export function RefundDetail({ refund }: { refund: RefundCase }) {
  const fine = useFine(refund.fineId);
  const checks = useRuleChecks(refund.id);
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
              <p>{briefFor(checks)}</p>
            </AIPanel>
            <h3 className="column-subtitle">Rule checks</h3>
            <RuleCheckList checks={checks} />
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
