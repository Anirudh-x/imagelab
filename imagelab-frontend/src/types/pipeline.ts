export interface PipelineStep {
  type: string;
  params: Record<string, unknown>;
}

export interface PipelineRequest {
  image: string;
  image_format: string;
  pipeline: PipelineStep[];
  include_intermediates?: boolean;
}

export interface ImageStats {
  width: number;
  height: number;
  channels: number;
  dtype: string;
  pixel_min: number;
  pixel_max: number;
  mean: number;
  /** 256-bucket histograms per channel (BGR order from OpenCV, or single for grayscale) */
  histograms: number[][];
}

export interface StepResult {
  step: number;
  operator: string;
  image: string;
  image_format: string;
  stats: ImageStats;
}

export interface StepTiming {
  step: number;
  operator_type: string;
  duration_ms: number;
}

export interface PipelineTimings {
  total_ms: number;
  steps: StepTiming[];
}

export interface PipelineResponse {
  success: boolean;
  image?: string;
  image_format?: string;
  error?: string;
  step?: number;
  intermediates?: StepResult[];
  timings?: PipelineTimings;
}
