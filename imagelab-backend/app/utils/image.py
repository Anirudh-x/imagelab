import base64

import cv2
import numpy as np

from app.models.pipeline import ImageStats


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


def compute_image_stats(image: np.ndarray) -> ImageStats:
    """Compute statistics and per-channel histograms for a numpy image array."""
    float_img = image.astype(np.float32)

    if image.ndim == 2:
        # Grayscale
        height, width = image.shape
        channels = 1
        safe_img = np.clip(image, 0, 255).astype(np.uint8)
        hist = cv2.calcHist([safe_img], [0], None, [256], [0, 256])
        histograms = [hist[:, 0].astype(int).tolist()]
    else:
        height, width = image.shape[:2]
        channels = image.shape[2]
        safe_img = np.clip(image, 0, 255).astype(np.uint8)
        histograms = []
        num_channels = min(channels, 3)  # Cap at RGB
        for c in range(num_channels):
            hist = cv2.calcHist([safe_img], [c], None, [256], [0, 256])
            histograms.append(hist[:, 0].astype(int).tolist())

    return ImageStats(
        width=width,
        height=height,
        channels=channels,
        dtype=str(image.dtype),
        min=float(float_img.min()),
        max=float(float_img.max()),
        mean=round(float(float_img.mean()), 2),
        histograms=histograms,
    )
