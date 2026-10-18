// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GameReview from "~/src/components/game/GameReview.vue";

vi.mock("~/src/components/game/RatingStars.vue", () => ({
  default: { template: "<span />", props: ["rating"] },
}));

describe("GameReview", () => {
  const review = {
    id: "r1",
    username: "player_one",
    rating: 8,
    text: "Great game with stunning visuals.",
  };

  const wrap = () => mount(GameReview, { props: { review } });

  it("displays the reviewer username", () => {
    expect(wrap().text()).toContain("player_one");
  });

  it("displays the review text", () => {
    expect(wrap().text()).toContain("Great game with stunning visuals.");
  });

  it("renders as an <article> element", () => {
    expect(wrap().element.tagName).toBe("ARTICLE");
  });

  it("has an aria-label on the rating container that includes the numeric score", () => {
    const ratingEl = wrap().find('[role="img"]');
    expect(ratingEl.exists()).toBe(true);
    const label = ratingEl.attributes("aria-label") ?? "";
    expect(label).toContain("8");
  });
});
