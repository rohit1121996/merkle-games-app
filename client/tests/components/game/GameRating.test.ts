// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GameRating from "~/src/components/game/GameRating.vue";

vi.mock("~/src/components/game/RatingStars.vue", () => ({
  default: { template: "<span />", props: ["rating"] },
}));

describe("GameRating", () => {
  const rating = { average: 7.5, count: 42 };

  const wrap = () => mount(GameRating, { props: { rating } });

  it("displays the numeric average rating", () => {
    expect(wrap().text()).toContain("7.5");
  });

  it("displays the review count in parentheses", () => {
    expect(wrap().text()).toContain("42");
  });

  it("has role='img' for screen readers", () => {
    const el = wrap().element as HTMLElement;
    expect(el.getAttribute("role")).toBe("img");
  });

  it("has an aria-label that includes average and count", () => {
    const label = (wrap().element as HTMLElement).getAttribute("aria-label") ?? "";
    expect(label).toContain("7.5");
    expect(label).toContain("42");
  });
});
