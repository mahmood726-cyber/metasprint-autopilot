"""metasprint-autopilot validation package.

Sibling modules use bare-name imports (e.g. `from browser_runtime import
ensure_local_browser_libs`). When this package is loaded via its
qualified name (e.g. `import validation.selenium_12_user_advanced_journal_review`
from Overmind's smoke witness), bare-name lookup fails. Add the package
directory to sys.path on import so both styles resolve.
"""
import os as _os
import sys as _sys

_dir = _os.path.dirname(_os.path.abspath(__file__))
if _dir not in _sys.path:
    _sys.path.insert(0, _dir)
