import { describe, expect, it } from "vitest";
import { affectedFines, authorisationRange, cameraStatus } from "@/lib/cameras";
import { makeFine } from "@/test/fixtures";

const expired = {
  id: "CAM-E",
  location: "",
  authorisedFrom: "2024-01-01",
  authorisedUntil: "2026-09-30",
};
const never = { id: "CAM-N", location: "" };
const valid = { id: "CAM-V", location: "", authorisedFrom: "2024-01-01" };

describe("cameras", () => {
  it("derives Authorised, Expired and Unauthorised", () => {
    expect(cameraStatus(valid, "2026-11-25")).toBe("Authorised");
    expect(cameraStatus(expired, "2026-11-25")).toBe("Expired");
    expect(cameraStatus(expired, "2026-06-01")).toBe("Authorised");
    expect(cameraStatus(never, "2026-11-25")).toBe("Unauthorised");
  });

  it("describes the authorisation range", () => {
    expect(authorisationRange(expired)).toBe("01 Jan 2024 – 30 Sep 2026");
    expect(authorisationRange(valid)).toBe("01 Jan 2024 – no end date");
    expect(authorisationRange(never)).toBe("No ANSV authorisation on record");
  });

  it("lists fines recorded outside the authorisation", () => {
    const fines = [
      makeFine({ id: "F-a", cameraId: "CAM-E", infractionDate: "2026-10-10" }),
      makeFine({ id: "F-b", cameraId: "CAM-E", infractionDate: "2026-05-10" }),
    ];
    expect(affectedFines(expired, fines).map((f) => f.id)).toEqual(["F-a"]);
  });
});
