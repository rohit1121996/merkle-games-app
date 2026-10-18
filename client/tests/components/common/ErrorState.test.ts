// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorState from "~/src/components/common/ErrorState.vue";

describe("ErrorState", () => {
  it("renders the provided error message", () => {
    const wrapper = mount(ErrorState, {
      props: { message: "Something went wrong." },
    });
    expect(wrapper.text()).toContain("Something went wrong.");
  });

  it("renders the default title when none is provided", () => {
    const wrapper = mount(ErrorState, {
      props: { message: "Error" },
    });
    expect(wrapper.text()).toContain("Unable to load games");
  });

  it("renders a custom title when provided", () => {
    const wrapper = mount(ErrorState, {
      props: { message: "Error", title: "Custom Error Title" },
    });
    expect(wrapper.text()).toContain("Custom Error Title");
  });

  it("has role='alert' so screen readers announce it immediately", () => {
    const wrapper = mount(ErrorState, { props: { message: "Error" } });
    expect(wrapper.find("[role='alert']").exists()).toBe(true);
  });

  it("does not render a retry button when no retry prop is provided", () => {
    const wrapper = mount(ErrorState, { props: { message: "Error" } });
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("renders a retry button when the retry prop is provided", () => {
    const retry = vi.fn();
    const wrapper = mount(ErrorState, { props: { message: "Error", retry } });
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("calls the retry function when the retry button is clicked", async () => {
    const retry = vi.fn();
    const wrapper = mount(ErrorState, { props: { message: "Error", retry } });
    await wrapper.find("button").trigger("click");
    expect(retry).toHaveBeenCalledOnce();
  });

  it("renders the title as h1 when headingLevel='h1'", () => {
    const wrapper = mount(ErrorState, {
      props: { message: "Error", headingLevel: "h1" },
    });
    expect(wrapper.find("h1").exists()).toBe(true);
    expect(wrapper.find("h2").exists()).toBe(false);
  });

  it("defaults to rendering the title as h2", () => {
    const wrapper = mount(ErrorState, { props: { message: "Error" } });
    expect(wrapper.find("h2").exists()).toBe(true);
  });
});
