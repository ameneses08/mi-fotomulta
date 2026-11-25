import type {
  AssistantIntent,
  ChallengeReason,
  DecisionKind,
  FineStatus,
  RefundStatus,
  RuleId,
} from "@/types";

/**
 * Every simulated AI text in the prototype. Nothing here comes from a live model.
 * {placeholders} are filled by lib/format.ts → fillTemplate.
 */

export const AI_LABELS = {
  citizen: "AI assistant – information, not legal advice",
  assistant: "AI assistant – simulated · information, not legal advice",
  staff: "AI suggestion – an inspector decides",
  simulated: "Simulated response",
} as const;

export interface CaseBrief {
  brief: string;
  suggestion: DecisionKind;
  suggestedReason: string;
  reliedOn: RuleId[];
}

const structuredFacts = [
  "On 12 November 2026 my brother, Julián Rodríguez Peña, was using my vehicle on Av. Boyacá con Calle 80. I was not driving.",
  "I know because he borrowed the car that day to go to work. He has signed a statement confirming that he was driving.",
  "Please check who was driving using the evidence, instead of assuming that I was driving because I am the registered owner.",
];

const requestTemplate =
  "To the Secretaría Distrital de Movilidad de Bogotá:\n\nI, {citizen_name}, request a review of photo-fine {fine_id} for vehicle {plate}, recorded on {date} at {location}.\n\nReason: {reason}.\n\n{facts}\n\nI ask the inspector to assess the evidence and give a reasoned decision. I understand that submitting this request does not guarantee that the fine is cancelled.\n\n{citizen_name}";

export const aiScripts = {
  explanation: {
    authorised:
      "This photo-fine records a possible traffic violation by your vehicle. The camera was authorised on that date, according to the ANSV. Being the registered owner does not prove you were driving. If you were not, you can challenge the fine and tell us who was.",
    unauthorised:
      "The camera that recorded this fine was not authorised on that date, according to the ANSV. The competent authority must decide what happens to fines from this camera. You do not need to do anything now: we will update this page when that changes.",
    revoked:
      "This fine has been revoked. You do not need to pay it. If you already paid, you can claim your money back from this app.",
    external:
      "This fine was issued by the Secretaría de Movilidad de Soacha, not by Bogotá. Only that authority can review or cancel it. Contact them directly.",
  },
  structuredFacts,
  evidence: {
    empty:
      "No documents yet. For a 'not the driver' challenge, a copy of your ID and a statement signed by the person who was driving help most. An inspector will assess them.",
    checked:
      "Your files are readable. They look like an ID copy and a signed statement. This check cannot confirm that a document is authentic – an inspector will do that.",
  },
  requestTemplate,
  citizenMessageDrafts: {
    Revoke:
      "Dear {first_name}, we reviewed your challenge and revoked fine {fine_id}. Reason: {reason}. You do not need to pay it. If you already paid, you can claim a refund in this app.",
    Uphold:
      "Dear {first_name}, we reviewed your challenge and kept fine {fine_id}. Reason: {reason}. You can pay the fine or appeal by the date shown.",
    "Partly uphold":
      "Dear {first_name}, we partly accepted your challenge on fine {fine_id}. Reason: {reason}. You can appeal by the date shown.",
    "Schedule hearing":
      "Dear {first_name}, we need to hear you before deciding on fine {fine_id}: {reason}. Please attend on the date shown and bring your ID and original documents.",
    "Request correction":
      "Dear {first_name}, to keep reviewing fine {fine_id} we need {reason}. Please send it before the date shown so your case stays open.",
  } satisfies Record<DecisionKind, string>,
  caseBriefs: {
    "C-1042": {
      brief:
        "The registered owner says her brother was driving and attached her ID and a statement signed by him. The camera was authorised and the challenge was filed on time. Under C-038/2020 the owner cannot be presumed to be the driver; the authority must identify who was driving. The evidence names another driver and nothing contradicts it.",
      suggestion: "Revoke",
      suggestedReason:
        "The owner cannot be presumed to be the driver (Constitutional Court C-038/2020), and a signed statement identifies another person as the driver.",
      reliedOn: ["R1", "R4", "R7", "R9"],
    },
  } as Partial<Record<string, CaseBrief>>,
  briefsByReason: {
    "I wasn't driving": {
      brief:
        "The owner says someone else was driving. The owner cannot be presumed to be the driver (C-038/2020). Check whether the evidence identifies the driver.",
      suggestion: "Request correction",
      suggestedReason: "We need a statement signed by the person who was driving.",
      reliedOn: ["R7", "R9"],
    },
    "Camera not authorised": {
      brief:
        "This argument is templated and shared with other cases from the same representative. The ANSV record confirms that the camera was not authorised on the infraction date. Decide on this case individually; grouping is only an overview.",
      suggestion: "Revoke",
      suggestedReason: "The camera was not authorised by the ANSV on the infraction date.",
      reliedOn: ["R4", "R9", "R10"],
    },
    "Wrong plate": {
      brief:
        "The plate read from the image differs from the RUNT record by one character. The citizen's vehicle may not be the one recorded. Confirm the image before deciding.",
      suggestion: "Revoke",
      suggestedReason: "The plate in the camera image does not match the citizen's vehicle.",
      reliedOn: ["R6"],
    },
    "Notification arrived late": {
      brief:
        "The challenge was filed after the 11-working-day window, but the notice itself was sent outside the legal window. A late filing routes the case; it does not remove the right to be heard.",
      suggestion: "Schedule hearing",
      suggestedReason: "Notification may have been late; the citizen should be heard first.",
      reliedOn: ["R1", "R5"],
    },
    "Vehicle sold before the fine": {
      brief:
        "The owner says the car was sold before the infraction, but the transfer is not registered in RUNT. A human must assess the sale contract.",
      suggestion: "Schedule hearing",
      suggestedReason: "The sale contract must be assessed at a hearing.",
      reliedOn: ["R8"],
    },
    Other: {
      brief:
        "The claim gives no new evidence. The camera was authorised and the plate matches. Check the facts before deciding.",
      suggestion: "Uphold",
      suggestedReason: "The claim does not show an error in the fine.",
      reliedOn: ["R4", "R6", "R9"],
    },
  } satisfies Record<ChallengeReason, CaseBrief>,
  refundBrief: {
    pass: "The fine is revoked, no refund has been paid and the bank account is in the claimant's name. This refund can be approved.",
    mismatch:
      "The bank account holder is not the claimant. Ask the claimant for an account in their own name before approving.",
    onHold:
      "The camera was not authorised, but no legal act is in force. The refund stays on hold until the act is registered.",
  },
  groupingNote: "Grouping is for overview only. Each case is decided individually.",
} as const;

/** Citizen assistant templates. Filled from live state by lib/assistant.ts. */
export const assistantScripts = {
  greeting: "Hi {first_name}, I can check your photo-fines, deadlines and refunds.",
  chips: [
    { intent: "statusCheck", question: "Give me a status check of my fotomultas" },
    { intent: "challengeDeadline", question: "How long do I have to challenge F-2041?" },
    { intent: "whyUnderReview", question: "Why is F-2042 under review?" },
    { intent: "refundTiming", question: "When will I get my refund?" },
  ] satisfies { intent: AssistantIntent; question: string }[],
  fallback: "In this prototype I can help with these questions:",
  humanExit:
    "Prefer to talk to a person? Call Línea 195 or visit a Centro de Servicios de Movilidad.",
  status: {
    intro: "You have {total} fines: {parts}.",
    parts: {
      "Pending payment": "{n} to pay",
      "Challenge in progress": "{n} with a challenge in progress ({detail})",
      "Under review": "{n} under review because the camera wasn't authorised",
      "Refund on hold": "{n} refund on hold",
      Paid: "{n} paid",
      Revoked: "{n} revoked",
      "Another authority": "{n} from another authority",
    } satisfies Record<FineStatus, string>,
    challengeDetail: "{holder}, expected by {date}",
    challengeDetailNoDate: "{holder}",
  },
  deadline: {
    open: "You have until {deadline} to challenge {fine_id}: {days_left} working days left. The 11 working days count from the notification on {notified}.",
    alreadyChallenged:
      "You already challenged {fine_id} on {submitted} (case {case_id}). Its status now: {status}.",
    passed:
      "The 11-working-day window for {fine_id} ended on {deadline}. You can still file: a late challenge is routed to an inspector, not refused automatically.",
    unavailable: "{fine_id} can't be challenged here because its status is: {status}.",
  },
  why: {
    underReview:
      "{fine_id} is under review because camera {camera} was not authorised by the ANSV on {date}. What happens to fines from that camera depends on a decision by the competent authority. You don't need to do anything now.",
    revoked:
      "{fine_id} is no longer under review: it has been revoked{by_act}. You don't need to pay it.",
    other: "{fine_id} is not under review. Its status is: {status}.",
  },
  refund: {
    "On hold":
      "Your refund of {amount} for {fine_id} is on hold. It depends on a decision by the competent authority about camera {camera}; I'll show the change here as soon as it happens.",
    Eligible:
      "Good news: your refund of {amount} for {fine_id} is ready. Confirm a bank account in your name to receive it.",
    "Verifying payment details":
      "We're checking that the bank account is in your name. It usually takes a moment.",
    "Needs correction": "We couldn't verify your account. Add an account in your name to continue.",
    Approved: "Your refund of {amount} is approved. Expected payment by {date}.",
    Paid: "We paid {amount} on {date}.",
    Rejected: "Your refund was not approved. You can appeal; the refund page explains how.",
    Appealed: "We received your appeal and will tell you the decision here.",
  } satisfies Record<RefundStatus, string>,
  noRefund: "You don't have a refund in progress.",
  actions: {
    fine: "View {id}",
    case: "Track my challenge",
    challenge: "Challenge {id}",
    refund: "View my refund",
    fines: "View my fines",
  },
} as const;
