import { CheckCircle2, Landmark } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { CONSENT_PURPOSE } from "@/lib/refund";
import { useAppStore } from "@/store/appStore";
import type { RefundCase } from "@/types";

const BANKS = ["Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Other"];

export function BankDetailsForm({ refund }: { refund: RefundCase }) {
  const form = useAppStore((s) => s.bankForm);
  const error = useAppStore((s) => s.bankError);
  const saved = useAppStore((s) => s.bankSaved);
  const setField = useAppStore((s) => s.setBankField);
  const save = useAppStore((s) => s.saveBankDetails);
  const onHold = refund.status === "On hold";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save(refund.id);
      }}
    >
      <h2 className="mt-8 text-xl font-semibold">Where should we pay you?</h2>
      <p className="page-subtitle">The account must be in your name. Use fictional details only.</p>
      <label className="form-field">
        Bank
        <select value={form.bank} onChange={(e) => setField("bank", e.target.value)}>
          <option value="">Choose a bank</option>
          {BANKS.map((bank) => (
            <option key={bank}>{bank}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Account type
        <select
          value={form.type}
          onChange={(e) => setField("type", e.target.value === "Checking" ? "Checking" : "Savings")}
        >
          <option>Savings</option>
          <option>Checking</option>
        </select>
      </label>
      <label className="form-field">
        Account number
        <input
          inputMode="numeric"
          autoComplete="off"
          value={form.account}
          onChange={(e) => setField("account", e.target.value.replace(/\s/g, ""))}
        />
      </label>
      <fieldset className="mt-6 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">Separate consent</legend>
        <label className="flex items-start gap-3 font-normal">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setField("consent", e.target.checked)}
          />
          <span>
            I agree that {CONSENT_PURPOSE.charAt(0).toLowerCase() + CONSENT_PURPOSE.slice(1)}
          </span>
        </label>
      </fieldset>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
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
