// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EmptyState from "~/src/components/common/EmptyState.vue";

describe("EmptyState", () => {
  it("renders the provided message", () => {
    const wrapper = mount(EmptyState, {
      props: { message: "No games found." },
    });
    expect(wrapper.text()).toContain("No games found.");
  });

  it("renders a different message when passed as prop", () => {
    const wrapper = mount(EmptyState, {
      props: { message: "Nothing to show here." },
    });
    expect(wrapper.text()).toContain("Nothing to show here.");
  });

  it("has aria-live='polite' so screen readers announce the empty state", () => {
    const wrapper = mount(EmptyState, { props: { message: "No games found." } });
    expect(wrapper.find("[aria-live='polite']").exists()).toBe(true);
  });
});
