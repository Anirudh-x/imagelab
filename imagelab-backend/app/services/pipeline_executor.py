import logging

import cv2

from app.models.pipeline import ImageStats, PipelineRequest, PipelineResponse, StepResult
from app.operators.registry import get_operator
from app.utils.image import compute_image_stats, decode_base64_image, encode_image_base64

logger = logging.getLogger(__name__)

NOOP_TYPES = {"basic_readimage", "basic_writeimage", "border_for_all", "border_each_side"}

# Maximum edge length (pixels) for intermediate thumbnail encoding.
_THUMBNAIL_MAX = 256


def _thumbnail(image) -> object:
    """Return a copy of *image* scaled so its longest edge is ≤ _THUMBNAIL_MAX.

    The original image is returned unchanged if it already fits within the
    limit, avoiding an unnecessary copy.
    """
    h, w = image.shape[:2]
    if h <= _THUMBNAIL_MAX and w <= _THUMBNAIL_MAX:
        return image
    scale = _THUMBNAIL_MAX / max(h, w)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def execute_pipeline(request: PipelineRequest) -> PipelineResponse:
    try:
        image = decode_base64_image(request.image)
    except Exception as e:
        return PipelineResponse(success=False, error=f"Failed to decode image: {e}", step=0)

    intermediates: list[StepResult] = []

    for i, step in enumerate(request.pipeline):
        if step.type in NOOP_TYPES:
            continue

        operator_cls = get_operator(step.type)
        if operator_cls is None:
            return PipelineResponse(
                success=False,
                error=f"Unknown operator '{step.type}' at step {i}",
                step=i,
            )

        try:
            operator = operator_cls(step.params)
            image = operator.compute(image)
        except Exception as e:
            return PipelineResponse(
                success=False,
                error=f"Error in step {i} ({step.type}): {type(e).__name__}: {e}",
                step=i,
            )

        if request.include_intermediates:
            try:
                thumb = _thumbnail(image)
                encoded = encode_image_base64(thumb, request.image_format)
                stats = ImageStats(**compute_image_stats(image))
                intermediates.append(
                    StepResult(
                        step=i,
                        operator=step.type,
                        image=encoded,
                        image_format=request.image_format,
                        stats=stats,
                    )
                )
            except Exception as capture_err:
                # Non-fatal: log and skip this step's intermediate instead of silently dropping it
                logger.warning(
                    "Failed to capture intermediate for step %d (%s): %s: %s",
                    i, step.type, type(capture_err).__name__, capture_err
                )

    try:
        encoded = encode_image_base64(image, request.image_format)
    except Exception as e:
        error_msg = f"Failed to encode result: {type(e).__name__}: {e}"
        return PipelineResponse(success=False, error=error_msg, step=len(request.pipeline))

    return PipelineResponse(
        success=True,
        image=encoded,
        image_format=request.image_format,
        intermediates=intermediates if request.include_intermediates else None,
    )
