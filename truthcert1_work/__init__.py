"""metasprint-autopilot truthcert1_work package.

Sibling modules use bare-name imports. When this package is loaded via
its qualified name (Overmind's smoke witness), add the package
directory to sys.path so bare-name lookups resolve.
"""
import os as _os
import sys as _sys

_dir = _os.path.dirname(_os.path.abspath(__file__))
if _dir not in _sys.path:
    _sys.path.insert(0, _dir)
