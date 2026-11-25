import { analysisScripts as T } from "@/data/aiScripts";
import { fillTemplate, formatDate } from "@/lib/format";
import type { AnalysisFinding, ChallengeCase, EvidenceKind, Fine } from "@/types";
import { documentOf, evidenceFrom, fieldOf, makeFinding, type AnalysisContext } from "./finding";

const REQUIRED: Partial<Record<ChallengeCase["reason"], EvidenceKind[]>> = {
  "I wasn't driving": ["ID copy", "Driver statement"],
  "Vehicle sold before the fine": ["Bill of sale"],
};

const sameName = (a?: string, b?: string) =>
  Boolean(a && b) && a?.trim().toLowerCase() === b?.trim().toLowerCase();

/** Is the driver identified by a signed statement that matches a valid licence? */
export function driverIdentified(challenge: ChallengeCase, fine: Fine): boolean {
  const statement = documentOf(challenge, "Driver statement");
  const licence = documentOf(challenge, "Driving licence");
  const driver = fieldOf(statement, "Driver")?.value;
  const until = fieldOf(licence, "Valid until")?.value;
  return (
    fieldOf(statement, "Signature")?.value === "Present" &&
    Boolean(fieldOf(statement, "Date signed")) &&
    sameName(driver, fieldOf(licence, "Full name")?.value) &&
    Boolean(until && until >= fine.infractionDate)
  );
}

function presence(challenge: ChallengeCase, ctx: AnalysisContext): AnalysisFinding | undefined {
  if (challenge.representative) return undefined;
  const required = REQUIRED[challenge.reason] ?? [];
  const missing = required.filter((kind) => !documentOf(challenge, kind));
  const found = challenge.evidence.map((item) => item.kind);
  const why = !challenge.evidence.length
    ? T.why.documentsNone
    : missing.length
      ? fillTemplate(T.why.documentsMissing, { missing: missing.join(", ") })
      : fillTemplate(T.why.documentsPass, { found: found.join(", ") });
  return makeFinding(
    "documents",
    {
      caseId: challenge.id,
      category: "Documents",
      check: T.checks.documentsPresent,
      result: !challenge.evidence.length || missing.length ? "Flag" : "Pass",
      evidence: "From: uploaded files",
      confidence: "High",
      level: "A",
      why,
    },
    ctx,
  );
}

function statementAndLicence(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  const statement = documentOf(challenge, "Driver statement");
  const licence = documentOf(challenge, "Driving licence");
  const id = documentOf(challenge, "ID copy");
  const driver = fieldOf(statement, "Driver")?.value ?? "";
  const findings: AnalysisFinding[] = [];
  if (statement) {
    const date = fieldOf(statement, "Date signed")?.value;
    const signed =
      fieldOf(statement, "Signature")?.value === "Present" &&
      Boolean(date && date <= challenge.submittedOn);
    findings.push(
      makeFinding(
        "statement",
        {
          caseId: challenge.id,
          category: "Documents",
          check: T.checks.statementSigned,
          result: signed ? "Pass" : "Flag",
          evidence: evidenceFrom(statement, "Signature"),
          confidence: "Medium",
          level: "S",
          why: signed
            ? fillTemplate(T.why.statementPass, { driver, date: formatDate(date ?? "") })
            : T.why.statementFlag,
        },
        ctx,
      ),
    );
  }
  if (id && statement && licence) {
    const ownerOk = sameName(fieldOf(id, "Full name")?.value, challenge.citizenName);
    const driverOk = sameName(driver, fieldOf(licence, "Full name")?.value);
    const detail = ownerOk ? "statement and licence" : "ID and registered owner";
    findings.push(
      makeFinding(
        "names",
        {
          caseId: challenge.id,
          category: "Documents",
          check: T.checks.namesConsistent,
          result: ownerOk && driverOk ? "Pass" : "Flag",
          evidence: `${evidenceFrom(id, "Full name")}; ${evidenceFrom(licence, "Full name")}`,
          confidence: "Medium",
          level: "S",
          why:
            ownerOk && driverOk
              ? fillTemplate(T.why.namesPass, { driver })
              : fillTemplate(T.why.namesFlag, { detail }),
        },
        ctx,
      ),
    );
  }
  if (licence) {
    const until = fieldOf(licence, "Valid until")?.value ?? "";
    const valid = until >= fine.infractionDate;
    findings.push(
      makeFinding(
        "licence",
        {
          caseId: challenge.id,
          category: "Documents",
          check: T.checks.licenceValid,
          result: valid ? "Pass" : "Flag",
          evidence: evidenceFrom(licence, "Valid until"),
          confidence: "High",
          level: "S",
          why: fillTemplate(valid ? T.why.licencePass : T.why.licenceFlag, {
            licence: fieldOf(licence, "Licence number")?.value ?? "",
            until: formatDate(until),
            infraction: formatDate(fine.infractionDate),
          }),
        },
        ctx,
      ),
    );
  }
  return findings;
}

function driverFinding(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding {
  const identified = driverIdentified(challenge, fine);
  const driver = fieldOf(documentOf(challenge, "Driver statement"), "Driver")?.value ?? "";
  return makeFinding(
    "R7",
    {
      caseId: challenge.id,
      category: "Documents",
      check: T.checks.driverIdentified,
      result: identified ? "Info" : "Flag",
      evidence: identified ? "From: Driver statement and Driving licence" : "From: uploaded files",
      confidence: identified ? "High" : "Medium",
      level: "H",
      ruleId: "R7",
      why: identified ? fillTemplate(T.why.driverInfo, { driver }) : T.why.driverFlag,
    },
    ctx,
  );
}

/** Presence, signatures, dates and name matches across the AI-extracted fields. */
export function documentFindings(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  const findings = [presence(challenge, ctx), ...statementAndLicence(challenge, fine, ctx)];
  if (challenge.reason === "I wasn't driving") findings.push(driverFinding(challenge, fine, ctx));
  return findings.filter((f): f is AnalysisFinding => Boolean(f));
}
