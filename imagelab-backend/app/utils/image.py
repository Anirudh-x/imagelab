import base64

import cv2
import numpy as np


def _to_uint8_for_hist(image: np.ndarray) -> np.ndarray:
    """Scale image to uint8 for histogram computation.

    For uint8 images the data is returned unchanged.  For float images the
    pixel values are linearly normalised to [0, 255] so that the full dynamic
    range is visible in the histogram rather than being collapsed into bins 0–1.
    """
    if image.dtype == np.uint8:
        return image
    img_min, img_max = float(image.min()), float(image.max())
    if img_max == img_min:
        return np.zeros_like(image, dtype=np.uint8)
    scaled = (image - img_min) / (img_max - img_min) * 255.0
    return np.clip(scaled, 0, 255).astype(np.uint8)


def decode_base64_image(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError("Could not decode image data")
    return image


def encode_image_base64(image: np.ndarray, fmt: str = "png") -> str:
    success, buf = cv2.imencode(f".{fmt}", image)
    if not success:
        raise ValueError(f"Could not encode image as {fmt}")
    return base64.b64encode(buf).decode("utf-8")


def compute_image_stats(image: np.ndarray) -> dict:
    """Compute statistics and per-channel histograms for a numpy image array.

    Returns a plain dict so that this utility module stays free of upward
    dependencies on application models.  Callers are responsible for wrapping
    the result with the appropriate Pydantic model if needed.

    Histograms are returned in OpenCV channel order (B/G/R[/A] for multi-channel
    images, or a single bucket list for grayscale).  For float images the
    histograms represent normalised pixel intensity (scaled to [0, 255]) rather
    than raw values, so they always span the full 256-bin range.
    """
    hist_img = _to_uint8_for_hist(image)

    if image.ndim == 2:
        # Grayscale
        height, width = image.shape
        channels = 1
        hist = cv2.calcHist([hist_img], [0], None, [256], [0, 256])
        histograms = [hist[:, 0].astype(int).tolist()]
    else:
        height, width = image.shape[:2]
        channels = image.shape[2]
        # Compute histograms for all channels present (supports BGR and BGRA)
        histograms = [
            cv2.calcHist([hist_img], [c], None, [256], [0, 256])[:, 0].astype(int).tolist()
            for c in range(channels)
        ]

    # Compute min/max/mean from the original array so statistics reflect true
    # pixel values, not the normalised uint8 copy used for histograms.
    img_min = float(image.min())
    img_max = float(image.max())
    img_mean = round(float(image.mean(dtype=np.float64)), 2)

    return {
        "width": width,
        "height": height,
        "channels": channels,
        "dtype": str(image.dtype),
        "pixel_min": img_min,
        "pixel_max": img_max,
        "mean": img_mean,
        "histograms": histograms,
    }
