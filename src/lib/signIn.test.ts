import { describe, expect, it } from "vitest";
import {
  maskDocument,
  normaliseDocument,
  validateCode,
  validateDocument,
  validateStaffLogin,
} from "@/lib/signIn";

describe("mock sign-in validation", () => {
  it("accepts a cédula typed with dots", () => {
    expect(normaliseDocument("1.020.345.678")).toBe("1020345678");
    expect(validateDocument("CC", "1.020.345.678")).toBeNull();
  });

  it("rejects malformed documents per type", () => {
    expect(validateDocument("CC", "12a")).not.toBeNull();
    expect(validateDocument("CE", "12345678")).not.toBeNull();
    expect(validateDocument("PPT", "ab12cd34")).toBeNull();
  });

  it("requires a 6-digit code", () => {
    expect(validateCode("12345")).not.toBeNull();
    expect(validateCode("482915")).toBeNull();
  });

  it("requires a username and a password of 8+ characters", () => {
    expect(validateStaffLogin("", "password1")).not.toBeNull();
    expect(validateStaffLogin("laura.gomez", "short")).not.toBeNull();
    expect(validateStaffLogin("laura.gomez", "demo-pass")).toBeNull();
  });

  it("masks a document", () => {
    expect(maskDocument("1.020.345.678")).toBe("•••• 5678");
  });
});
