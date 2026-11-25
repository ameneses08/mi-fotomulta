import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { aiScripts, assistantScripts } from "@/data/aiScripts";
import {
  BULK_ACT_ID,
  cameras,
  challenges,
  citizen,
  DEMO_TODAY,
  fines,
  HERO_CASE_ID,
  HERO_FINE_ID,
  initialAudit,
  INSPECTOR_LABEL,
  INSPECTOR_NAME,
  legalActs,
  refunds,
} from "@/data/mockData";
import {
  caseIdForFine,
  clampFact,
  completeAutomaticChecks,
  draftRequest,
  emptyDraft,
  guessEvidenceKind,
  submitDraft,
  validateStep,
  type ChallengeDraft,
} from "@/lib/challenge";
import { answerQuestion, matchIntent, type AssistantAction } from "@/lib/assistant";
import { applyDecision } from "@/lib/decision";
import {
  autoVerifyRefund,
  decideRefund,
  EMPTY_BANK_FORM,
  submitBankDetails,
  type BankForm,
} from "@/lib/refund";
import { registerAct } from "@/lib/revocation";
import { createAuditEntry } from "@/lib/transitions";
import type { RulesContext } from "@/lib/rules";
import type {
  AuditEntry,
  Camera,
  ChallengeCase,
  Citizen,
  DecisionKind,
  Fine,
  LegalAct,
  RefundCase,
  RefundDecisionKind,
} from "@/types";
import { cancelScheduled, demoTimestamp, schedule } from "./demoClock";

/** Delays for simulated background work, in milliseconds. */
export const SIMULATION_DELAYS = { checksDone: 3000, refundCheck: 2500, assistantTyping: 800 };

interface DemoData {
  citizen: Citizen;
  fines: Fine[];
  cameras: Camera[];
  legalActs: LegalAct[];
  challenges: ChallengeCase[];
  refunds: RefundCase[];
  audit: AuditEntry[];
  draft: ChallengeDraft;
  draftError: string;
  bankForm: BankForm;
  bankError: string;
  bankSaved: boolean;
  /** State before the bulk act was registered, so the demo can revert it. */
  actSnapshot: { legalActs: LegalAct[]; refunds: RefundCase[] } | null;
  assistantMessages: AssistantMessage[];
  assistantTyping: boolean;
}

export interface AssistantMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  action?: AssistantAction;
  humanExit?: boolean;
  /** Show the suggested-question chips under this message. */
  showChips?: boolean;
}

export interface DecisionRequest {
  kind: DecisionKind;
  reason: string;
  citizenMessage: string;
  aiSuggestion: DecisionKind;
}

interface Actions {
  startChallenge: (fineId: string) => void;
  setReason: (reason: ChallengeDraft["reason"]) => void;
  setFact: (index: number, value: string) => void;
  setPastedText: (value: string) => void;
  structureClaim: () => void;
  addEvidence: (fileNames: string[]) => void;
  removeEvidence: (name: string) => void;
  setRequest: (value: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitChallenge: () => string | null;
  decideChallenge: (caseId: string, request: DecisionRequest) => string | null;
  decideRefundCase: (refundId: string, kind: RefundDecisionKind, reason: string) => string | null;
  setBankField: <K extends keyof BankForm>(field: K, value: BankForm[K]) => void;
  saveBankDetails: (refundId: string) => void;
  registerLegalAct: (actId: string, official: string) => string | null;
  revertLegalAct: () => void;
  payFine: (fineId: string) => void;
  resetDemo: (preset?: DemoPreset) => void;
  /** Restarts simulated background steps that a page reload interrupted. */
  resumeSimulations: () => void;
  askAssistant: (question: string) => void;
}

export type AppState = DemoData & Actions;

/**
 * "submitted": C-1042 is already with the inspector (staff and /demo ready).
 * "beforeChallenge": Marta has not challenged F-2041 yet, for recording the citizen journey.
 */
export type DemoPreset = "submitted" | "beforeChallenge";

function initialData(preset: DemoPreset = "submitted"): DemoData {
  const keep = (caseId: string) => preset === "submitted" || caseId !== HERO_CASE_ID;
  return {
    citizen,
    fines: [...fines],
    cameras: [...cameras],
    legalActs: [...legalActs],
    challenges: challenges.filter((c) => keep(c.id)),
    refunds: [...refunds],
    audit: initialAudit.filter((entry) => keep(entry.caseId)),
    draft: emptyDraft(HERO_FINE_ID),
    draftError: "",
    bankForm: EMPTY_BANK_FORM,
    bankError: "",
    bankSaved: false,
    actSnapshot: null,
    assistantMessages: [],
    assistantTyping: false,
  };
}

export function rulesContextOf(state: DemoData): RulesContext {
  const { fines, cameras, legalActs, challenges, refunds } = state;
  return { fines, cameras, legalActs, challenges, refunds };
}

function replaceById<T extends { id: string }>(items: T[], updated: T): T[] {
  const exists = items.some((item) => item.id === updated.id);
  return exists
    ? items.map((item) => (item.id === updated.id ? updated : item))
    : [...items, updated];
}

/** Only plain demo data is persisted; actions are recreated on load. */
function persistedData(state: AppState): DemoData {
  return {
    citizen: state.citizen,
    fines: state.fines,
    cameras: state.cameras,
    legalActs: state.legalActs,
    challenges: state.challenges,
    refunds: state.refunds,
    audit: state.audit,
    draft: state.draft,
    draftError: "",
    bankForm: state.bankForm,
    bankError: "",
    bankSaved: state.bankSaved,
    actSnapshot: state.actSnapshot,
    assistantMessages: state.assistantMessages,
    assistantTyping: false,
  };
}

export const DEMO_STORAGE_KEY = "mi-fotomulta-demo";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const updateDraft = (patch: Partial<ChallengeDraft>) =>
        set((s) => ({ draft: { ...s.draft, ...patch }, draftError: "" }));

      const finishAutomaticChecks = (caseId: string) => {
        const current = get().challenges.find((c) => c.id === caseId);
        if (current?.status !== "Received") return;
        const result = completeAutomaticChecks(current, INSPECTOR_LABEL, demoTimestamp());
        if (!result.ok) return;
        set((s) => ({
          challenges: replaceById(s.challenges, result.challenge),
          audit: [...s.audit, ...result.audit],
        }));
      };

      const runRefundCheck = (refundId: string) => {
        const state = get();
        const current = state.refunds.find((r) => r.id === refundId);
        if (!current) return;
        const result = autoVerifyRefund(
          current,
          rulesContextOf(state),
          DEMO_TODAY,
          demoTimestamp(),
        );
        if (!result?.ok) return;
        set((s) => ({
          refunds: replaceById(s.refunds, result.refund),
          audit: [...s.audit, ...result.audit],
        }));
      };

      return {
        ...initialData(),

        startChallenge: (fineId) => set({ draft: emptyDraft(fineId), draftError: "" }),
        setReason: (reason) => updateDraft({ reason }),
        setFact: (index, value) =>
          updateDraft({
            facts: get().draft.facts.map((f, i) => (i === index ? clampFact(value) : f)),
          }),
        setPastedText: (pastedText) => updateDraft({ pastedText }),
        structureClaim: () => {
          if (get().draft.pastedText.trim()) updateDraft({ facts: [...aiScripts.structuredFacts] });
        },
        addEvidence: (fileNames) => {
          const known = new Set(get().draft.evidence.map((e) => e.name));
          const added = fileNames
            .filter((name) => !known.has(name))
            .map((name) => ({ name, kind: guessEvidenceKind(name) }));
          updateDraft({ evidence: [...get().draft.evidence, ...added] });
        },
        removeEvidence: (name) =>
          updateDraft({ evidence: get().draft.evidence.filter((e) => e.name !== name) }),
        setRequest: (request) => updateDraft({ request }),
        nextStep: () => {
          const { draft, fines: allFines, citizen: owner } = get();
          const error = validateStep(draft);
          if (error) {
            set({ draftError: error });
            return;
          }
          const fine = allFines.find((f) => f.id === draft.fineId);
          const needsRequest = draft.step === 2 && !draft.request && fine;
          updateDraft({
            step: Math.min(3, draft.step + 1),
            ...(needsRequest ? { request: draftRequest(draft, fine, owner) } : {}),
          });
        },
        previousStep: () => updateDraft({ step: Math.max(0, get().draft.step - 1) }),
        submitChallenge: () => {
          const { draft, citizen: owner } = get();
          const caseId = caseIdForFine(draft.fineId, HERO_FINE_ID, HERO_CASE_ID);
          const result = submitDraft(draft, caseId, owner, DEMO_TODAY, demoTimestamp());
          if ("error" in result) {
            set({ draftError: result.error });
            return null;
          }
          set((s) => ({
            challenges: replaceById(s.challenges, result.challenge),
            audit: [...s.audit, ...result.audit],
          }));
          schedule(() => finishAutomaticChecks(caseId), SIMULATION_DELAYS.checksDone);
          return caseId;
        },

        decideChallenge: (caseId, request) => {
          const current = get().challenges.find((c) => c.id === caseId);
          if (!current) return "Case not found.";
          const result = applyDecision(current, {
            ...request,
            inspector: INSPECTOR_NAME,
            today: DEMO_TODAY,
            timestamp: demoTimestamp(),
          });
          if (!result.ok) return result.error;
          set((s) => ({
            challenges: replaceById(s.challenges, { ...result.entity, holder: INSPECTOR_LABEL }),
            audit: [...s.audit, ...result.audit],
          }));
          return null;
        },
        decideRefundCase: (refundId, kind, reason) => {
          const current = get().refunds.find((r) => r.id === refundId);
          if (!current) return "Refund not found.";
          const result = decideRefund(
            current,
            kind,
            INSPECTOR_NAME,
            reason,
            DEMO_TODAY,
            demoTimestamp(),
          );
          if (!result.ok) return result.error;
          set((s) => ({
            refunds: replaceById(s.refunds, result.refund),
            audit: [...s.audit, ...result.audit],
          }));
          return null;
        },

        setBankField: (field, value) =>
          set((s) => ({
            bankForm: { ...s.bankForm, [field]: value },
            bankError: "",
            bankSaved: false,
          })),
        saveBankDetails: (refundId) => {
          const { refunds: all, bankForm, citizen: owner } = get();
          const current = all.find((r) => r.id === refundId);
          if (!current) return;
          const result = submitBankDetails(current, bankForm, owner, demoTimestamp());
          if (!result.ok) {
            set({ bankError: result.error, bankSaved: false });
            return;
          }
          set((s) => ({
            refunds: replaceById(s.refunds, result.refund),
            audit: [...s.audit, ...result.audit],
            bankSaved: true,
            bankError: "",
          }));
          schedule(() => runRefundCheck(refundId), SIMULATION_DELAYS.refundCheck);
        },

        registerLegalAct: (actId, official) => {
          const state = get();
          const act = state.legalActs.find((a) => a.id === actId);
          if (!act) return "Legal act not found.";
          const result = registerAct(act, rulesContextOf(state), official, demoTimestamp());
          if (!result.ok) return result.error;
          set((s) => ({
            actSnapshot: { legalActs: s.legalActs, refunds: s.refunds },
            legalActs: replaceById(s.legalActs, result.act),
            refunds: result.refunds,
            audit: [...s.audit, ...result.audit],
          }));
          return null;
        },
        revertLegalAct: () => {
          const snapshot = get().actSnapshot;
          if (!snapshot) return;
          const entry = createAuditEntry({
            caseId: BULK_ACT_ID,
            actor: INSPECTOR_NAME,
            action: "Legal act reverted (demo only)",
            from: "In force",
            to: "Draft",
            reason: "Demo control: restore Scenario B",
            timestamp: demoTimestamp(),
          });
          set((s) => ({
            legalActs: snapshot.legalActs,
            refunds: snapshot.refunds,
            actSnapshot: null,
            audit: [...s.audit, entry],
          }));
        },

        payFine: (fineId) =>
          set((s) => ({
            fines: s.fines.map((f) => (f.id === fineId ? { ...f, paidOn: DEMO_TODAY } : f)),
          })),

        resetDemo: (preset) => {
          cancelScheduled();
          set(initialData(preset));
        },
        askAssistant: (question) => {
          const text = question.trim();
          if (!text || get().assistantTyping) return;
          const nextId = () => get().assistantMessages.length + 1;
          set((s) => ({
            assistantMessages: [...s.assistantMessages, { id: nextId(), role: "user", text }],
            assistantTyping: true,
          }));
          schedule(() => {
            const state = get();
            const intent = matchIntent(text);
            const reply: AssistantMessage = intent
              ? {
                  id: nextId(),
                  role: "assistant",
                  ...answerQuestion(intent, text, {
                    rules: rulesContextOf(state),
                    citizen: state.citizen,
                    today: DEMO_TODAY,
                  }),
                }
              : {
                  id: nextId(),
                  role: "assistant",
                  text: assistantScripts.fallback,
                  showChips: true,
                };
            set((s) => ({
              assistantMessages: [...s.assistantMessages, reply],
              assistantTyping: false,
            }));
          }, SIMULATION_DELAYS.assistantTyping);
        },
        resumeSimulations: () => {
          const { challenges: all, refunds: allRefunds, citizen: owner } = get();
          all
            .filter((c) => c.status === "Received")
            .forEach((c) =>
              schedule(() => finishAutomaticChecks(c.id), SIMULATION_DELAYS.checksDone),
            );
          allRefunds
            .filter(
              (r) =>
                r.claimantDocument === owner.document && r.status === "Verifying payment details",
            )
            .forEach((r) => schedule(() => runRefundCheck(r.id), SIMULATION_DELAYS.refundCheck));
        },
      };
    },
    {
      name: DEMO_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      partialize: persistedData,
      // Hydrate after mount so the server-rendered HTML matches the first client render.
      skipHydration: true,
    },
  ),
);
