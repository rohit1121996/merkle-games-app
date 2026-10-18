// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LoadingState from "~/src/components/common/LoadingState.vue";

describe("LoadingState", () => {
  it("renders the default loading message", () => {
    const wrapper = mount(LoadingState);
    expect(wrapper.text()).toContain("Loading...");
  });

  it("renders a custom message when provided", () => {
    const wrapper = mount(LoadingState, {
      props: { message: "Fetching games..." },
    });
    expect(wrapper.text()).toContain("Fetching games...");
  });

  it("has role='status' for screen reader announcements", () => {
    const wrapper = mount(LoadingState);
    expect(wrapper.find("[role='status']").exists()).toBe(true);
  });

  it("has aria-live='polite' on the container", () => {
    const wrapper = mount(LoadingState);
    const el = wrapper.find("[role='status']").element as HTMLElement;
    expect(el.getAttribute("aria-live")).toBe("polite");
  });

  it("marks the spinner as aria-hidden to prevent redundant announcements", () => {
    const wrapper = mount(LoadingState);
    const spinner = wrapper.find(".spinner");
    expect(spinner.attributes("aria-hidden")).toBe("true");
  });
});
