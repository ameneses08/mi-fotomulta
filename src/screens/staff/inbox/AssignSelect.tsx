import { INSPECTORS } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import type { ChallengeCase } from "@/types";

export function AssignSelect({ challenge }: { challenge: ChallengeCase }) {
  const assign = useAppStore((s) => s.assignChallenge);
  const current = INSPECTORS.find((name) => challenge.holder.endsWith(name)) ?? "";
  return (
    <label className="block min-w-[150px] text-xs text-muted-foreground">
      <span className="sr-only">Assign case {challenge.id} to</span>
      <select
        className="py-2 text-sm"
        value={current}
        onChange={(e) => assign(challenge.id, e.target.value)}
      >
        {!current && <option value="">{challenge.holder}</option>}
        {INSPECTORS.map((name, index) => (
          <option key={name} value={name}>
            {index === 0 ? `${name} (me)` : name}
          </option>
        ))}
      </select>
    </label>
  );
}
