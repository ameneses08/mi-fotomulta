import { Clock3, Flag, ScrollText, ShieldCheck, ThumbsUp } from "lucide-react";
import { useMemo } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Notice } from "@/components/Notice";
import { analysisScripts } from "@/data/aiScripts";
import { isIntakeComplete } from "@/lib/intake";
import { computeOversight, OVERSIGHT_CONFIG } from "@/lib/oversight";
import { useAppStore } from "@/store/appStore";
import { ReasonList } from "./ReasonList";

export function OversightScreen() {
  const audit = useAppStore((s) => s.audit);
  const challenges = useAppStore((s) => s.challenges);
  const progress = useAppStore((s) => s.intakeProgress);
  const summarised = challenges.filter((c) => isIntakeComplete(c.id, progress)).length;
  const stats = useMemo(() => computeOversight(audit, summarised), [audit, summarised]);
  const rate =
    stats.falsePositiveRate === null ? "–" : `${Math.round(stats.falsePositiveRate * 100)}%`;

  const cards = [
    {
      icon: ThumbsUp,
      label: "AI suggestions accepted vs overridden",
      value: `${stats.accepted} / ${stats.overridden}`,
      note: `${stats.notFollowed} not followed (correction or hearing instead)`,
    },
    {
      icon: Flag,
      label: "Flags confirmed vs dismissed",
      value: `${stats.confirmed} / ${stats.dismissed}`,
      note: `False-positive rate ${rate}`,
    },
    {
      icon: Clock3,
      label: "Reading time saved (estimate)",
      value: `${Math.round(stats.minutesSaved / 6) / 10} h`,
      note: `${summarised} summaries × ${OVERSIGHT_CONFIG.minutesPerSummary} min`,
    },
    {
      icon: ScrollText,
      label: "AI actions logged",
      value: String(stats.aiActions),
      note: "Read-only in the audit log",
    },
  ];

  return (
    <StaffLayout active="oversight">
      <h1 className="page-title">AI oversight</h1>
      <p className="page-subtitle">
        How inspectors used the AI this month, computed from the audit log.
      </p>
      <Notice icon={ShieldCheck}>{analysisScripts.oversightNote}</Notice>
      <ul className="summary-grid" aria-label="AI oversight figures">
        {cards.map(({ icon: Icon, label, value, note }) => (
          <li key={label} className="panel">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon size={16} aria-hidden="true" />
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{note}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ReasonList
          title="Why inspectors overrode the AI"
          reasons={stats.overrideReasons}
          empty="No overrides yet."
        />
        <ReasonList
          title="Flags dismissed as false positives"
          reasons={stats.dismissReasons}
          empty="No flags dismissed yet."
        />
      </div>
    </StaffLayout>
  );
}
