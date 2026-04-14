"""Shared path resolution for validation scripts.

Source of truth for the Cochrane pairwise CSV directory. Each consumer
does `from _paths import CSV_DIR` instead of hardcoding the path.

Resolution order:
1. COCHRANE_PAIRWISE_DATA environment variable (explicit override).
2. Path.home() / 'OneDrive - NHS' / Documents / CochraneDataExtractor / data / pairwise
   (machine-portable fallback; no literal user name in source).
"""
import os
from pathlib import Path


def get_csv_dir() -> str:
    env = os.environ.get("COCHRANE_PAIRWISE_DATA")
    if env:
        return env
    return str(
        Path.home()
        / "OneDrive - NHS"
        / "Documents"
        / "CochraneDataExtractor"
        / "data"
        / "pairwise"
    )


CSV_DIR = get_csv_dir()
