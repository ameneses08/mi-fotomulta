import type { ExtractedFieldName } from "@/types";

/** Stable key for one extracted field of one document in one case. */
export function fieldKey(caseId: string, documentName: string, field: ExtractedFieldName): string {
  return `${caseId}|${documentName}|${field}`;
}
