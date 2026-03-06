import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Toolbar from "./Toolbar";

// Mock Blockly — not needed for tooltip/aria-label tests
vi.mock("blockly", () => ({
  WorkspaceSvg: class {},
  BlockSvg: class {},
  common: { getSelected: vi.fn() },
}));

// Mock the pipeline store with sensible defaults
vi.mock("../store/pipelineStore", () => ({
  usePipelineStore: vi.fn().mockReturnValue({
    originalImage: "data:image/png;base64,abc",
    imageFormat: "png",
    processedImage: null,
    isExecuting: false,
    setProcessedImage: vi.fn(),
    setExecuting: vi.fn(),
    setError: vi.fn(),
    reset: vi.fn(),
    blockCount: 0,
    uniqueBlockTypes: 0,
    categoryCounts: {},
    complexity: "Low",
  }),
}));

vi.mock("../api/pipeline", () => ({ executePipeline: vi.fn() }));
vi.mock("../hooks/usePipeline", () => ({ extractPipeline: vi.fn().mockReturnValue([]) }));
vi.mock("../hooks/useKeyboardShortcuts", () => ({ useKeyboardShortcuts: vi.fn() }));

// Mock useModKey to return a known value for deterministic assertions
vi.mock("../hooks/useModKey", () => ({ useModKey: vi.fn().mockReturnValue("Ctrl+") }));

describe("Toolbar — Run Pipeline button accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes the keyboard shortcut in the title attribute", () => {
    render(<Toolbar workspace={null} />);
    const runBtn = screen.getByRole("button", { name: /run pipeline/i });
    expect(runBtn.title).toMatch(/Run Pipeline \((.+)Enter\)/);
  });

  it("includes the keyboard shortcut in the aria-label attribute", () => {
    render(<Toolbar workspace={null} />);
    const runBtn = screen.getByRole("button", { name: /run pipeline/i });
    expect(runBtn.getAttribute("aria-label")).toMatch(/Run Pipeline \((.+)Enter\)/);
  });

  it("title and aria-label are identical for the Run Pipeline button", () => {
    render(<Toolbar workspace={null} />);
    const runBtn = screen.getByRole("button", { name: /run pipeline/i });
    expect(runBtn.title).toBe(runBtn.getAttribute("aria-label"));
  });

  it("Download button has aria-label with shortcut hint", () => {
    render(<Toolbar workspace={null} />);
    const downloadBtn = screen.getByRole("button", { name: /download/i });
    expect(downloadBtn.getAttribute("aria-label")).toMatch(/Download \((.+)S\)/);
  });

  it("Undo button has aria-label with shortcut hint", () => {
    render(<Toolbar workspace={null} />);
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn.getAttribute("aria-label")).toMatch(/Undo \((.+)Z\)/);
  });

  it("Redo button has aria-label with shortcut hint", () => {
    render(<Toolbar workspace={null} />);
    const redoBtn = screen.getByRole("button", { name: /redo/i });
    expect(redoBtn.getAttribute("aria-label")).toMatch(/Redo \((.+)(Y|Z)/);
  });
});
