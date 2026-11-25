import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntakeBanner } from "./IntakeBanner";

describe("IntakeBanner", () => {
  it("uses non-overlapping categories", () => {
    render(<IntakeBanner summary={{ analysed: 12, clear: 7, flagged: 5, grouped: 5 }} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "AI intake today: 12 filings analysed · 7 clear · 5 with flags to review · 5 in groups",
    );
  });
});
