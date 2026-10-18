import { describe, expect, it } from "vitest";
import { formatDate } from "~/src/utils/date";

describe("formatDate", () => {
  it("formats a date using the expected long US format", () => {
    expect(formatDate("2024-06-12T12:00:00")).toBe("June 12, 2024");
  });

  it("returns an empty string for an empty date", () => {
    expect(formatDate("")).toBe("");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });

  it("keeps date-only values on the same calendar day", () => {
    expect(formatDate("2015-01-03")).toBe("January 3, 2015");
  });
});
