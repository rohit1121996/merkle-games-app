// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import GameImage from "~/src/components/common/GameImage.vue";

describe("GameImage", () => {
  it("renders an <img> with the supplied src and alt", () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Game cover" },
    });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("/img/game.jpg");
    expect(img.attributes("alt")).toBe("Game cover");
  });

  it("uses lazy loading by default", () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Game cover" },
    });
    expect(wrapper.find("img").attributes("loading")).toBe("lazy");
  });

  it("uses eager loading when priority=true", () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Game cover", priority: true },
    });
    expect(wrapper.find("img").attributes("loading")).toBe("eager");
  });

  it("shows the fallback div and hides the img on image error", async () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/broken.jpg", alt: "Broken image" },
    });

    const img = wrapper.find("img");
    await img.trigger("error");
    await flushPromises();

    expect(wrapper.find(".fallback-image").exists()).toBe(true);
    // img is hidden with v-show (display:none in DOM) not removed
    expect(img.isVisible()).toBe(false);
  });

  it("fallback message contains the alt text", async () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/broken.jpg", alt: "My Game cover" },
    });
    await wrapper.find("img").trigger("error");
    await flushPromises();

    expect(wrapper.find(".fallback-message").text()).toContain("My Game cover");
  });

  it("shows 'Image unavailable' in fallback when no alt text is provided", async () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/broken.jpg", alt: "" },
    });
    await wrapper.find("img").trigger("error");
    await flushPromises();

    expect(wrapper.find(".fallback-message").text()).toContain(
      "Image unavailable",
    );
  });

  it("does not show the fallback when the image loads successfully", async () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Good image" },
    });
    await wrapper.find("img").trigger("load");
    await flushPromises();

    expect(wrapper.find(".fallback-image").exists()).toBe(false);
  });

  it("adds the is-loading class before the image resolves", () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Game" },
    });
    expect(wrapper.find(".game-image-wrapper").classes()).toContain("is-loading");
  });

  it("removes the is-loading class after the image loads", async () => {
    const wrapper = mount(GameImage, {
      props: { src: "/img/game.jpg", alt: "Game" },
    });
    await wrapper.find("img").trigger("load");
    await flushPromises();

    expect(wrapper.find(".game-image-wrapper").classes()).not.toContain(
      "is-loading",
    );
  });
});
