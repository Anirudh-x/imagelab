import warnings

import cv2
import numpy as np

from app.operators.base import BaseOperator


class CannyEdgeDetection(BaseOperator):
    def compute(self, image: np.ndarray) -> np.ndarray:
        # Convert thresholds to integers for cv2.Canny which expects int values
        threshold1 = int(float(self.params.get("threshold1", 50)))
        threshold2 = int(float(self.params.get("threshold2", 150)))

        # Validate thresholds at the integer level used by the algorithm
        if threshold1 < 0 or threshold2 < 0:
            raise ValueError("CannyEdgeDetection thresholds must be non-negative.")
        if threshold1 > threshold2:
            raise ValueError("CannyEdgeDetection requires threshold1 to be less than or equal to threshold2.")

        # Warn if thresholds exceed the typical range for uint8 gradient magnitudes
        MAX_THRESHOLD = 255
        if threshold1 > MAX_THRESHOLD or threshold2 > MAX_THRESHOLD:
            warnings.warn(
                f"CannyEdgeDetection: thresholds ({threshold1}, {threshold2}) exceed the "
                f"typical max gradient value of {MAX_THRESHOLD} for uint8 images. "
                "This may result in no edges being detected.",
                UserWarning,
                stacklevel=2,
            )

        # Convert to grayscale if needed
        if len(image.shape) == 3 and image.shape[2] == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        elif len(image.shape) == 3 and image.shape[2] == 4:
            gray = cv2.cvtColor(image, cv2.COLOR_BGRA2GRAY)
        elif len(image.shape) == 3 and image.shape[2] == 1:
            gray = image[:, :, 0]
        elif len(image.shape) == 2:
            gray = image.copy()
        else:
            raise ValueError(f"Unsupported image shape {image.shape}.")

        # Normalize to uint8 — normalize based on actual min/max range for floats
        if gray.dtype != np.uint8:
            if np.issubdtype(gray.dtype, np.floating):
                # Normalize float images based on actual data range
                gray_min, gray_max = gray.min(), gray.max()
                if gray_max > gray_min:
                    gray = ((gray - gray_min) / (gray_max - gray_min) * 255.0).clip(0, 255).astype(np.uint8)
                else:
                    gray = np.zeros_like(gray, dtype=np.uint8)
            elif gray.dtype == np.uint16:
                gray = (gray >> 8).astype(np.uint8)
            else:
                gray = gray.astype(np.uint8)

        # Apply Canny edge detection
        edges = cv2.Canny(gray, threshold1, threshold2)

        # Convert single-channel output to BGR for compatibility
        result = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        return result
