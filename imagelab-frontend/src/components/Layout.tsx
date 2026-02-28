import { useState } from "react";
import { useBlocklyWorkspace } from "../hooks/useBlocklyWorkspace";
import Navbar from "./Navbar";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar/Sidebar";
import PreviewPane from "./Preview/PreviewPane";
import StepPreviewList from "./Preview/StepPreviewList";
import InfoPane from "./InfoPane";
import { ErrorBoundary } from "./ErrorBoundary";
import { usePipelineStore } from "../store/pipelineStore";

export default function Layout() {
  const { containerRef, workspace } = useBlocklyWorkspace();
  const [resetKey, setResetKey] = useState(0);
  const showStepPreviews = usePipelineStore((s) => s.showStepPreviews);

  const handleEditorReset = () => {
    setResetKey((prev) => prev + 1);
  };

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
              <div className="w-64 flex-shrink-0 h-full bg-white border-l border-gray-200 flex flex-col">
                <div className="px-3 py-1.5 border-b border-gray-200 flex-shrink-0">
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
