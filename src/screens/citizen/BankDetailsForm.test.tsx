import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { BULK_ACT_ID, HERO_REFUND_ID } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import { BankDetailsForm } from "./BankDetailsForm";

const heroRefund = () => {
  const refund = useAppStore.getState().refunds.find((r) => r.id === HERO_REFUND_ID);
  if (!refund) throw new Error("R-1044 missing");
  return refund;
};

function renderEligibleForm() {
  useAppStore.getState().resetDemo();
  useAppStore.getState().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
  return render(<BankDetailsForm refund={heroRefund()} />);
}

const bankSelect = () => screen.getByLabelText("Bank") as HTMLSelectElement;
const accountInput = () => screen.getByLabelText("Account number") as HTMLInputElement;
const submit = () => fireEvent.click(screen.getByRole("button", { name: /confirm bank account/i }));

beforeEach(() => sessionStorage.clear());

describe("BankDetailsForm", () => {
  it("prefills a fictional Bancolombia savings account so only consent is needed", () => {
    renderEligibleForm();
    expect(bankSelect().value).toBe("Bancolombia");
    expect((screen.getByLabelText("Account type") as HTMLSelectElement).value).toBe("Savings");
    expect(accountInput().value).toMatch(/^\d{6,20}$/);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it("submits the values shown in the fields even if no change event reached the store", () => {
    renderEligibleForm();
    // Browser autofill or form restore sets values without React change events.
    bankSelect().value = "Davivienda";
    accountInput().value = "1234-5678 90";
    fireEvent.click(screen.getByRole("checkbox"));
    submit();
    expect(heroRefund().status).toBe("Verifying payment details");
    expect(heroRefund().bankAccount).toMatchObject({ bank: "Davivienda", last4: "7890" });
  });

  it("shows the error under the field that is wrong, not one combined message", () => {
    renderEligibleForm();
    fireEvent.change(bankSelect(), { target: { value: "" } });
    fireEvent.click(screen.getByRole("checkbox"));
    submit();
    expect(bankSelect()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Choose a bank.")).toBeInTheDocument();
    expect(accountInput()).not.toHaveAttribute("aria-invalid", "true");
    expect(heroRefund().status).toBe("Eligible");
  });

  it("flags only the consent when it is missing", () => {
    renderEligibleForm();
    submit();
    expect(screen.getByText(/separate consent is required/i)).toBeInTheDocument();
    expect(bankSelect()).not.toHaveAttribute("aria-invalid", "true");
  });
});
