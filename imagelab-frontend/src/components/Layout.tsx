import { useCallback, useRef, useState } from "react";
import { useBlocklyWorkspace } from "../hooks/useBlocklyWorkspace";
import Navbar from "./Navbar";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar/Sidebar";
import PreviewPane from "./Preview/PreviewPane";
import StepPreviewList from "./Preview/StepPreviewList";
import InfoPane from "./InfoPane";
import { ErrorBoundary } from "./ErrorBoundary";
import { usePipelineStore } from "../store/pipelineStore";

const STEP_PANEL_MIN = 180;
const STEP_PANEL_MAX = 480;
const STEP_PANEL_DEFAULT = 256;

export default function Layout() {
  const { containerRef, workspace } = useBlocklyWorkspace();
  const [resetKey, setResetKey] = useState(0);
  const showStepPreviews = usePipelineStore((s) => s.showStepPreviews);
  const [stepPanelWidth, setStepPanelWidth] = useState(STEP_PANEL_DEFAULT);
  const dragStartX = useRef<number | null>(null);
  const dragStartWidth = useRef<number>(STEP_PANEL_DEFAULT);

  const handleEditorReset = () => {
    setResetKey((prev) => prev + 1);
  };

  const onDragHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartX.current = e.clientX;
      dragStartWidth.current = stepPanelWidth;

      const onMouseMove = (ev: MouseEvent) => {
        if (dragStartX.current === null) return;
        // Handle is on the left edge of the panel: dragging left widens it.
        const delta = dragStartX.current - ev.clientX;
        const next = Math.min(STEP_PANEL_MAX, Math.max(STEP_PANEL_MIN, dragStartWidth.current + delta));
        setStepPanelWidth(next);
      };

      const onMouseUp = () => {
        dragStartX.current = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [stepPanelWidth],
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Toolbar workspace={workspace} />
      <div className="flex flex-1 min-h-0">
        <Sidebar workspace={workspace} />
        <ErrorBoundary key={resetKey} onReset={handleEditorReset}>
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 flex flex-col min-w-0">
              <div ref={containerRef} className="flex-1" />
              <InfoPane />
            </div>
            {/* Step-by-step preview panel (shown when toggle is on) */}
            {showStepPreviews && (
              <div
                style={{ width: stepPanelWidth }}
                className="shrink-0 h-full bg-white border-l border-gray-200 flex flex-col relative"
              >
                {/* Drag handle */}
                <div
                  onMouseDown={onDragHandleMouseDown}
                  className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-300 transition-colors z-10"
                  title="Drag to resize"
                />
                <div className="px-3 py-1.5 border-b border-gray-200 shrink-0">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Step-by-Step
                  </h2>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <StepPreviewList />
                </div>
              </div>
            )}
            <PreviewPane />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
