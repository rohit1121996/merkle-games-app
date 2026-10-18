import { afterEach, vi } from "vitest";

vi.stubGlobal(
  "defineEventHandler",
  <Handler>(handler: Handler) => handler,
);
vi.stubGlobal(
  "defineCachedEventHandler",
  <Handler>(handler: Handler) => handler,
);

afterEach(() => {
  vi.unstubAllGlobals();
});
