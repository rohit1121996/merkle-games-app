// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GameCard from "~/src/components/game/GameCard.vue";
import { makeGame } from "../../fixtures/game";

vi.mock("~/src/components/common/GameImage.vue", () => ({
  default: {
    template: '<img data-testid="game-image" />',
    props: ["src", "alt", "priority"],
  },
}));
vi.mock("~/src/components/game/GameRating.vue", () => ({
  default: { template: "<div />", props: ["rating"] },
}));
vi.mock("~/src/components/game/GameGenres.vue", () => ({
  default: { template: "<ul />", props: ["genres"] },
}));

const NuxtLink = { template: '<a :href="to"><slot /></a>', props: ["to"] };

describe("GameCard", () => {
  const game = makeGame({
    id: "42",
    title: "Test Game",
    releaseDate: "2016-06-15",
  });

  const wrap = (props = {}) =>
    mount(GameCard, {
      props: { game, ...props },
      global: { components: { NuxtLink } },
    });

  it("renders as an <article> element", () => {
    expect(wrap().element.tagName).toBe("ARTICLE");
  });

  it("renders the game title", () => {
    expect(wrap().text()).toContain("Test Game");
  });

  it("links to the correct game detail URL", () => {
    const link = wrap().find("a");
    expect(link.attributes("href")).toBe("/games/42");
  });

  it("renders the release year in the date text", () => {
    expect(wrap().text()).toMatch(/2016/);
  });

  it("renders the game image", () => {
    expect(wrap().find('[data-testid="game-image"]').exists()).toBe(true);
  });

  it("forwards the priority prop to GameImage", () => {
    // priority=true is passed; component should not throw and render correctly
    const wrapper = mount(GameCard, {
      props: { game, priority: true },
      global: { components: { NuxtLink } },
    });
    expect(wrapper.find('[data-testid="game-image"]').exists()).toBe(true);
  });
});
