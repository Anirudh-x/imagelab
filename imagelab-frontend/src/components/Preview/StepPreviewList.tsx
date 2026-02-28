import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { usePipelineStore } from "../../store/pipelineStore";
import HistogramCanvas from "./HistogramCanvas";
import type { StepResult } from "../../types/pipeline";

/** Convert an internal operator type string like "blurring_applygaussianblur" to
 *  a simpler display label by dropping the category prefix (e.g. "applygaussianblur"). */
function operatorLabel(type: string): string {
  const underscoreIndex = type.indexOf("_");
  if (underscoreIndex === -1) {
    return type;
  }
  const name = type.slice(underscoreIndex + 1).trim();
  return name || type;
}
}

/** One card in the step list. */
function StepCard({
  result,
  index,
  isSelected,
  imageFormat,
  onSelect,
}: {
  result: StepResult;
  index: number;
  isSelected: boolean;
  imageFormat: string;
  onSelect: () => void;
}) {
  const { stats } = result;

  return (
    <button
      type="button"
      className={`w-full text-left border rounded-lg overflow-hidden cursor-pointer transition-all ${isSelected
          ? "border-indigo-400 ring-1 ring-indigo-300 bg-indigo-50"
          : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
      onClick={onSelect}
    >
      {/* Header row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-100">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <span className="text-xs font-medium text-gray-700 truncate flex-1">
          {operatorLabel(result.operator)}
        </span>
        {isSelected ? (
          <ChevronDown size={12} className="text-indigo-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
        )}
      </div>

      {/* Thumbnail */}
      <div className="flex justify-center bg-gray-50 p-1.5">
        <img
          src={`data:image/${imageFormat};base64,${result.image}`}
          alt={`Step ${index + 1} — ${result.operator}`}
          className="max-h-24 max-w-full object-contain rounded"
          loading="lazy"
        />
      </div>

      {/* Expanded details */}
      {isSelected && (
        <div className="px-2 py-2 space-y-2 border-t border-indigo-100 bg-white">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
            <span>Size</span>
            <span className="text-gray-700 font-medium">
              {stats.width} × {stats.height}
            </span>
            <span>Channels</span>
            <span className="text-gray-700 font-medium">{stats.channels}</span>
            <span>Dtype</span>
            <span className="text-gray-700 font-medium">{stats.dtype}</span>
            <span>Min / Max</span>
            <span className="text-gray-700 font-medium">
              {stats.min.toFixed(0)} / {stats.max.toFixed(0)}
            </span>
            <span>Mean</span>
            <span className="text-gray-700 font-medium">{stats.mean}</span>
          </div>

          {/* Histogram */}
          <div>
            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
              {stats.channels === 1
                ? "Grayscale"
                : stats.channels === 3
                ? "BGR"
                : stats.channels === 4
                ? "BGRA"
                : `${stats.channels}-channel`} Histogram
            </p>
            <HistogramCanvas stats={stats} width={220} height={60} />
          </div>
        </div>
      )}
    </button>
  );
}

/** The full scrollable step-preview side panel. */
export default function StepPreviewList() {
  const { intermediates, selectedStepIndex, imageFormat, setSelectedStepIndex } =
    usePipelineStore();

  if (intermediates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-4">
        <Layers size={28} className="opacity-40" />
        <p className="text-xs text-center">
          Enable <span className="font-semibold">Step Preview</span> and run the pipeline to see
          per-step results here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2 gap-2">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide px-1">
        {intermediates.length} step{intermediates.length !== 1 ? "s" : ""} — click a card to
        inspect
      </p>
      {intermediates.map((result: StepResult, i: number) => (
        <StepCard
          key={`${result.step}-${result.operator}`}
          result={result}
          index={i}
          isSelected={selectedStepIndex === i}
          imageFormat={imageFormat}
          onSelect={() => setSelectedStepIndex(selectedStepIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
