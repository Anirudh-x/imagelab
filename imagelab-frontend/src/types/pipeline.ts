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
  min: number;
  max: number;
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

export interface PipelineResponse {
  success: boolean;
  image?: string;
  image_format?: string;
  error?: string;
  step?: number;
  intermediates?: StepResult[];
}
