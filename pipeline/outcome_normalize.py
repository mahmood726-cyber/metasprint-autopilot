"""
AL-MIZAN (The Balance) -- Outcome Normalization Engine
Standardizes outcome titles into poolable categories.
"And the heaven He raised and imposed the balance" -- Quran 55:7
"""
from __future__ import annotations

import re


# ---------------------------------------------------------------------------
# 1) Pattern table: (compiled_regex, normalized_name)
#    ORDER MATTERS -- more specific patterns must precede general ones.
# ---------------------------------------------------------------------------

_OUTCOME_PATTERNS = [
    # --- Composites (most specific first) ---
    # CV death or HF hospitalization composite
    (re.compile(
        r"(?:composite\s+(?:of\s+)?)?cv\s*(?:ascular)?\s+death"
        r"\s+(?:or|and)\s+(?:hf|heart\s+failure)\s+hosp",
        re.IGNORECASE,
    ), "CV death or HF hosp"),
    (re.compile(
        r"(?:cv|cardiovascular)\s+death\s+(?:or|and)\s+"
        r"(?:hospitali[sz]ation\s+for\s+)?(?:hf|heart\s+failure)",
        re.IGNORECASE,
    ), "CV death or HF hosp"),

    # MACE
    (re.compile(
        r"major\s+adverse\s+cardiovascular\s+events?",
        re.IGNORECASE,
    ), "MACE"),
    (re.compile(r"\bMACE\b"), "MACE"),
    (re.compile(
        r"cv\s+death[\s,]+(?:mi|myocardial\s+infarction)[\s,]+(?:or\s+)?stroke",
        re.IGNORECASE,
    ), "MACE"),

    # --- Mortality (after composites that contain "death") ---
    (re.compile(
        r"(?:all[\-\s]cause\s+)?(?:mortality|death\s+from\s+any\s+cause)",
        re.IGNORECASE,
    ), "Mortality"),
    (re.compile(
        r"(?:cardiovascular|cv)\s+(?:death|mortality)",
        re.IGNORECASE,
    ), "CV mortality"),

    # --- Hospitalization ---
    (re.compile(
        r"(?:heart\s+failure|hf)\s+hospitali[sz]ation",
        re.IGNORECASE,
    ), "HF hospitalization"),
    (re.compile(
        r"hospitali[sz]ation\s+for\s+(?:heart\s+failure|hf)",
        re.IGNORECASE,
    ), "HF hospitalization"),
    (re.compile(
        r"all[\-\s]cause\s+hospitali[sz]ation",
        re.IGNORECASE,
    ), "Hospitalization"),

    # --- Cardiac function ---
    (re.compile(
        r"change\s+(?:(?:from\s+baseline\s+)?in\s+)?(?:lvef|left\s+ventricular\s+ejection\s+fraction)",
        re.IGNORECASE,
    ), "LVEF change"),
    (re.compile(
        r"(?:lvef|left\s+ventricular\s+ejection\s+fraction)\s+change",
        re.IGNORECASE,
    ), "LVEF change"),
    (re.compile(
        r"(?:left\s+ventricular\s+ejection\s+fraction|lvef)",
        re.IGNORECASE,
    ), "LVEF"),

    # --- Blood pressure (specific before general) ---
    (re.compile(
        r"(?:change\s+in\s+)?(?:systolic\s+blood\s+pressure|sbp)"
        r"(?:\s+(?:change|reduction))?",
        re.IGNORECASE,
    ), "SBP change"),
    (re.compile(
        r"(?:change\s+in\s+)?(?:diastolic\s+blood\s+pressure|dbp)"
        r"(?:\s+(?:change|reduction))?",
        re.IGNORECASE,
    ), "DBP change"),
    (re.compile(
        r"(?:blood\s+pressure|(?:24[\-\s]hour\s+)?ambulatory\s+bp)",
        re.IGNORECASE,
    ), "Blood pressure"),

    # --- Lipids (change before standalone) ---
    (re.compile(
        r"(?:percent\s+)?change\s+in\s+(?:ldl[\-\s]?c|ldl\s+cholesterol)",
        re.IGNORECASE,
    ), "LDL-C change"),
    (re.compile(
        r"(?:ldl[\-\s]?c|ldl\s+cholesterol)\s+(?:change|reduction)",
        re.IGNORECASE,
    ), "LDL-C change"),
    (re.compile(
        r"(?:ldl[\-\s]?c|ldl\s+cholesterol)",
        re.IGNORECASE,
    ), "LDL-C"),

    # --- Metabolic ---
    (re.compile(r"(?:hba1c|glycated\s+hemo?globin)", re.IGNORECASE), "HbA1c"),

    # --- Renal (endpoint before function) ---
    (re.compile(
        r"(?:kidney|renal)\s+(?:failure|composite)|dialysis|(?:end[\-\s]?stage\s+)"
        r"(?:kidney|renal)\s+disease",
        re.IGNORECASE,
    ), "Renal endpoint"),
    (re.compile(
        r"e?gfr|estimated\s+(?:gfr|glomerular\s+filtration)|"
        r"creatinine\s+clearance|kidney\s+function",
        re.IGNORECASE,
    ), "Renal function"),

    # --- Individual hard endpoints ---
    (re.compile(
        r"(?:myocardial\s+infarction|\bmi\b)",
        re.IGNORECASE,
    ), "MI"),
    (re.compile(
        r"(?:stroke|cerebrovascular)",
        re.IGNORECASE,
    ), "Stroke"),

    # --- Biomarkers ---
    (re.compile(
        r"(?:nt[\-\s]?pro[\-\s]?bnp|(?<!\w)bnp(?!\w))",
        re.IGNORECASE,
    ), "Natriuretic peptide"),

    # --- Functional ---
    (re.compile(
        r"6[\-\s]?(?:min(?:ute)?)\s+walk|6mwd|exercise\s+capacity",
        re.IGNORECASE,
    ), "Exercise capacity"),
    (re.compile(
        r"quality\s+of\s+life|(?<!\w)qol(?!\w)|eq[\-\s]?5d|sf[\-\s]?36|kccq",
        re.IGNORECASE,
    ), "Quality of life"),

    # --- Weight ---
    (re.compile(r"body\s+weight|\bbmi\b", re.IGNORECASE), "Weight"),

    # --- Safety ---
    (re.compile(
        r"(?:serious\s+)?adverse\s+events?|safety",
        re.IGNORECASE,
    ), "Safety"),
    (re.compile(
        r"(?:major\s+)?(?:bleeding|hemorrhage|haemorrhage)",
        re.IGNORECASE,
    ), "Bleeding"),

    # --- Device / rhythm ---
    (re.compile(r"stent\s+thrombosis", re.IGNORECASE), "Stent thrombosis"),
    (re.compile(
        r"(?:atrial\s+fibrillation|af)\s+recurrence",
        re.IGNORECASE,
    ), "AF recurrence"),
]


# ---------------------------------------------------------------------------
# 2) Category mapping
# ---------------------------------------------------------------------------

_HARD_ENDPOINTS = frozenset({
    "Mortality", "CV mortality", "MACE", "CV death or HF hosp",
    "HF hospitalization", "Hospitalization", "MI", "Stroke",
    "Renal endpoint", "Stent thrombosis",
})

_SURROGATE_ENDPOINTS = frozenset({
    "LVEF", "LVEF change", "SBP change", "DBP change", "Blood pressure",
    "LDL-C", "LDL-C change", "HbA1c", "Renal function",
    "Natriuretic peptide", "Exercise capacity", "Weight", "AF recurrence",
})

_SAFETY_ENDPOINTS = frozenset({"Safety", "Bleeding"})


# ---------------------------------------------------------------------------
# 3) Public functions
# ---------------------------------------------------------------------------

def normalize_outcome(title: str) -> str:
    """Map an outcome title string to a standardized outcome name.

    Parameters
    ----------
    title : str
        Raw outcome title from CT.gov (e.g. "Time to First Occurrence
        of Cardiovascular Death or Hospitalization for Heart Failure").

    Returns
    -------
    str
        Standardized outcome name (e.g. "CV death or HF hosp"),
        or "Other: <truncated>" for unrecognized titles.
    """
    if not title or not isinstance(title, str):
        return "Other: (empty)"

    for pattern, normalized in _OUTCOME_PATTERNS:
        if pattern.search(title):
            return normalized

    # Fallback: truncate to 60 characters
    truncated = title.strip()[:60]
    return f"Other: {truncated}"


def get_outcome_category(normalized_name: str) -> str:
    """Return the outcome category for a normalized outcome name.

    Parameters
    ----------
    normalized_name : str
        A standardized outcome name as returned by ``normalize_outcome()``.

    Returns
    -------
    str
        One of 'hard', 'surrogate', 'safety', or 'other'.
    """
    if normalized_name in _HARD_ENDPOINTS:
        return "hard"
    if normalized_name in _SURROGATE_ENDPOINTS:
        return "surrogate"
    if normalized_name in _SAFETY_ENDPOINTS:
        return "safety"
    return "other"


def is_hard_endpoint(normalized_name: str) -> bool:
    """Shortcut: return True if the outcome category is 'hard'.

    Parameters
    ----------
    normalized_name : str
        A standardized outcome name.

    Returns
    -------
    bool
    """
    return get_outcome_category(normalized_name) == "hard"
