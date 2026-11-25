import { CHALLENGE_REASONS } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";

export function ReasonStep() {
  const reason = useAppStore((s) => s.draft.reason);
  const setReason = useAppStore((s) => s.setReason);
  return (
    <fieldset>
      <legend className="text-xl font-semibold">Why are you challenging?</legend>
      <p className="page-subtitle">Choose the reason that best fits your situation.</p>
      <div className="mt-3">
        {CHALLENGE_REASONS.map((option) => (
          <label className="choice" key={option}>
            <input
              type="radio"
              name="reason"
              value={option}
              checked={reason === option}
              onChange={() => setReason(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
