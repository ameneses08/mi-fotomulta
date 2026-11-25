import { CONSENT_PURPOSE, type BankForm, type BankFormErrors } from "@/lib/refund";
import { FieldError } from "./FieldError";

const BANKS = ["Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Other"];

/** Links a field to its error message for screen readers. */
function invalidProps(id: string, message: string | undefined) {
  return message ? { "aria-invalid": true, "aria-describedby": id } : {};
}

interface BankFieldsProps {
  initial: BankForm;
  errors: BankFormErrors;
  onFieldChange: <K extends keyof BankForm>(field: K, value: BankForm[K]) => void;
}

export function BankFields({ initial, errors, onFieldChange }: BankFieldsProps) {
  return (
    <>
      <div className="form-field">
        <label htmlFor="bank">Bank</label>
        <select
          id="bank"
          name="bank"
          defaultValue={initial.bank}
          onChange={(e) => onFieldChange("bank", e.target.value)}
          {...invalidProps("bank-error", errors.bank)}
        >
          <option value="">Choose a bank</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        <FieldError id="bank-error" message={errors.bank} />
      </div>
      <div className="form-field">
        <label htmlFor="account-type">Account type</label>
        <select
          id="account-type"
          name="type"
          defaultValue={initial.type}
          onChange={(e) =>
            onFieldChange("type", e.target.value === "Checking" ? "Checking" : "Savings")
          }
        >
          <option value="Savings">Savings</option>
          <option value="Checking">Checking</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="account">Account number</label>
        <input
          id="account"
          name="account"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={initial.account}
          onChange={(e) => onFieldChange("account", e.target.value)}
          {...invalidProps("account-error", errors.account)}
        />
        <FieldError id="account-error" message={errors.account} />
      </div>
      <fieldset className="mt-6 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">Separate consent</legend>
        <label className="flex items-start gap-3 font-normal">
          <input
            type="checkbox"
            name="consent"
            defaultChecked={initial.consent}
            onChange={(e) => onFieldChange("consent", e.target.checked)}
            {...invalidProps("consent-error", errors.consent)}
          />
          <span>
            I agree that {CONSENT_PURPOSE.charAt(0).toLowerCase() + CONSENT_PURPOSE.slice(1)}
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />
      </fieldset>
    </>
  );
}
