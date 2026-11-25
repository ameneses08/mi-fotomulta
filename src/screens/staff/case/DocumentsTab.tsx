import { Sparkles } from "lucide-react";
import type { ChallengeCase } from "@/types";
import { DocumentCard } from "./DocumentCard";

export function DocumentsTab({ challenge }: { challenge: ChallengeCase }) {
  if (!challenge.evidence.length) {
    return <p className="mt-6 text-muted-foreground">No documents were attached to this case.</p>;
  }
  return (
    <div className="mt-6 grid gap-4">
      <p className="ai-label">
        <Sparkles size={15} aria-hidden="true" />
        Fields extracted by the AI (simulated). Check each one against the document.
      </p>
      {challenge.evidence.map((document) => (
        <DocumentCard key={document.name} caseId={challenge.id} document={document} />
      ))}
    </div>
  );
}
