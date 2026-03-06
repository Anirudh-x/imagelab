import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useModKey } from "./useModKey";

describe("useModKey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "Ctrl+" on Windows', () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform: "Win32", userAgentData: undefined },
      configurable: true,
    });
    const { result } = renderHook(() => useModKey());
    expect(result.current).toBe("Ctrl+");
  });

  it('returns "Ctrl+" on Linux', () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform: "Linux x86_64", userAgentData: undefined },
      configurable: true,
    });
    const { result } = renderHook(() => useModKey());
    expect(result.current).toBe("Ctrl+");
  });

  it('returns "⌘" on macOS via modern userAgentData.platform', () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform: "MacIntel", userAgentData: { platform: "macOS" } },
      configurable: true,
    });
    const { result } = renderHook(() => useModKey());
    expect(result.current).toBe("⌘");
  });

  it('returns "⌘" on macOS via legacy navigator.platform fallback', () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform: "MacIntel", userAgentData: undefined },
      configurable: true,
    });
    const { result } = renderHook(() => useModKey());
    expect(result.current).toBe("⌘");
  });

  it('returns "Ctrl+" when navigator is undefined (SSR)', () => {
    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => useModKey());
    expect(result.current).toBe("Ctrl+");
  });
});
