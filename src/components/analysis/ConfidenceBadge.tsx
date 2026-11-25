import type { Confidence } from "@/types";

/** How sure the (simulated) AI is. Written out, never colour alone. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`confidence confidence-${confidence.toLowerCase()}`}>
      {confidence} confidence
    </span>
  );
}
