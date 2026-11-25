import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  deriveFineStatus,
  evaluateChallengeRules,
  evaluateRefundRules,
  type RulesContext,
} from "@/lib/rules";
import type { AuditEntry, FineStatus, RuleCheck } from "@/types";
import { useAppStore } from "./appStore";

/** The slices the rules engine reads, selected shallowly so components re-render only on change. */
export function useRulesContext(): RulesContext {
  return useAppStore(
    useShallow((s) => ({
      fines: s.fines,
      cameras: s.cameras,
      legalActs: s.legalActs,
      challenges: s.challenges,
      refunds: s.refunds,
    })),
  );
}

export function useFine(fineId: string | undefined) {
  return useAppStore((s) => s.fines.find((f) => f.id === fineId));
}

export function useChallenge(caseId: string | undefined) {
  return useAppStore((s) => s.challenges.find((c) => c.id === caseId));
}

export function useRefund(refundId: string | undefined) {
  return useAppStore((s) => s.refunds.find((r) => r.id === refundId));
}

export function useFineStatus(fineId: string): FineStatus | undefined {
  const ctx = useRulesContext();
  return useMemo(() => {
    const fine = ctx.fines.find((f) => f.id === fineId);
    return fine ? deriveFineStatus(fine, ctx) : undefined;
  }, [ctx, fineId]);
}

export function useRuleChecks(caseId: string): RuleCheck[] {
  const ctx = useRulesContext();
  return useMemo(() => {
    const challenge = ctx.challenges.find((c) => c.id === caseId);
    if (challenge) return evaluateChallengeRules(challenge, ctx);
    const refund = ctx.refunds.find((r) => r.id === caseId);
    return refund ? evaluateRefundRules(refund, ctx) : [];
  }, [ctx, caseId]);
}

/** Audit entries for one case, newest first. */
export function useCaseAudit(caseId: string): AuditEntry[] {
  const audit = useAppStore((s) => s.audit);
  return useMemo(
    () =>
      audit
        .filter((entry) => entry.caseId === caseId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [audit, caseId],
  );
}
