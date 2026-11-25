import { FileText, Image as ImageIcon } from "lucide-react";
import { formatDate, formatTimestamp } from "@/lib/format";
import { fieldKey } from "@/lib/analysis/fieldKey";
import { useAppStore } from "@/store/appStore";
import type { EvidenceItem } from "@/types";

/** Extracted dates are stored as ISO; show them the way the rest of the app does. */
const display = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDate(value) : value);

export function DocumentCard({ caseId, document }: { caseId: string; document: EvidenceItem }) {
  const verified = useAppStore((s) => s.verifiedFields);
  const toggle = useAppStore((s) => s.toggleFieldVerified);
  const Icon = document.kind === "Photo" ? ImageIcon : FileText;
  const fields = document.extracted ?? [];

  return (
    <article className="document-card" aria-label={document.kind}>
      <div className="document-paper" aria-hidden="true">
        <p className="flex items-center gap-2 font-semibold">
          <Icon size={16} />
          {document.kind}
        </p>
        <p className="text-xs text-muted-foreground">{document.name}</p>
        <div className="mt-3 grid gap-2 text-sm">
          {fields.length ? (
            fields.map((field) => (
              <p key={field.name}>
                {field.name}: <mark className="extracted">{display(field.value)}</mark>
              </p>
            ))
          ) : (
            <span className="paper-lines" />
          )}
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">AI-extracted fields</h3>
        {fields.length === 0 && !document.metadata && (
          <p className="mt-1 text-sm text-muted-foreground">No fields extracted from this file.</p>
        )}
        <ul className="mt-2 grid gap-2">
          {fields.map((field) => {
            const key = fieldKey(caseId, document.name, field.name);
            return (
              <li key={field.name} className="field-row">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {field.name} · p.{field.page}
                  </p>
                  <p className="text-sm font-medium">{display(field.value)}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={Boolean(verified[key])}
                    onChange={() => toggle(caseId, document.name, field.name)}
                  />
                  Verified by inspector
                </label>
              </li>
            );
          })}
        </ul>
        {document.metadata && (
          <dl className="mt-3 grid gap-1 text-sm">
            <div>
              <dt className="inline text-muted-foreground">Captured: </dt>
              <dd className="inline">{formatTimestamp(document.metadata.capturedAt)}</dd>
            </div>
            {document.metadata.modifiedAt && (
              <div>
                <dt className="inline text-muted-foreground">Modified: </dt>
                <dd className="inline">{formatTimestamp(document.metadata.modifiedAt)}</dd>
              </div>
            )}
            {document.metadata.software && (
              <div>
                <dt className="inline text-muted-foreground">Software: </dt>
                <dd className="inline">{document.metadata.software}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
