import { CheckCircle2, Landmark } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { bankFormFromData } from "@/lib/refund";
import { useAppStore } from "@/store/appStore";
import { useHasHydrated } from "@/store/useHasHydrated";
import type { RefundCase } from "@/types";
import { BankFields } from "./BankFields";

/**
 * The fields are uncontrolled: what the citizen sees is what gets submitted, even when the
 * browser filled a field without a change event (autofill, form restore, typing before load).
 * Changes are still mirrored to the store so a reload keeps them.
 */
export function BankDetailsForm({ refund }: { refund: RefundCase }) {
  const form = useAppStore((s) => s.bankForm);
  const errors = useAppStore((s) => s.bankErrors);
  const saved = useAppStore((s) => s.bankSaved);
  const setField = useAppStore((s) => s.setBankField);
  const save = useAppStore((s) => s.saveBankDetails);
  // Remount once after hydration so the fields start from the restored values.
  const hydrated = useHasHydrated();
  const onHold = refund.status === "On hold";

  return (
    <form
      key={hydrated ? "restored" : "initial"}
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        save(refund.id, bankFormFromData(new FormData(e.currentTarget)));
      }}
    >
      <h2 className="mt-8 text-xl font-semibold @2xl:mt-6">Where should we pay you?</h2>
      <p className="page-subtitle">The account must be in your name. Use fictional details only.</p>
      <BankFields initial={form} errors={errors} onFieldChange={setField} />
      {saved && (
        <Notice icon={CheckCircle2} variant="success" role="status">
          {onHold
            ? "Details saved for this demo session. Your refund stays on hold until the authority decides."
            : "Account received. We are checking that it is in your name."}
        </Notice>
      )}
      <Button type="submit" className="mt-5 w-full">
        <Landmark size={18} aria-hidden="true" />
        {onHold ? "Save payment details" : "Confirm bank account"}
      </Button>
    </form>
  );
}
