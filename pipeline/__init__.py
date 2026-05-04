"""metasprint-autopilot pipeline package.

Sibling modules use bare-name imports (e.g. `from drug_normalize import
classify_drug`) so test files can pytest-discover them without package
qualifiers, AND so the broader project's CLI (`python -m pipeline.run_pipeline`)
keeps working. To make this work when the package is loaded via its
qualified name (e.g. `import pipeline.auto_cluster` from Overmind's
smoke witness), add the package directory to sys.path on import.
"""
import os as _os
import sys as _sys

_pipeline_dir = _os.path.dirname(_os.path.abspath(__file__))
if _pipeline_dir not in _sys.path:
    _sys.path.insert(0, _pipeline_dir)
