/**
 * Returns the platform-appropriate modifier key label for keyboard shortcut hints.
 * Uses the modern `navigator.userAgentData.platform` API with a fallback to the
 * deprecated `navigator.platform` for broader browser compatibility.
 *
 * Returns "⌘" on macOS and "Ctrl+" on Windows/Linux.
 */
export function useModKey(): string {
  if (typeof navigator === "undefined") return "Ctrl+";

  const platform = (
    (navigator as Navigator & { userAgentData?: { platform: string } })
      .userAgentData?.platform ?? navigator.platform
  ).toLowerCase();

  return platform.startsWith("mac") ? "⌘" : "Ctrl+";
}
