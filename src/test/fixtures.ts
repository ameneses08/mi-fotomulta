import type { AnalysisContext } from "@/lib/analysis";
import type { RulesContext } from "@/lib/rules";
import type { Camera, ChallengeCase, EvidenceItem, Fine, LegalAct, RefundCase } from "@/types";

export const authorisedCamera: Camera = {
  id: "CAM-OK",
  location: "Test avenue",
  authorisedFrom: "2025-01-01",
};

export const unauthorisedCamera: Camera = { id: "CAM-BAD", location: "Test street" };

export function makeFine(overrides: Partial<Fine> = {}): Fine {
  return {
    id: "F-1",
    reference: "REF-1",
    ownerName: "Test Owner",
    ownerDocument: "1",
    plate: "AAA111",
    imagePlate: "AAA111",
    infractionDate: "2026-11-02",
    notificationDate: "2026-11-04",
    location: "Test avenue",
    offence: "Speeding",
    amount: 650000,
    authorityId: "SDM",
    cameraId: authorisedCamera.id,
    ...overrides,
  };
}

export function makeChallenge(overrides: Partial<ChallengeCase> = {}): ChallengeCase {
  return {
    kind: "challenge",
    id: "C-1",
    fineId: "F-1",
    citizenName: "Test Owner",
    citizenDocument: "1",
    reason: "I wasn't driving",
    submittedOn: "2026-11-10",
    status: "Validating",
    hadHearing: false,
    holder: "Inspector",
    facts: [],
    request: "",
    evidence: [{ name: "id.pdf", kind: "ID copy" }],
    messageValues: {},
    ...overrides,
  };
}

export function makeRefund(overrides: Partial<RefundCase> = {}): RefundCase {
  return {
    kind: "refund",
    id: "R-1",
    fineId: "F-1",
    claimantName: "Test Owner",
    claimantDocument: "1",
    amount: 650000,
    requestedOn: "2026-11-10",
    status: "On hold",
    messageValues: {},
    ...overrides,
  };
}

export function makeAct(overrides: Partial<LegalAct> = {}): LegalAct {
  return {
    id: "ACT-1",
    number: "Resolution 1",
    title: "Test act",
    issuer: "Ministry",
    summary: "",
    cameraIds: [unauthorisedCamera.id],
    status: "Draft",
    ...overrides,
  };
}

export function makeContext(overrides: Partial<RulesContext> = {}): RulesContext {
  return {
    fines: [makeFine()],
    cameras: [authorisedCamera, unauthorisedCamera],
    legalActs: [makeAct()],
    challenges: [],
    refunds: [],
    ...overrides,
  };
}

export function makeAnalysisContext(overrides: Partial<AnalysisContext> = {}): AnalysisContext {
  return { ...makeContext(), reviews: {}, today: "2026-11-25", ...overrides };
}

/** The documents of a well-formed "I wasn't driving" filing. */
export function driverDocuments(
  overrides: { driverOnLicence?: string; licenceUntil?: string } = {},
): EvidenceItem[] {
  return [
    {
      name: "id.pdf",
      kind: "ID copy",
      extracted: [{ name: "Full name", value: "Test Owner", page: 1 }],
    },
    {
      name: "statement.pdf",
      kind: "Driver statement",
      extracted: [
        { name: "Driver", value: "Test Driver", page: 1 },
        { name: "Signature", value: "Present", page: 1 },
        { name: "Date signed", value: "2026-11-05", page: 1 },
      ],
    },
    {
      name: "licence.pdf",
      kind: "Driving licence",
      extracted: [
        { name: "Full name", value: overrides.driverOnLicence ?? "Test Driver", page: 1 },
        { name: "Licence number", value: "L-1", page: 1 },
        { name: "Valid until", value: overrides.licenceUntil ?? "2030-01-01", page: 1 },
      ],
    },
  ];
}
