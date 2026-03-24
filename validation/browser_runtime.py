"""Local non-root browser runtime dependency bootstrap for Selenium tests."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = PROJECT_ROOT / ".runtime-libs"
DEB_DIR = RUNTIME_ROOT / "debs"
LIB_DIR = RUNTIME_ROOT / "root" / "usr" / "lib" / "x86_64-linux-gnu"

REQUIRED_LIBS = (
    "libnspr4.so",
    "libnss3.so",
    "libnssutil3.so",
    "libsmime3.so",
    "libasound.so.2",
)


def _run(cmd: list[str], cwd: Path | None = None, timeout: int = 180) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def _missing_libs() -> list[str]:
    missing: list[str] = []
    for name in REQUIRED_LIBS:
        try:
            if not (LIB_DIR / name).exists():
                missing.append(name)
        except OSError:
            missing.append(name)
    return missing


def _prepend_ld_library_path(path: Path) -> None:
    path_str = str(path)
    current = os.environ.get("LD_LIBRARY_PATH", "")
    parts = [p for p in current.split(":") if p]
    if path_str in parts:
        return
    os.environ["LD_LIBRARY_PATH"] = f"{path_str}:{current}" if current else path_str


def _download_and_extract() -> tuple[bool, str]:
    DEB_DIR.mkdir(parents=True, exist_ok=True)
    (RUNTIME_ROOT / "root").mkdir(parents=True, exist_ok=True)

    package_sets = [
        ["libnss3", "libnspr4", "libasound2t64"],
        ["libnss3", "libnspr4", "libasound2"],
    ]

    download_error = ""
    for packages in package_sets:
        result = _run(["apt-get", "download", *packages], cwd=DEB_DIR)
        if result.returncode == 0:
            break
        download_error = (result.stderr or result.stdout or "").strip()
    else:
        return False, f"apt-get download failed: {download_error or 'unknown error'}"

    debs = sorted(DEB_DIR.glob("*.deb"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not debs:
        return False, "download succeeded but no .deb files were found"

    for deb in debs:
        result = _run(["dpkg-deb", "-x", str(deb), str(RUNTIME_ROOT / "root")], timeout=120)
        if result.returncode != 0:
            msg = (result.stderr or result.stdout or "").strip()
            return False, f"failed to extract {deb.name}: {msg or 'unknown error'}"

    missing = _missing_libs()
    if missing:
        return False, f"missing libraries after extraction: {', '.join(missing)}"
    return True, "downloaded local runtime libraries"


def ensure_local_browser_libs(auto_download: bool = True) -> dict[str, str | bool]:
    """Ensure Selenium Chrome runtime dependencies are available without root."""
    if not sys.platform.startswith("linux"):
        return {
            "ok": True,
            "source": "not-needed",
            "lib_dir": str(LIB_DIR),
            "reason": "",
        }

    downloaded = False
    missing = _missing_libs()
    if missing and auto_download:
        ok, reason = _download_and_extract()
        if not ok:
            return {"ok": False, "source": "missing", "lib_dir": str(LIB_DIR), "reason": reason}
        downloaded = True
        missing = _missing_libs()

    if missing:
        return {
            "ok": False,
            "source": "missing",
            "lib_dir": str(LIB_DIR),
            "reason": f"missing libraries: {', '.join(missing)}",
        }

    _prepend_ld_library_path(LIB_DIR)
    source = "downloaded" if downloaded else "cached"
    return {"ok": True, "source": source, "lib_dir": str(LIB_DIR), "reason": ""}
