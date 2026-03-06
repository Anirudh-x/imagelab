import { useEffect, useRef } from "react";
import type { ImageStats } from "../../types/pipeline";

interface HistogramCanvasProps {
  stats: ImageStats;
  width?: number;
  height?: number;
}

// OpenCV returns histograms in BGR order; remap to displayable RGB colours.
// Index 3 covers the alpha channel in BGRA images.
const CHANNEL_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#a855f7"]; // B → blue, G → green, R → red, A → purple
const GRAY_COLOR = "#6b7280";

export default function HistogramCanvas({ stats, width = 240, height = 80 }: HistogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    const histograms = stats.histograms;
    if (!histograms || histograms.length === 0) return;

    // Find global max across all channels for normalisation.
    // Avoid spreading a potentially large array into a variadic call (stack risk).
    let globalMax = 0;
    for (const hist of histograms) {
      for (const count of hist) {
        if (count > globalMax) globalMax = count;
      }
    }
    if (globalMax === 0) return;

    const barWidth = width / 256;
    const isGray = histograms.length === 1;

    histograms.forEach((hist, channelIdx) => {
      ctx.globalAlpha = isGray ? 0.9 : 0.55;
      ctx.fillStyle = isGray ? GRAY_COLOR : CHANNEL_COLORS[channelIdx] ?? "#6b7280";
      hist.forEach((count, bin) => {
        const barHeight = (count / globalMax) * height;
        ctx.fillRect(bin * barWidth, height - barHeight, Math.max(barWidth, 1), barHeight);
      });
    });

    ctx.globalAlpha = 1;
  }, [stats, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-gray-200"
      title={
        stats.channels === 1
          ? "Grayscale histogram"
          : stats.channels === 4
            ? "BGRA channel histograms (B=blue, G=green, R=red, A=purple)"
            : "BGR channel histograms (B=blue, G=green, R=red)"
      }
    />
  );
}
