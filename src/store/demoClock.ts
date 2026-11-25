import { DEMO_TODAY } from "@/data/mockData";

/** The demo always runs on DEMO_TODAY, at the real time of day, so audit times look live. */
export function demoTimestamp(): string {
  const now = new Date();
  const [year = 2026, month = 1, day = 1] = DEMO_TODAY.split("-").map(Number);
  now.setFullYear(year, month - 1, day);
  return now.toISOString();
}

const pending = new Set<ReturnType<typeof setTimeout>>();

/** Schedules a simulated background step (e.g. automatic checks finishing). */
export function schedule(callback: () => void, delayMs: number): void {
  const id = setTimeout(() => {
    pending.delete(id);
    callback();
  }, delayMs);
  pending.add(id);
}

export function cancelScheduled(): void {
  pending.forEach(clearTimeout);
  pending.clear();
}
