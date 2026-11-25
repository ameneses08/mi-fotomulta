import type { EvidenceItem } from "@/types";

/**
 * Fictional evidence documents with "AI-extracted" fields. All names, numbers and dates are
 * invented. Field values use ISO dates so the analysis engine can compare them.
 */

/** Marta's documents for C-1042 ("I wasn't driving"). Also used by "Use sample documents". */
export const HERO_EVIDENCE: EvidenceItem[] = [
  {
    name: "cedula-marta-rodriguez.pdf",
    kind: "ID copy",
    extracted: [
      { name: "Full name", value: "Marta Rodríguez Peña", page: 1 },
      { name: "Document number", value: "1.020.345.678", page: 1 },
    ],
  },
  {
    name: "signed-statement-andres-rodriguez.pdf",
    kind: "Driver statement",
    extracted: [
      { name: "Declarant", value: "Andrés Rodríguez Peña", page: 1 },
      { name: "Driver", value: "Andrés Rodríguez Peña", page: 1 },
      { name: "Signature", value: "Present", page: 1 },
      { name: "Date signed", value: "2026-11-18", page: 1 },
    ],
  },
  {
    name: "licence-andres-rodriguez.pdf",
    kind: "Driving licence",
    extracted: [
      { name: "Full name", value: "Andrés Rodríguez Peña", page: 1 },
      { name: "Licence number", value: "LIC-80214733", page: 1 },
      { name: "Valid until", value: "2029-04-30", page: 1 },
    ],
  },
];

/** A complete "I wasn't driving" filing: owner's ID, a signed driver statement and the licence. */
export function driverEvidence(
  owner: string,
  ownerDocument: string,
  driver: string,
  signedOn: string,
  licence: string,
): EvidenceItem[] {
  const slug = driver.toLowerCase().split(" ")[0];
  return [
    {
      name: "id-copy.pdf",
      kind: "ID copy",
      extracted: [
        { name: "Full name", value: owner, page: 1 },
        { name: "Document number", value: ownerDocument, page: 1 },
      ],
    },
    {
      name: `signed-statement-${slug}.pdf`,
      kind: "Driver statement",
      extracted: [
        { name: "Declarant", value: driver, page: 1 },
        { name: "Driver", value: driver, page: 1 },
        { name: "Signature", value: "Present", page: 1 },
        { name: "Date signed", value: signedOn, page: 1 },
      ],
    },
    {
      name: `licence-${slug}.pdf`,
      kind: "Driving licence",
      extracted: [
        { name: "Full name", value: driver, page: 1 },
        { name: "Licence number", value: licence, page: 1 },
        { name: "Valid until", value: "2028-09-30", page: 1 },
      ],
    },
  ];
}

/** LegalRápido S.A.S. power of attorney for one represented citizen. */
export function powerOfAttorney(person: string, expires: string): EvidenceItem {
  return {
    name: "power-of-attorney.pdf",
    kind: "Power of attorney",
    extracted: [
      { name: "Represented person", value: person, page: 1 },
      { name: "Expires", value: expires, page: 2 },
    ],
  };
}

/** C-1046's new evidence: a camera calibration certificate that had already expired. */
export const EXPIRED_CALIBRATION: EvidenceItem = {
  name: "calibration-certificate-CAM-AN170.pdf",
  kind: "Calibration certificate",
  extracted: [
    { name: "Camera", value: "CAM-AN170", page: 1 },
    { name: "Valid until", value: "2026-03-31", page: 1 },
  ],
};

/** C-1053: bill of sale dated before the infraction; RUNT still lists the seller. */
export const BILL_OF_SALE: EvidenceItem = {
  name: "bill-of-sale-DFR662.pdf",
  kind: "Bill of sale",
  extracted: [
    { name: "Date of sale", value: "2026-10-02", page: 1 },
    { name: "Seller", value: "Natalia Cortés Ruiz", page: 1 },
    { name: "Buyer", value: "Jhon Fredy Castaño Ríos", page: 1 },
  ],
};

/** C-1049: photo saved with an editor after capture (possible manipulation). */
export const EDITED_PHOTO: EvidenceItem = {
  name: "traffic-light-photo.jpg",
  kind: "Photo",
  metadata: {
    capturedAt: "2026-10-22T17:40:00.000Z",
    modifiedAt: "2026-11-08T21:15:00.000Z",
    software: "PhotoEdit Pro 5",
  },
};

/** C-1048: clean photo of the envelope postmark. */
export const ENVELOPE_PHOTO: EvidenceItem = {
  name: "envelope-postmark.jpg",
  kind: "Photo",
  metadata: { capturedAt: "2026-11-06T12:05:00.000Z" },
};

/** The near-identical text every LegalRápido filing uses. */
export const LEGAL_RAPIDO_TEMPLATE =
  "To the Secretaría Distrital de Movilidad de Bogotá. LegalRápido S.A.S., acting for {name} under the attached power of attorney, challenges photo-fine {fine_id} imposed on vehicle {plate}. The camera that recorded the alleged infraction did not have a valid authorisation from the national road safety agency on the date of the event. Under the applicable rules, fines produced by unauthorised or uncalibrated devices lack legal effect and must be revoked. The authority bears the burden of proving that the device was authorised and calibrated at the time of the event. We therefore request the revocation of the fine, the closure of the proceedings and the removal of the record from the national fines system. We ask to be notified of the decision at the address registered with LegalRápido S.A.S. In addition, we request a certified copy of the authorisation of the device, its most recent calibration certificate and the technical file of the measurement, so that the represented person can exercise the right of defence. If the authority considers that any document is missing, we ask to be informed within the legal term so that it can be provided. We reserve the right to file any further appeal provided by law against the decision that resolves this request.";
