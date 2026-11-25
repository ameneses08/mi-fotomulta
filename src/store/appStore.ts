import { create } from "zustand";
import { aiScripts } from "@/data/aiScripts";
import {
  citizen,
  fines,
  initialCases,
  legalActs,
  type Fine,
  type CaseRecord,
} from "@/data/mockData";
type RefundForm = { bank: string; type: string; account: string; consent: boolean };
type State = {
  citizen: typeof citizen;
  fines: Fine[];
  cases: CaseRecord[];
  legalActs: typeof legalActs;
  recoverableAmount: number;
  step: number;
  reason: string;
  facts: string[];
  pastedText: string;
  evidence: string[];
  draft: string;
  challengeFineId: string;
  challengeError: string;
  refundForm: RefundForm;
  refundSaved: boolean;
  refundError: string;
  refundStage: number;
  paymentFineId: string | null;
  queueFilter: string;
  selectedCaseId: string;
  startChallenge: (id: string) => void;
  setReason: (value: string) => void;
  setFact: (index: number, value: string) => void;
  setPastedText: (value: string) => void;
  structureClaim: () => void;
  addEvidence: (names: string[]) => void;
  removeEvidence: (name: string) => void;
  setDraft: (value: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitChallenge: () => string | null;
  setRefundField: <K extends keyof RefundForm>(field: K, value: RefundForm[K]) => void;
  saveRefund: () => void;
  openPayment: (id: string | null) => void;
  confirmMockPayment: () => void;
  setQueueFilter: (value: string) => void;
  selectCase: (id: string) => void;
  advanceCase: (id: string) => void;
};
export const useAppStore = create<State>((set, get) => ({
  citizen,
  fines,
  cases: initialCases,
  legalActs,
  recoverableAmount: fines
    .filter((f) => f.paid && !f.authorised && !f.external)
    .reduce((total, f) => total + f.amount, 0),
  step: 0,
  reason: "",
  facts: ["", "", ""],
  pastedText: "",
  evidence: [],
  draft: "",
  challengeFineId: "F-2041",
  challengeError: "",
  refundForm: { bank: "", type: "Savings", account: "", consent: false },
  refundSaved: false,
  refundError: "",
  refundStage: 0,
  paymentFineId: null,
  queueFilter: "All cases",
  selectedCaseId: "C-1042",
  startChallenge: (id) =>
    set({
      challengeFineId: id,
      step: 0,
      reason: "",
      facts: ["", "", ""],
      pastedText: "",
      evidence: [],
      draft: "",
      challengeError: "",
    }),
  setReason: (reason) => set({ reason, challengeError: "" }),
  setFact: (index, value) =>
    set((s) => ({
      facts: s.facts.map((f, i) => (i === index ? value.slice(0, 500) : f)),
      challengeError: "",
    })),
  setPastedText: (pastedText) => set({ pastedText }),
  structureClaim: () => {
    if (get().pastedText.trim()) set({ facts: [...aiScripts.structuredFacts], challengeError: "" });
  },
  addEvidence: (names) => set((s) => ({ evidence: [...new Set([...s.evidence, ...names])] })),
  removeEvidence: (name) => set((s) => ({ evidence: s.evidence.filter((n) => n !== name) })),
  setDraft: (draft) => set({ draft, challengeError: "" }),
  nextStep: () => {
    const s = get();
    if (s.step === 0 && !s.reason) {
      set({ challengeError: "Choose a reason to continue." });
      return;
    }
    if (s.step === 1 && s.facts.some((f) => !f.trim())) {
      set({ challengeError: "Answer all three questions to continue." });
      return;
    }
    set({
      step: Math.min(3, s.step + 1),
      challengeError: "",
      ...(s.step === 2 && !s.draft
        ? { draft: aiScripts.draft.replaceAll("F-2041", s.challengeFineId) }
        : {}),
    });
  },
  previousStep: () => set((s) => ({ step: Math.max(0, s.step - 1), challengeError: "" })),
  submitChallenge: () => {
    const s = get();
    if (!s.draft.trim()) {
      set({ challengeError: "Your request cannot be empty." });
      return null;
    }
    const id = s.challengeFineId === "F-2041" ? "C-1042" : `C-${s.challengeFineId.slice(2)}`;
    const record: CaseRecord = {
      ...initialCases[0],
      id,
      fineId: s.challengeFineId,
      citizen: citizen.name,
      reason: s.reason,
      stage: 1,
      holder: "Automatic checks",
      expected: "04 Dec 2026",
      statusMessage: "We are checking your information",
      history: [...(initialCases[0]?.history ?? [])],
    };
    set({
      cases: [...s.cases.filter((c) => c.id !== id), record],
      fines: s.fines.map((f) =>
        f.id === s.challengeFineId ? { ...f, status: "Being checked", tone: "info" } : f,
      ),
      selectedCaseId: id,
    });
    return id;
  },
  setRefundField: (field, value) =>
    set((s) => ({
      refundForm: { ...s.refundForm, [field]: value },
      refundSaved: false,
      refundError: "",
    })),
  saveRefund: () => {
    const f = get().refundForm;
    if (!f.bank.trim() || !/^\d{6,20}$/.test(f.account)) {
      set({ refundError: "Choose a bank and enter an account number with 6–20 digits." });
      return;
    }
    if (!f.consent) {
      set({ refundError: "Your separate consent is required to save payment details." });
      return;
    }
    set({ refundSaved: true, refundError: "" });
  },
  openPayment: (paymentFineId) => set({ paymentFineId }),
  confirmMockPayment: () =>
    set((s) => ({
      fines: s.fines.map((f) =>
        f.id === s.paymentFineId ? { ...f, paid: true, status: "Paid", tone: "success" } : f,
      ),
      paymentFineId: null,
    })),
  setQueueFilter: (queueFilter) => set({ queueFilter }),
  selectCase: (selectedCaseId) => set({ selectedCaseId }),
  advanceCase: (id) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id && c.stage < 4
          ? {
              ...c,
              stage: c.stage + 1,
              holder: "Inspector Laura Gómez",
              statusMessage:
                [
                  "Challenge received",
                  "We are checking your information",
                  "Your hearing is being arranged",
                  "An inspector is preparing your decision",
                  "Your case is closed",
                ][c.stage + 1] ?? "Your case is closed",
              history: [
                {
                  title:
                    [
                      "Submitted",
                      "Being checked",
                      "Hearing scheduled",
                      "Decision in preparation",
                      "Case closed",
                    ][c.stage + 1] ?? "Case updated",
                  date: "25 Nov 2026 · 11:00",
                  detail: "Updated by Inspector Laura Gómez in the demo.",
                },
                ...c.history,
              ],
            }
          : c,
      ),
    })),
}));
