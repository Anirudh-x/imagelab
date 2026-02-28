from pydantic import BaseModel


class PipelineStep(BaseModel):
    type: str
    params: dict = {}


class PipelineRequest(BaseModel):
    image: str
    image_format: str = "png"
    pipeline: list[PipelineStep]
    include_intermediates: bool = False


class ImageStats(BaseModel):
    """Per-channel statistics for a single pipeline step output."""
    width: int
    height: int
    channels: int
    dtype: str
    min: float
    max: float
    mean: float
    # Per-channel histograms: list of 256-bucket counts per channel (B/G/R in OpenCV order for multi-channel images, or single-channel)
    histograms: list[list[int]]


class StepResult(BaseModel):
    """Result of a single pipeline step including the image and statistics."""
    step: int
    operator: str
    image: str
    image_format: str
    stats: ImageStats


class PipelineResponse(BaseModel):
    success: bool
    image: str | None = None
    image_format: str | None = None
    error: str | None = None
    step: int | None = None
    intermediates: list[StepResult] | None = None
