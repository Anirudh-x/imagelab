import { create } from "zustand";
import * as Blockly from "blockly";
import { categories } from "../blocks/categories";
import type { PipelineTimings, StepResult } from "../types/pipeline";

interface PipelineState {
  originalImage: string | null;
  imageFormat: string;
  processedImage: string | null;
  isExecuting: boolean;
  error: string | null;
  errorStep: number | null;
  selectedBlockType: string | null;
  selectedBlockTooltip: string | null;
  // Step-by-step preview state
  intermediates: StepResult[];
  showStepPreviews: boolean;
  selectedStepIndex: number | null;
  setIntermediates: (steps: StepResult[]) => void;
  setShowStepPreviews: (show: boolean) => void;
  setSelectedStepIndex: (index: number | null) => void;
  timings: PipelineTimings | null;

  // Statistics
  blockCount: number;
  uniqueBlockTypes: number;
  categoryCounts: Record<string, number>;
  complexity: "Low" | "Medium" | "High";
  setOriginalImage: (image: string, format: string) => void;
  setProcessedImage: (image: string | null) => void;
  setExecuting: (executing: boolean) => void;
  setError: (error: string | null, step?: number | null) => void;
  setSelectedBlock: (type: string | null, tooltip: string | null) => void;
  setTiming: (timings: PipelineTimings | null) => void;
  updateBlockStats: (workspace: Blockly.WorkspaceSvg) => void;
  reset: () => void;
  clearImage: () => void;
  _imageResetFn: (() => void) | null;
  registerImageReset: (fn: () => void) => void;
}

function calculateComplexity(blocks: number, unique: number): "Low" | "Medium" | "High" {
  if (blocks === 0) return "Low";
  if (blocks > 10 || unique > 5) return "High";
  if (blocks > 3 || unique > 2) return "Medium";
  return "Low";
}

const INITIAL_STATE = {
  originalImage: null as string | null,
  imageFormat: "png",
  processedImage: null as string | null,
  isExecuting: false,
  error: null as string | null,
  errorStep: null as number | null,
  selectedBlockType: null as string | null,
  selectedBlockTooltip: null as string | null,
  intermediates: [] as StepResult[],
  showStepPreviews: false,
  selectedStepIndex: null as number | null,
  timings: null as PipelineTimings | null,
  blockCount: 0,
  uniqueBlockTypes: 0,
  categoryCounts: {} as Record<string, number>,
  complexity: "Low" as "Low" | "Medium" | "High",
};

const IMAGE_RESET = {
  originalImage: null as string | null,
  processedImage: null as string | null,
  error: null as string | null,
  errorStep: null as number | null,
  intermediates: [] as StepResult[],
  selectedStepIndex: null as number | null,
  timings: null as PipelineTimings | null,
};

export const usePipelineStore = create<PipelineState>((set) => ({
  ...INITIAL_STATE,
  setIntermediates: (steps) => set({ intermediates: steps, selectedStepIndex: null }),
  setShowStepPreviews: (show) => set({ showStepPreviews: show }),
  setSelectedStepIndex: (index) => set({ selectedStepIndex: index }),
  setOriginalImage: (image, format) =>
    set({ ...IMAGE_RESET, originalImage: image, imageFormat: format }),
  setProcessedImage: (image) => set({ processedImage: image, error: null, errorStep: null }),
  setExecuting: (executing) => set({ isExecuting: executing }),
  setError: (error, step = null) => set({ error, errorStep: step }),
  setSelectedBlock: (type, tooltip) =>
    set({ selectedBlockType: type, selectedBlockTooltip: tooltip }),
  setTiming: (timings) => set({ timings }),
  _imageResetFn: null as (() => void) | null,
  registerImageReset: (fn) => set({ _imageResetFn: fn }),
  clearImage: () => {
    const state = usePipelineStore.getState();
    if (state._imageResetFn) state._imageResetFn();
    set({ ...IMAGE_RESET });
  },
  updateBlockStats: (workspace) => {
    const blocks = workspace.getAllBlocks(false);

    const typeToCategory: Record<string, string> = {};
    categories.forEach((cat) => {
      cat.blocks.forEach((b) => {
        typeToCategory[b.type] = cat.name;
      });
    });

    const uniqueTypes = new Set<string>();
    const counts: Record<string, number> = {};

    blocks.forEach((block) => {
      uniqueTypes.add(block.type);
      const cat = typeToCategory[block.type] || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    set({
      blockCount: blocks.length,
      uniqueBlockTypes: uniqueTypes.size,
      categoryCounts: counts,
      complexity: calculateComplexity(blocks.length, uniqueTypes.size),
    });
  },
  reset: () => set({ ...INITIAL_STATE }),
}));
