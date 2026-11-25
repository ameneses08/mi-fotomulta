export const DOCUMENT_TYPES = ["CC", "CE", "PPT"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: "CC – Cédula de ciudadanía",
  CE: "CE – Cédula de extranjería",
  PPT: "PPT – Permiso por Protección Temporal",
};

const DOCUMENT_PATTERNS: Record<DocumentType, RegExp> = {
  CC: /^\d{6,10}$/,
  CE: /^\d{6,7}$/,
  PPT: /^[A-Z0-9]{6,12}$/,
};

/** Removes the dots and spaces people type in Colombian document numbers. */
export function normaliseDocument(value: string): string {
  return value.replace(/[.\s-]/g, "").toUpperCase();
}

/** Mock check: returns an error message, or null when the format is valid. */
export function validateDocument(type: DocumentType, value: string): string | null {
  return DOCUMENT_PATTERNS[type].test(normaliseDocument(value))
    ? null
    : `Enter a valid ${type} number.`;
}

export function validateCode(code: string): string | null {
  return /^\d{6}$/.test(code.trim()) ? null : "Enter the 6-digit code.";
}

export function validateStaffLogin(username: string, password: string): string | null {
  if (!username.trim()) return "Enter your username.";
  return password.length >= 8 ? null : "Enter your password.";
}

/** Shows only the last digits of a document, e.g. "•••• 5678". */
export function maskDocument(value: string): string {
  return `•••• ${normaliseDocument(value).slice(-4)}`;
}
