import { describe, expect, it } from "vitest";
import { getErrorStatusCode } from "~/utils/error";

describe("getErrorStatusCode", () => {
  it("returns numeric status codes from error objects", () => {
    expect(getErrorStatusCode({ statusCode: 404 })).toBe(404);
  });

  it("returns null for missing, non-numeric, or primitive errors", () => {
    expect(getErrorStatusCode(new Error("failed"))).toBeNull();
    expect(getErrorStatusCode({ statusCode: "404" })).toBeNull();
    expect(getErrorStatusCode(null)).toBeNull();
    expect(getErrorStatusCode("failed")).toBeNull();
  });
});
