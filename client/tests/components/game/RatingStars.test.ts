// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RatingStars from "~/src/components/game/RatingStars.vue";
import { MAX_GAME_RATING } from "~/src/utils/rating";

describe("RatingStars", () => {
  it(`renders exactly ${MAX_GAME_RATING} star elements`, () => {
    const wrapper = mount(RatingStars, { props: { rating: 5 } });
    expect(wrapper.findAll(".star")).toHaveLength(MAX_GAME_RATING);
  });

  it("is aria-hidden to avoid duplicate readout (parent provides label)", () => {
    const wrapper = mount(RatingStars, { props: { rating: 5 } });
    expect(wrapper.find(".rating-stars").attributes("aria-hidden")).toBe("true");
  });

  it("renders a full fill on the first star for rating=10", () => {
    const wrapper = mount(RatingStars, { props: { rating: 10 } });
    const firstFill = wrapper.find(".star-fill");
    expect(firstFill.attributes("style")).toContain("width: 100%");
  });

  it("renders zero fill on all stars for rating=0", () => {
    const wrapper = mount(RatingStars, { props: { rating: 0 } });
    const fills = wrapper.findAll(".star-fill");
    fills.forEach((fill) => {
      expect(fill.attributes("style")).toContain("width: 0%");
    });
  });

  it("renders partial fill for a fractional rating", () => {
    // rating=5.5 → star index 5 should be 50% filled
    const wrapper = mount(RatingStars, { props: { rating: 5.5 } });
    const fills = wrapper.findAll(".star-fill");
    expect(fills[5].attributes("style")).toContain("width: 50%");
  });
});
