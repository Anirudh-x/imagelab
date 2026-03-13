import cv2
import numpy as np

from app.operators.base import BaseOperator


class CannyEdgeDetection(BaseOperator):
    def compute(self, image: np.ndarray) -> np.ndarray:
        threshold1 = float(self.params.get("threshold1", 50))
        threshold2 = float(self.params.get("threshold2", 150))

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

        # Normalize to uint8 — float images in [0,1] need scaling first
        if gray.dtype != np.uint8:
            if np.issubdtype(gray.dtype, np.floating):
                gray = (gray * 255.0 if gray.max() <= 1.0 else gray).clip(0, 255).astype(np.uint8)
            elif gray.dtype == np.uint16:
                gray = (gray >> 8).astype(np.uint8)
            else:
                gray = gray.astype(np.uint8)

        # Apply Canny edge detection
        edges = cv2.Canny(gray, int(threshold1), int(threshold2))

        # Convert single-channel output to BGR for compatibility
        result = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        return result
