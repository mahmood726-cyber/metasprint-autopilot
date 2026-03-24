"""
AL-KITAB (The Book) -- CT.gov Cardiovascular Results Harvester
"Nothing have We omitted from the Book" -- Quran 6:38
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error


# ---------------------------------------------------------------------------
# 1) normalize_param_type
# ---------------------------------------------------------------------------

# Mapping table: lower-cased pattern -> (effect_type, is_ratio)
_PARAM_TYPE_MAP = [
    # Hazard Ratio variants
    (re.compile(r"hazard\s+ratio"), ("HR", True)),
    # Odds Ratio variants
    (re.compile(r"odds\s+ratio"), ("OR", True)),
    # Risk Ratio / Relative Risk variants (must come before "risk difference")
    (re.compile(r"risk\s+ratio"), ("RR", True)),
    (re.compile(r"relative\s+risk"), ("RR", True)),
    # Rate ratio / incidence rate ratio
    (re.compile(r"(?:incidence\s+)?rate\s+ratio"), ("RR", True)),
    # Risk Difference
    (re.compile(r"risk\s+difference"), ("RD", False)),
    # Standardized Mean Difference (must come before plain Mean Difference)
    (re.compile(r"standardized\s+mean\s+difference"), ("SMD", False)),
    # Mean Difference
    (re.compile(r"mean\s+difference"), ("MD", False)),
]


def normalize_param_type(param_type_str: str | None) -> tuple[str, bool] | None:
    """Map a CT.gov paramType string to (effect_type, is_ratio) or None.

    Parameters
    ----------
    param_type_str : str
        The paramType value from a CT.gov analysis record, e.g.
        "Hazard Ratio", "Odds Ratio (OR)", "Mean Difference (Final Values)".

    Returns
    -------
    tuple or None
        (effect_type, is_ratio) where effect_type is one of
        'HR', 'OR', 'RR', 'RD', 'MD', 'SMD', and is_ratio is bool.
        Returns None for unrecognized types.
    """
    if not param_type_str:
        return None
    lowered = param_type_str.strip().lower()
    for pattern, result in _PARAM_TYPE_MAP:
        if pattern.search(lowered):
            return result
    return None


# ---------------------------------------------------------------------------
# 2) parse_analysis
# ---------------------------------------------------------------------------

def _parse_float(val: str | int | float | None) -> float | None:
    """Try to parse a string to float. Returns None on failure."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    val = str(val).strip()
    if not val or val.upper() in ("NA", "N/A", "NR", "NE", "--", ""):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _parse_pvalue(pval_str: str | None) -> float | None:
    """Parse a p-value string that may have prefixes like '=', '<', '>', '<='."""
    if pval_str is None:
        return None
    s = str(pval_str).strip()
    if not s:
        return None
    # Strip leading comparison operators
    s = re.sub(r'^[<>=]+\s*', '', s)
    return _parse_float(s)


def parse_analysis(raw: dict | None) -> dict | None:
    """Parse a single CT.gov analysis dict into a poolable effect dict.

    Parameters
    ----------
    raw : dict
        A single analysis record from
        resultsSection.outcomeMeasuresModule.outcomeMeasures[].analyses[].

    Returns
    -------
    dict or None
        Parsed effect dict with keys: effect_type, effect_estimate,
        lower_ci, upper_ci, ci_level, is_ratio, p_value,
        statistical_method, param_type_raw.
        Returns None if the record cannot be parsed into a valid effect.
    """
    if not raw or not isinstance(raw, dict):
        return None

    # --- effect type ---
    param_type_raw = raw.get("paramType", "")
    type_result = normalize_param_type(param_type_raw)
    if type_result is None:
        return None
    effect_type, is_ratio = type_result

    # --- effect estimate ---
    effect_estimate = _parse_float(raw.get("paramValue"))
    if effect_estimate is None:
        return None

    # --- ratio measures cannot be zero ---
    if is_ratio and effect_estimate == 0.0:
        return None

    # --- CI limits (both required) ---
    lower_ci = _parse_float(raw.get("ciLowerLimit"))
    upper_ci = _parse_float(raw.get("ciUpperLimit"))
    if lower_ci is None or upper_ci is None:
        return None

    # --- CI level ---
    ci_pct = _parse_float(raw.get("ciPctValue"))
    ci_level = ci_pct / 100.0 if ci_pct is not None else 0.95

    # --- p-value (optional) ---
    p_value = _parse_pvalue(raw.get("pValue"))

    # --- statistical method ---
    statistical_method = raw.get("statisticalMethod", "")

    return {
        "effect_type": effect_type,
        "effect_estimate": effect_estimate,
        "lower_ci": lower_ci,
        "upper_ci": upper_ci,
        "ci_level": ci_level,
        "is_ratio": is_ratio,
        "p_value": p_value,
        "statistical_method": statistical_method,
        "param_type_raw": param_type_raw,
    }


# ---------------------------------------------------------------------------
# 3) extract_trial_effects
# ---------------------------------------------------------------------------

# Regex patterns for intervention name normalization
_DRUG_PREFIX_RE = re.compile(r"^Drug:\s*", re.IGNORECASE)
_DOSAGE_RE = re.compile(
    r"\s+\d+(?:\.\d+)?\s*(?:mg|mcg|ug|g|ml|units?|iu)\b.*$",
    re.IGNORECASE,
)
_PARENS_DOSAGE_RE = re.compile(r"\s*\(.*?\)\s*$")

_PLACEBO_NAMES = {"placebo", "sham", "usual care", "standard care", "control"}


def _normalize_intervention_name(name: str | None) -> str | None:
    """Normalize an intervention name: strip 'Drug:', dosage, title-case."""
    if not name:
        return name
    n = _DRUG_PREFIX_RE.sub("", name)
    n = _DOSAGE_RE.sub("", n)
    n = _PARENS_DOSAGE_RE.sub("", n)
    n = n.strip()
    if n:
        n = n.title()
    return n


def _extract_phase(phases: list[str] | None) -> int | None:
    """Extract max numeric phase from a list like ['PHASE2', 'PHASE3']."""
    if not phases:
        return None
    max_phase = None
    for p in phases:
        match = re.search(r'(\d+)', str(p))
        if match:
            num = int(match.group(1))
            if max_phase is None or num > max_phase:
                max_phase = num
    return max_phase


def _is_placebo_intervention(intervention: dict) -> bool:
    """Check if an intervention dict represents a placebo/control arm."""
    itype = (intervention.get("type") or "").upper()
    if itype == "PLACEBO":
        return True
    iname = (intervention.get("name") or "").lower().strip()
    # OTHER type: only treat as placebo if name also matches placebo patterns
    # (OTHER can include active comparators like dietary supplements)
    for pname in _PLACEBO_NAMES:
        if pname in iname:
            return True
    return False


def extract_trial_effects(trial: dict | None) -> list[dict]:
    """Extract all poolable effects from a full CT.gov trial JSON.

    Parameters
    ----------
    trial : dict
        A single trial record from the CT.gov API v2.

    Returns
    -------
    list of dict
        Each dict is an enriched effect record with trial metadata.
    """
    if not trial or not isinstance(trial, dict):
        return []

    protocol = trial.get("protocolSection", {})
    results = trial.get("resultsSection", {})

    # --- Trial identifiers ---
    id_module = protocol.get("identificationModule", {})
    nct_id = id_module.get("nctId", "")
    brief_title = id_module.get("briefTitle", "")

    # --- Conditions ---
    cond_module = protocol.get("conditionsModule", {})
    conditions = cond_module.get("conditions", [])

    # --- Interventions ---
    arms_module = protocol.get("armsInterventionsModule", {})
    interventions_raw = arms_module.get("interventions", [])

    # Filter out placebo/other, normalize names
    active_interventions = [
        iv for iv in interventions_raw if not _is_placebo_intervention(iv)
    ]
    # Fallback: if all filtered out, use first intervention
    if not active_interventions and interventions_raw:
        active_interventions = [interventions_raw[0]]

    # Build a single intervention name string
    if active_interventions:
        intervention_name = _normalize_intervention_name(
            active_interventions[0].get("name", "")
        )
    else:
        intervention_name = ""

    # --- Phase ---
    design_module = protocol.get("designModule", {})
    phases = design_module.get("phases", [])
    phase = _extract_phase(phases)

    # --- Enrollment ---
    enrollment_info = design_module.get("enrollmentInfo", {})
    enrollment = enrollment_info.get("count")
    if enrollment is not None:
        try:
            enrollment = int(enrollment)
        except (ValueError, TypeError):
            enrollment = None

    # --- Start date ---
    status_module = protocol.get("statusModule", {})
    start_date_struct = status_module.get("startDateStruct", {})
    start_date = start_date_struct.get("date", "")

    # --- Iterate outcome measures ---
    effects = []
    om_module = results.get("outcomeMeasuresModule", {})
    outcome_measures = om_module.get("outcomeMeasures", [])

    for om in outcome_measures:
        outcome_title = om.get("title", "")
        outcome_type = om.get("type", "")
        analyses = om.get("analyses", [])

        for analysis_raw in analyses:
            parsed = parse_analysis(analysis_raw)
            if parsed is None:
                continue

            effect = {
                "nct_id": nct_id,
                "brief_title": brief_title,
                "conditions": conditions,
                "intervention": intervention_name,
                "phase": phase,
                "enrollment": enrollment,
                "start_date": start_date,
                "outcome_title": outcome_title,
                "outcome_type": outcome_type,
                **parsed,
            }
            effects.append(effect)

    return effects


# ---------------------------------------------------------------------------
# 4) fetch_cv_trials_with_results
# ---------------------------------------------------------------------------

CV_CONDITION_TERMS = [
    "heart failure",
    "myocardial infarction",
    "acute coronary syndrome",
    "atrial fibrillation",
    "hypertension",
    "coronary artery disease",
    "stroke",
    "peripheral artery disease",
    "pulmonary hypertension",
    "aortic stenosis",
    "cardiomyopathy",
    "venous thromboembolism",
    "deep vein thrombosis",
    "pulmonary embolism",
    "angina",
    "atherosclerosis",
]

_CTGOV_API_BASE = "https://clinicaltrials.gov/api/v2/studies"


def fetch_cv_trials_with_results(
    output_dir: str, max_pages: int = 50, page_size: int = 100,
) -> list[dict]:
    """Fetch cardiovascular trials with results from CT.gov API v2.

    Iterates over 16 cardiovascular condition terms, paginating through
    results for each. Deduplicates by NCT ID across all terms.

    Parameters
    ----------
    output_dir : str
        Directory to save the raw JSON output.
    max_pages : int
        Maximum number of pages to fetch per condition term.
    page_size : int
        Number of studies per page (max 1000 per CT.gov API).

    Returns
    -------
    list of dict
        List of unique trial dicts.
    """
    os.makedirs(output_dir, exist_ok=True)

    seen_nct_ids = set()
    all_trials = []

    for term in CV_CONDITION_TERMS:
        page_token = None
        pages_fetched = 0

        while pages_fetched < max_pages:
            params = {
                "query.cond": term,
                "query.term": "AREA[HasResults]true",
                "filter.overallStatus": "COMPLETED",
                "pageSize": str(page_size),
                "format": "json",
            }
            if page_token:
                params["pageToken"] = page_token

            url = _CTGOV_API_BASE + "?" + urllib.parse.urlencode(params)

            try:
                req = urllib.request.Request(url)
                req.add_header(
                    "User-Agent",
                    "MetaSprint-Autopilot/1.0 (cardiovascular meta-analysis research)",
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
            except (urllib.error.URLError, urllib.error.HTTPError, Exception) as e:
                print(f"  [WARN] API error for '{term}' page {pages_fetched}: {e}")
                break

            studies = data.get("studies", [])
            if not studies:
                break

            for study in studies:
                nct_id = (
                    study.get("protocolSection", {})
                    .get("identificationModule", {})
                    .get("nctId", "")
                )
                if nct_id and nct_id not in seen_nct_ids:
                    seen_nct_ids.add(nct_id)
                    all_trials.append(study)

            pages_fetched += 1
            page_token = data.get("nextPageToken")
            if not page_token:
                break

            # Rate limit: 1.3s between requests
            time.sleep(1.3)

        print(
            f"  [{term}] fetched {pages_fetched} page(s), "
            f"total unique so far: {len(all_trials)}"
        )

    # Save raw JSON
    output_path = os.path.join(output_dir, "ctgov_cv_raw.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_trials, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(all_trials)} unique trials to {output_path}")

    return all_trials


# ---------------------------------------------------------------------------
# 5) extract_all_effects
# ---------------------------------------------------------------------------

def extract_all_effects(trials: list[dict], output_path: str) -> list[dict]:
    """Run extract_trial_effects on all trials and save results.

    Parameters
    ----------
    trials : list of dict
        List of trial dicts from CT.gov API.
    output_path : str
        Path to save the extracted effects JSON.

    Returns
    -------
    list of dict
        All extracted effect records.
    """
    all_effects = []
    trials_with_effects = 0

    for trial in trials:
        effects = extract_trial_effects(trial)
        if effects:
            trials_with_effects += 1
            all_effects.extend(effects)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_effects, f, indent=2, ensure_ascii=False)

    print(
        f"Extracted {len(all_effects)} effects from "
        f"{trials_with_effects}/{len(trials)} trials -> {output_path}"
    )

    return all_effects


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="AL-KITAB: CT.gov Cardiovascular Results Harvester"
    )
    parser.add_argument(
        "--output-dir",
        default="data",
        help="Directory for raw and processed output (default: data)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=50,
        help="Max pages per condition term (default: 50)",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=100,
        help="Studies per page (default: 100)",
    )
    args = parser.parse_args()

    print("=== AL-KITAB: CT.gov Cardiovascular Results Harvester ===")
    print(f"Output dir: {args.output_dir}")

    trials = fetch_cv_trials_with_results(
        args.output_dir, args.max_pages, args.page_size
    )

    effects_path = os.path.join(args.output_dir, "ctgov_cv_effects.json")
    effects = extract_all_effects(trials, effects_path)

    print(f"\nDone. {len(effects)} poolable effects harvested.")
