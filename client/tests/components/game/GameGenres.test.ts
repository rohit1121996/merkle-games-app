// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GameGenres from "~/src/components/game/GameGenres.vue";

describe("GameGenres", () => {
  it("renders each genre as a list item", () => {
    const wrapper = mount(GameGenres, {
      props: { genres: ["RPG", "Adventure", "Puzzle"] },
    });
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(3);
    expect(items[0].text()).toBe("RPG");
    expect(items[1].text()).toBe("Adventure");
    expect(items[2].text()).toBe("Puzzle");
  });

  it("renders nothing when genres list is empty", () => {
    const wrapper = mount(GameGenres, { props: { genres: [] } });
    expect(wrapper.findAll("li")).toHaveLength(0);
  });

  it("renders a <ul> with aria-label for accessibility", () => {
    const wrapper = mount(GameGenres, { props: { genres: ["Action"] } });
    const ul = wrapper.find("ul");
    expect(ul.exists()).toBe(true);
    expect(ul.attributes("aria-label")).toBeTruthy();
  });
});
