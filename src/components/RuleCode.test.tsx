import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RULES } from "@/data/ruleCatalogue";
import { RuleCode, RuleText } from "./RuleCode";

describe("RuleCode", () => {
  it("shows the code with its plain-language label", () => {
    render(<RuleCode ruleId="R5" />);
    expect(screen.getByText("R5")).toBeInTheDocument();
    expect(screen.getByText("Notice sent on time")).toBeInTheDocument();
  });

  it("explains the rule in a tooltip on keyboard focus", async () => {
    render(<RuleCode ruleId="R7" />);
    fireEvent.focus(screen.getByText("Not the driver").closest("[tabindex]") as HTMLElement);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(RULES.R7.rule);
  });
});

describe("RuleText", () => {
  it("labels every rule code inside free text", () => {
    render(<RuleText text="R11 and R12 passed automatically" />);
    expect(screen.getByText("Refund eligibility")).toBeInTheDocument();
    expect(screen.getByText("Refund payment check")).toBeInTheDocument();
    expect(screen.getByText(/passed automatically/)).toBeInTheDocument();
  });
});
