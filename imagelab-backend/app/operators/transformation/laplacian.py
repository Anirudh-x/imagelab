import cv2
import numpy as np

from app.operators.base import BaseOperator

_VALID_KSIZE = {1, 3, 5, 7}


class Laplacian(BaseOperator):
    def compute(self, image: np.ndarray) -> np.ndarray:
        ddepth = int(self.params.get("ddepth", -1))
        if ddepth == -1:
            ddepth = -1

        ksize = int(self.params.get("ksize", 1))
        if ksize not in _VALID_KSIZE:
            ksize = 1

        laplacian = cv2.Laplacian(image, ddepth, ksize=ksize)
        return np.uint8(np.absolute(laplacian))
