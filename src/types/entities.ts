import type { ChallengeStatus, DecisionOutcome, LegalActStatus, RefundStatus } from "./status";

/** Dates are ISO strings: "2026-11-25" for days, full ISO for timestamps. */
export type IsoDate = string;
export type IsoTimestamp = string;

export type AuthorityId = "SDM" | "SOACHA";

export interface Citizen {
  name: string;
  firstName: string;
  document: string;
  plate: string;
}

export interface Camera {
  id: string;
  location: string;
  /** Authorised by the ANSV on these dates (inclusive). Missing = never authorised. */
  authorisedFrom?: IsoDate;
  authorisedUntil?: IsoDate;
}

export interface Fine {
  id: string;
  reference: string;
  ownerName: string;
  ownerDocument: string;
  /** Plate registered in RUNT for this fine. */
  plate: string;
  /** Plate read from the camera image. Differs from `plate` in a mismatch case. */
  imagePlate: string;
  infractionDate: IsoDate;
  /** When the authority validated the infraction. The notice window (R5) starts here. */
  validationDate: IsoDate;
  notificationDate: IsoDate;
  location: string;
  offence: string;
  amount: number;
  authorityId: AuthorityId;
  cameraId: string;
  paidOn?: IsoDate;
}

export interface LegalAct {
  id: string;
  number: string;
  title: string;
  issuer: string;
  summary: string;
  /** Cameras declared non-compliant by the act. */
  cameraIds: string[];
  status: LegalActStatus;
  registeredBy?: string;
  registeredAt?: IsoTimestamp;
}

export type ChallengeReason =
  | "I wasn't driving"
  | "Camera not authorised"
  | "Wrong plate"
  | "Notification arrived late"
  | "Vehicle sold before the fine"
  | "Other";

export type EvidenceKind =
  | "ID copy"
  | "Driver statement"
  | "Driving licence"
  | "Bill of sale"
  | "Power of attorney"
  | "Calibration certificate"
  | "Photo"
  | "Other";

/** Field names the (simulated) AI extracts from documents. */
export type ExtractedFieldName =
  | "Full name"
  | "Document number"
  | "Declarant"
  | "Driver"
  | "Signature"
  | "Date signed"
  | "Licence number"
  | "Valid until"
  | "Date of sale"
  | "Seller"
  | "Buyer"
  | "Represented person"
  | "Camera"
  | "Expires";

export interface ExtractedField {
  name: ExtractedFieldName;
  value: string;
  page: number;
}

/** Metadata read from an image file (simulated). */
export interface ImageMetadata {
  capturedAt: IsoTimestamp;
  modifiedAt?: IsoTimestamp;
  software?: string;
}

export interface EvidenceItem {
  name: string;
  kind: EvidenceKind;
  /** "AI-extracted" fields shown next to the document. All values are fictional. */
  extracted?: ExtractedField[];
  metadata?: ImageMetadata;
}

/** Values used to fill the {placeholders} of the current status message. */
export type MessageValues = Partial<Record<string, string>>;

export interface ChallengeCase {
  kind: "challenge";
  id: string;
  fineId: string;
  citizenName: string;
  citizenDocument: string;
  reason: ChallengeReason;
  submittedOn: IsoDate;
  status: ChallengeStatus;
  outcome?: DecisionOutcome;
  hadHearing: boolean;
  holder: string;
  facts: string[];
  request: string;
  evidence: EvidenceItem[];
  /** Law firm or agent filing on the citizen's behalf, if any. */
  representative?: string;
  messageValues: MessageValues;
  /** Free-text message from the inspector shown to the citizen with the status. */
  citizenNote?: string;
}

export interface BankAccount {
  bank: string;
  type: "Savings" | "Checking";
  last4: string;
  holderName: string;
  holderDocument: string;
}

export interface Consent {
  purpose: string;
  givenOn: IsoTimestamp;
}

export interface RefundCase {
  kind: "refund";
  id: string;
  fineId: string;
  claimantName: string;
  claimantDocument: string;
  amount: number;
  requestedOn: IsoDate;
  status: RefundStatus;
  bankAccount?: BankAccount;
  consent?: Consent;
  messageValues: MessageValues;
}

export type CaseEntity = ChallengeCase | RefundCase;

export type Actor = "System" | "AI assistant" | (string & {});

export interface AuditEntry {
  id: string;
  timestamp: IsoTimestamp;
  caseId: string;
  actor: Actor;
  action: string;
  from?: string;
  to?: string;
  reason: string;
}
