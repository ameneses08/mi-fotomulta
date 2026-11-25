import { AuditLog } from "@/components/AuditLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCaseAudit } from "@/store/selectors";
import type { ChallengeCase } from "@/types";
import { BriefColumn } from "./BriefColumn";
import { ClaimColumn } from "./ClaimColumn";
import { DecisionPanel } from "./DecisionPanel";
import { DocumentsTab } from "./DocumentsTab";

interface ChallengeDetailProps {
  challenge: ChallengeCase;
  /** Narrow layout for the split-screen demo. */
  compact?: boolean;
}

export function ChallengeDetail({ challenge, compact = false }: ChallengeDetailProps) {
  const audit = useCaseAudit(challenge.id);
  return (
    <Tabs defaultValue="case">
      <TabsList>
        <TabsTrigger value="case">Case</TabsTrigger>
        <TabsTrigger value="documents">Documents ({challenge.evidence.length})</TabsTrigger>
        <TabsTrigger value="audit">Audit log ({audit.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="case">
        <div className={compact ? "case-columns compact" : "case-columns"}>
          <ClaimColumn challenge={challenge} />
          <BriefColumn challenge={challenge} />
          {/* Remount when the status changes so the form resets to the next valid decision. */}
          <DecisionPanel key={challenge.status} challenge={challenge} />
        </div>
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab challenge={challenge} />
      </TabsContent>
      <TabsContent value="audit" className="mt-6">
        <AuditLog entries={audit} />
      </TabsContent>
    </Tabs>
  );
}
