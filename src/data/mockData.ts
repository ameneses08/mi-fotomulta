import type {
  AuditEntry,
  AuthorityId,
  ChallengeReason,
  Camera,
  ChallengeCase,
  Citizen,
  Fine,
  LegalAct,
  RefundCase,
} from "@/types";
import { fillTemplate } from "@/lib/format";
import { aiScripts } from "./aiScripts";

/** All people, plates, fines and acts below are fictional. */

/** Fixed "today" so legal clocks and dates look the same in every recording. */
export const DEMO_TODAY = "2026-11-25";

export const INSPECTOR_NAME = "Laura Gómez";
export const INSPECTOR_LABEL = `Inspector ${INSPECTOR_NAME}`;

export const HERO_CASE_ID = "C-1042";
export const HERO_FINE_ID = "F-2041";
export const HERO_REFUND_ID = "R-1044";
export const BULK_ACT_ID = "ACT-2026-114";

export const AUTHORITY_NAMES: Record<AuthorityId, string> = {
  SDM: "Secretaría Distrital de Movilidad de Bogotá",
  SOACHA: "Secretaría de Movilidad de Soacha",
};

export const CHALLENGE_REASONS: ChallengeReason[] = [
  "I wasn't driving",
  "Camera not authorised",
  "Wrong plate",
  "Notification arrived late",
  "Vehicle sold before the fine",
  "Other",
];

export const FACT_QUESTIONS = [
  "What happened?",
  "Who was driving, and how do you know?",
  "What would you like the inspector to consider?",
];

export const citizen: Citizen = {
  name: "Marta Rodríguez Peña",
  firstName: "Marta",
  document: "1.020.345.678",
  plate: "JKM482",
};

export const cameras: Camera[] = [
  { id: "CAM-BOY80", location: "Av. Boyacá con Calle 80", authorisedFrom: "2024-03-01" },
  { id: "CAM-NQS13", location: "Av. NQS con Calle 13" },
  { id: "CAM-CALI26", location: "Av. Ciudad de Cali con Calle 26", authorisedFrom: "2023-08-15" },
  { id: "CAM-AN170", location: "Autopista Norte con Calle 170" },
  { id: "CAM-CAR63", location: "Av. Caracas con Calle 63", authorisedFrom: "2024-01-10" },
  { id: "CAM-SOA01", location: "Autopista Sur, sector San Mateo", authorisedFrom: "2024-05-01" },
  { id: "CAM-68-13", location: "Av. Carrera 68 con Calle 13", authorisedFrom: "2023-02-01" },
  { id: "CAM-SUB100", location: "Av. Suba con Calle 100" },
];

const SDM = "SDM" as const;

interface FineSeed {
  id: string;
  owner: [name: string, document: string, plate: string];
  cameraId: string;
  dates: [infraction: string, notification: string];
  amount?: number;
  offence?: string;
  paidOn?: string;
  imagePlate?: string;
  authorityId?: Fine["authorityId"];
}

function fine(seed: FineSeed): Fine {
  const [ownerName, ownerDocument, plate] = seed.owner;
  const camera = cameras.find((c) => c.id === seed.cameraId);
  return {
    id: seed.id,
    reference: `11001000000${seed.id.slice(2).padStart(5, "0")}`,
    ownerName,
    ownerDocument,
    plate,
    imagePlate: seed.imagePlate ?? plate,
    infractionDate: seed.dates[0],
    notificationDate: seed.dates[1],
    location: camera?.location ?? "",
    offence: seed.offence ?? "Exceeding the posted speed limit",
    amount: seed.amount ?? 650000,
    authorityId: seed.authorityId ?? SDM,
    cameraId: seed.cameraId,
    ...(seed.paidOn ? { paidOn: seed.paidOn } : {}),
  };
}

const marta: FineSeed["owner"] = [citizen.name, citizen.document, citizen.plate];
const RED_LIGHT = "Driving through a red light";

export const citizenFineIds = ["F-2041", "F-2042", "F-2043", "F-2044", "F-2045", "F-2046"];

export const fines: Fine[] = [
  fine({ id: "F-2041", owner: marta, cameraId: "CAM-BOY80", dates: ["2026-11-12", "2026-11-13"] }),
  fine({ id: "F-2042", owner: marta, cameraId: "CAM-NQS13", dates: ["2026-11-05", "2026-11-06"] }),
  fine({
    id: "F-2043",
    owner: marta,
    cameraId: "CAM-CALI26",
    dates: ["2026-11-02", "2026-11-03"],
    amount: 390000,
    offence: RED_LIGHT,
  }),
  fine({
    id: "F-2044",
    owner: marta,
    cameraId: "CAM-AN170",
    dates: ["2026-10-21", "2026-10-22"],
    paidOn: "2026-10-28",
  }),
  fine({
    id: "F-2045",
    owner: marta,
    cameraId: "CAM-CAR63",
    dates: ["2026-10-14", "2026-10-15"],
    amount: 390000,
    offence: RED_LIGHT,
    paidOn: "2026-10-20",
  }),
  fine({
    id: "F-2046",
    owner: marta,
    cameraId: "CAM-SOA01",
    dates: ["2026-10-06", "2026-10-07"],
    authorityId: "SOACHA",
  }),
  // Fines behind the staff queue (other fictional citizens).
  fine({
    id: "F-3101",
    owner: ["Jorge Castro Díaz", "79.456.120", "HTR305"],
    cameraId: "CAM-NQS13",
    dates: ["2026-11-03", "2026-11-04"],
  }),
  fine({
    id: "F-3102",
    owner: ["Luisa Fernanda Ortiz", "52.871.334", "BKD771"],
    cameraId: "CAM-NQS13",
    dates: ["2026-11-04", "2026-11-05"],
  }),
  fine({
    id: "F-3103",
    owner: ["Camilo Reyes Pardo", "1.014.220.981", "ZPL118"],
    cameraId: "CAM-AN170",
    dates: ["2026-11-04", "2026-11-05"],
  }),
  fine({
    id: "F-3104",
    owner: ["Diana Patricia Moreno", "39.770.215", "QWE642"],
    cameraId: "CAM-AN170",
    dates: ["2026-11-05", "2026-11-06"],
  }),
  fine({
    id: "F-3105",
    owner: ["Andrés Felipe Gil", "1.032.118.540", "MNB903"],
    cameraId: "CAM-NQS13",
    dates: ["2026-11-06", "2026-11-09"],
  }),
  fine({
    id: "F-3106",
    owner: ["Sandra Milena Rojas", "51.902.443", "TRK550"],
    cameraId: "CAM-68-13",
    dates: ["2026-10-09", "2026-10-20"],
  }),
  fine({
    id: "F-3107",
    owner: ["Ricardo Vargas León", "80.115.629", "LPS284"],
    cameraId: "CAM-CAR63",
    dates: ["2026-10-22", "2026-10-23"],
    offence: RED_LIGHT,
    amount: 390000,
  }),
  fine({
    id: "F-3108",
    owner: ["Paula Andrea Mejía", "1.019.884.302", "RTX219"],
    cameraId: "CAM-68-13",
    dates: ["2026-11-14", "2026-11-17"],
    imagePlate: "RTX279",
  }),
  fine({
    id: "F-3110",
    owner: ["Héctor Fabián Suárez", "19.443.870", "GHV417"],
    cameraId: "CAM-BOY80",
    dates: ["2026-11-10", "2026-11-11"],
  }),
  fine({
    id: "F-3111",
    owner: ["Natalia Cortés Ruiz", "1.020.776.415", "DFR662"],
    cameraId: "CAM-CALI26",
    dates: ["2026-11-09", "2026-11-10"],
  }),
  fine({
    id: "F-3201",
    owner: ["Óscar Iván Peña", "80.224.917", "KJU208"],
    cameraId: "CAM-AN170",
    dates: ["2026-10-16", "2026-10-19"],
    paidOn: "2026-10-24",
  }),
  fine({
    id: "F-3202",
    owner: ["Valentina Herrera", "1.026.330.118", "PLM774"],
    cameraId: "CAM-SUB100",
    dates: ["2026-06-12", "2026-06-15"],
    paidOn: "2026-06-20",
  }),
  fine({
    id: "F-3203",
    owner: ["Mauricio Lozano", "79.881.402", "XCV391"],
    cameraId: "CAM-SUB100",
    dates: ["2026-06-18", "2026-06-19"],
    paidOn: "2026-06-25",
  }),
  fine({
    id: "F-3204",
    owner: ["Claudia Ospina", "43.512.660", "EWS815"],
    cameraId: "CAM-SUB100",
    dates: ["2026-07-02", "2026-07-03"],
    paidOn: "2026-07-08",
  }),
  fine({
    id: "F-3205",
    owner: ["Fernando Ruiz Gómez", "17.338.204", "AQZ119"],
    cameraId: "CAM-SUB100",
    dates: ["2026-06-05", "2026-06-08"],
    paidOn: "2026-06-11",
  }),
];

export const legalActs: LegalAct[] = [
  {
    id: BULK_ACT_ID,
    number: "Resolution 20264010114 of 2026",
    title: "Resolution on revocation of fines from non-compliant cameras",
    issuer: "Ministerio de Transporte (fictional)",
    summary:
      "Declares that cameras CAM-NQS13 and CAM-AN170 did not hold a valid ANSV authorisation when they recorded infractions, and orders the revocation of every fine they produced. Paid amounts must be refunded.",
    cameraIds: ["CAM-NQS13", "CAM-AN170"],
    status: "Draft",
  },
  {
    id: "ACT-2026-071",
    number: "Resolution 20264010071 of 2026",
    title: "Revocation of fines from camera CAM-SUB100",
    issuer: "Ministerio de Transporte (fictional)",
    summary: "Revokes fines recorded by CAM-SUB100 between June and July 2026.",
    cameraIds: ["CAM-SUB100"],
    status: "In force",
    registeredBy: "Álvaro Medina",
    registeredAt: "2026-08-04T09:00:00.000Z",
  },
];

interface ChallengeSeed {
  id: string;
  fineId: string;
  reason: ChallengeCase["reason"];
  submittedOn: string;
  facts: string[];
  evidence?: ChallengeCase["evidence"];
  representative?: string;
  status?: ChallengeCase["status"];
  messageValues?: ChallengeCase["messageValues"];
}

function challenge(seed: ChallengeSeed): ChallengeCase {
  const owner = fines.find((f) => f.id === seed.fineId);
  return {
    kind: "challenge",
    id: seed.id,
    fineId: seed.fineId,
    citizenName: owner?.ownerName ?? "",
    citizenDocument: owner?.ownerDocument ?? "",
    reason: seed.reason,
    submittedOn: seed.submittedOn,
    status: seed.status ?? "Validating",
    hadHearing: seed.status === "Hearing scheduled",
    holder: INSPECTOR_LABEL,
    facts: seed.facts,
    request: seed.facts.join("\n\n"),
    evidence: seed.evidence ?? [],
    messageValues: seed.messageValues ?? {},
    ...(seed.representative ? { representative: seed.representative } : {}),
  };
}

const LEGAL_RAPIDO = "LegalRápido S.A.S.";
const templatedFacts = [
  "The camera that recorded the alleged infraction did not have a valid authorisation from the ANSV on the date of the event.",
  "Under the applicable rules, fines from unauthorised devices lack legal effect and must be revoked.",
  "We request the revocation of the fine and the closure of the proceedings.",
];
const powerOfAttorney: ChallengeCase["evidence"] = [
  { name: "power-of-attorney.pdf", kind: "Other" },
];

function legalRapido(id: string, fineId: string, submittedOn: string): ChallengeCase {
  return challenge({
    id,
    fineId,
    reason: "Camera not authorised",
    submittedOn,
    facts: templatedFacts,
    evidence: powerOfAttorney,
    representative: LEGAL_RAPIDO,
  });
}

export const heroChallenge: ChallengeCase = {
  ...challenge({
    id: HERO_CASE_ID,
    fineId: HERO_FINE_ID,
    reason: "I wasn't driving",
    submittedOn: "2026-11-20",
    facts: aiScripts.structuredFacts,
    evidence: [
      { name: "cedula-marta-rodriguez.pdf", kind: "ID copy" },
      { name: "signed-statement-driver.pdf", kind: "Driver statement" },
    ],
  }),
  request: fillTemplate(aiScripts.requestTemplate, {
    citizen_name: citizen.name,
    fine_id: HERO_FINE_ID,
    plate: citizen.plate,
    date: "12 Nov 2026",
    location: "Av. Boyacá con Calle 80",
    reason: "I wasn't driving",
    facts: aiScripts.structuredFacts.join("\n\n"),
  }),
};

export const challenges: ChallengeCase[] = [
  heroChallenge,
  legalRapido("C-1043", "F-3101", "2026-11-13"),
  legalRapido("C-1044", "F-3102", "2026-11-16"),
  legalRapido("C-1045", "F-3103", "2026-11-17"),
  legalRapido("C-1046", "F-3104", "2026-11-18"),
  legalRapido("C-1047", "F-3105", "2026-11-19"),
  challenge({
    id: "C-1048",
    fineId: "F-3106",
    reason: "Notification arrived late",
    submittedOn: "2026-11-12",
    facts: [
      "The notice arrived at my home on 6 November, almost a month after the event.",
      "I could not challenge it in time because I did not know about it.",
    ],
    evidence: [{ name: "envelope-postmark.jpg", kind: "Photo" }],
  }),
  challenge({
    id: "C-1049",
    fineId: "F-3107",
    reason: "Other",
    submittedOn: "2026-11-10",
    facts: ["The traffic light at that junction was not working that afternoon."],
  }),
  challenge({
    id: "C-1050",
    fineId: "F-3108",
    reason: "Wrong plate",
    submittedOn: "2026-11-23",
    facts: [
      "My plate is RTX219. The photo shows a different vehicle with plate RTX279.",
      "My car was parked at my workplace in Chía at that time.",
    ],
    evidence: [{ name: "parking-receipt.pdf", kind: "Other" }],
  }),
  challenge({
    id: "C-1051",
    fineId: "F-3110",
    reason: "I wasn't driving",
    submittedOn: "2026-11-19",
    facts: ["My son was driving the car that day. He has a valid licence."],
    evidence: [{ name: "id-copy.pdf", kind: "ID copy" }],
  }),
  challenge({
    id: "C-1052",
    fineId: "F-3110",
    reason: "I wasn't driving",
    submittedOn: "2026-11-24",
    facts: ["I already sent this. My son was driving, not me."],
  }),
  challenge({
    id: "C-1053",
    fineId: "F-3111",
    reason: "Vehicle sold before the fine",
    submittedOn: "2026-11-20",
    facts: ["I sold the car on 2 October 2026. The buyer has not completed the transfer in RUNT."],
    evidence: [{ name: "sale-contract.pdf", kind: "Sale contract" }],
    status: "Hearing scheduled",
    messageValues: {
      date: "02 Dec 2026",
      dateIso: "2026-12-02",
      time: "09:30",
      virtual_link_or_address: "virtual hearing (link sent by email)",
    },
  }),
];

interface RefundSeed {
  id: string;
  fineId: string;
  requestedOn: string;
  status: RefundCase["status"];
  bankHolder?: [name: string, document: string];
  messageValues?: RefundCase["messageValues"];
}

function refund(seed: RefundSeed): RefundCase {
  const paidFine = fines.find((f) => f.id === seed.fineId);
  const claimantName = paidFine?.ownerName ?? "";
  const claimantDocument = paidFine?.ownerDocument ?? "";
  const [holderName, holderDocument] = seed.bankHolder ?? [claimantName, claimantDocument];
  return {
    kind: "refund",
    id: seed.id,
    fineId: seed.fineId,
    claimantName,
    claimantDocument,
    amount: paidFine?.amount ?? 0,
    requestedOn: seed.requestedOn,
    status: seed.status,
    messageValues: seed.messageValues ?? {},
    ...(seed.status === "On hold"
      ? {}
      : {
          bankAccount: {
            bank: "Bancolombia",
            type: "Savings",
            last4: "4821",
            holderName,
            holderDocument,
          },
          consent: {
            purpose: "Pay this refund only",
            givenOn: `${seed.requestedOn}T10:00:00.000Z`,
          },
        }),
  };
}

export const refunds: RefundCase[] = [
  refund({ id: HERO_REFUND_ID, fineId: "F-2044", requestedOn: "2026-11-10", status: "On hold" }),
  refund({ id: "R-1045", fineId: "F-3201", requestedOn: "2026-11-04", status: "On hold" }),
  refund({
    id: "R-1046",
    fineId: "F-3202",
    requestedOn: "2026-11-19",
    status: "Verifying payment details",
  }),
  refund({
    id: "R-1047",
    fineId: "F-3203",
    requestedOn: "2026-11-18",
    status: "Verifying payment details",
    bankHolder: ["Inversiones Lozano Ltda.", "900.441.276-3"],
  }),
  refund({
    id: "R-1048",
    fineId: "F-3204",
    requestedOn: "2026-11-12",
    status: "Approved",
    messageValues: { amount: "COP 650,000", date: "02 Dec 2026" },
  }),
  refund({
    id: "R-1049",
    fineId: "F-3205",
    requestedOn: "2026-10-27",
    status: "Paid",
    messageValues: { amount: "COP 650,000", date: "10 Nov 2026", last4: "4821" },
  }),
];

function seedEntry(
  caseId: string,
  timestamp: string,
  actor: string,
  action: string,
  reason: string,
  to?: string,
): AuditEntry {
  return {
    id: `${caseId}|${timestamp}|${action}`,
    caseId,
    timestamp,
    actor,
    action,
    reason,
    ...(to ? { to } : {}),
  };
}

export const initialAudit: AuditEntry[] = [
  ...challenges.map((c) =>
    seedEntry(
      c.id,
      `${c.submittedOn}T08:30:00.000Z`,
      c.citizenName,
      "Challenge submitted",
      "Filed online",
      "Received",
    ),
  ),
  seedEntry(
    HERO_CASE_ID,
    "2026-11-20T08:30:05.000Z",
    "System",
    "Status changed",
    "Automatic checks R1, R3, R4, R5 completed",
    "Validating",
  ),
  seedEntry(
    HERO_CASE_ID,
    "2026-11-20T08:31:00.000Z",
    "System",
    "Case assigned",
    `Assigned to ${INSPECTOR_LABEL}`,
  ),
];
