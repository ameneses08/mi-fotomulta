import type { IsoDate, IsoTimestamp, MessageValues } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCOP(amount: number): string {
  return `COP ${new Intl.NumberFormat("en-US").format(amount)}`;
}

/** "2026-11-12" → "12 Nov 2026". Parsed by hand so the result never depends on time zones. */
export function formatDate(iso: IsoDate): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const monthName = MONTHS[(month ?? 1) - 1] ?? "";
  return `${String(day).padStart(2, "0")} ${monthName} ${year}`;
}

/** Full timestamp → "25 Nov 2026, 11:52" in the viewer's local time. */
export function formatTimestamp(iso: IsoTimestamp): string {
  const date = new Date(iso);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return `${formatDate(day)}, ${time}`;
}

/** Replaces each {placeholder} with its value. Unknown placeholders are left visible. */
export function fillTemplate(template: string, values: MessageValues): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

export function lastFour(accountNumber: string): string {
  return accountNumber.slice(-4);
}
