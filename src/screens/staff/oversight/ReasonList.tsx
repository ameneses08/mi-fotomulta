import { RuleText } from "@/components/RuleCode";
import type { OversightReason } from "@/lib/oversight";

export function ReasonList({
  title,
  reasons,
  empty,
}: {
  title: string;
  reasons: OversightReason[];
  empty: string;
}) {
  return (
    <section className="panel" aria-label={title}>
      <h2 className="font-semibold">{title}</h2>
      {reasons.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {reasons.map((item, index) => (
            <li key={`${item.caseId}-${index}`} className="text-sm">
              <span className="font-medium">{item.caseId}</span> – <RuleText text={item.reason} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
