#!/usr/bin/env python3
"""
AACT Local Proxy — tiny HTTP server that bridges browser to AACT PostgreSQL.

Usage:
  1. Install: pip install psycopg2-binary
  2. Set env vars: AACT_USER and AACT_PASSWORD (register at https://aact.ctti-clinicaltrials.org)
  3. Run: python aact_proxy.py
  4. Open MetaSprint Autopilot in browser — AACT source auto-detected

The server listens on http://localhost:8765 and responds to:
  GET /search?terms=heart+failure,cardiac+failure&limit=2000&offset=0
  GET /universe?category=cardiovascular&limit=20000&offset=0  (paged universe)
  GET /health  (connectivity check)
"""

import fnmatch
import http.server
import json
import os
import sys
import threading
import time
import urllib.parse

# --- Configuration ---
AACT_HOST = os.environ.get("AACT_HOST", "aact-db.ctti-clinicaltrials.org")
AACT_PORT = int(os.environ.get("AACT_PORT", "5432"))
AACT_DB = os.environ.get("AACT_DB", "aact")
AACT_USER = os.environ.get("AACT_USER", "")
AACT_PASSWORD = os.environ.get("AACT_PASSWORD", "")
PROXY_PORT = int(os.environ.get("AACT_PROXY_PORT", "8765"))

# --- Security: CORS allowlist ---
# Comma-separated origins or patterns. Supports fnmatch wildcards.
# Default allows localhost on any port and file:// origins.
_DEFAULT_CORS_ORIGINS = "http://localhost:*,http://127.0.0.1:*,file://"
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("AACT_CORS_ORIGINS", _DEFAULT_CORS_ORIGINS).split(",")
    if o.strip()
]

# --- Security: Optional bearer token ---
# When set, every request must include "Authorization: Bearer <token>".
# When empty/unset, auth is disabled (backward compatible).
AACT_AUTH_TOKEN = os.environ.get("AACT_AUTH_TOKEN", "")

# --- Security: Rate limiting ---
RATE_LIMIT_MAX = 60          # max requests per window per IP
RATE_LIMIT_WINDOW = 60       # window in seconds

# --- Security: Query parameter size cap ---
MAX_QUERY_LENGTH = 2000      # max characters in the query string


class RateLimiter:
    """Simple per-IP sliding-window rate limiter (in-memory)."""

    def __init__(self, max_requests=RATE_LIMIT_MAX, window_seconds=RATE_LIMIT_WINDOW):
        self.max_requests = max_requests
        self.window = window_seconds
        self._lock = threading.Lock()
        # ip -> list of timestamps
        self._hits: dict[str, list[float]] = {}

    def is_allowed(self, ip: str) -> bool:
        now = time.monotonic()
        with self._lock:
            timestamps = self._hits.get(ip, [])
            # Prune old entries outside the window
            cutoff = now - self.window
            timestamps = [t for t in timestamps if t > cutoff]
            if len(timestamps) >= self.max_requests:
                self._hits[ip] = timestamps
                return False
            timestamps.append(now)
            self._hits[ip] = timestamps
            return True

    def cleanup(self):
        """Remove stale IPs (call periodically if long-running)."""
        now = time.monotonic()
        cutoff = now - self.window
        with self._lock:
            stale = [ip for ip, ts in self._hits.items() if not ts or ts[-1] <= cutoff]
            for ip in stale:
                del self._hits[ip]


_rate_limiter = RateLimiter()


def _origin_matches(origin: str) -> bool:
    """Check if an Origin header value matches any allowed pattern.

    Browsers send 'null' (literal string) as Origin for file:// pages.
    We match 'null' when 'file://' is in the allowed origins list.
    """
    for pattern in CORS_ALLOWED_ORIGINS:
        if fnmatch.fnmatch(origin, pattern):
            return True
    # file:// pages send Origin: null — allow if file:// is permitted
    if origin == "null" and any(p.startswith("file://") for p in CORS_ALLOWED_ORIGINS):
        return True
    return False


def get_connection():
    """Connect to AACT PostgreSQL."""
    import psycopg2
    return psycopg2.connect(
        host=AACT_HOST, port=AACT_PORT, database=AACT_DB,
        user=AACT_USER, password=AACT_PASSWORD,
        connect_timeout=15,
    )


def query_rcts(terms, limit=2000, offset=0):
    """Parameterized SQL query for randomized trials matching condition/intervention/title terms."""
    if not terms:
        return [], False

    like_clauses = []
    params = []
    for term in terms:
        like_clauses.append(
            "(LOWER(c.name) LIKE %s OR LOWER(COALESCE(i.name, '')) LIKE %s OR LOWER(COALESCE(s.brief_title, '')) LIKE %s)"
        )
        val = f"%{term.lower().strip()}%"
        params.extend([val, val, val])

    where_condition = " OR ".join(like_clauses)
    fetch_limit = max(1, int(limit)) + 1

    query = f"""
        SELECT DISTINCT
            s.nct_id,
            s.brief_title,
            s.overall_status,
            s.phase,
            s.enrollment,
            s.start_date,
            s.completion_date
        FROM studies s
        JOIN conditions c ON s.nct_id = c.nct_id
        LEFT JOIN interventions i ON s.nct_id = i.nct_id
        JOIN designs d ON s.nct_id = d.nct_id
        WHERE ({where_condition})
          AND LOWER(d.allocation) = 'randomized'
        ORDER BY s.start_date DESC NULLS LAST, s.nct_id
        LIMIT %s OFFSET %s
    """
    params.extend([fetch_limit, max(0, int(offset))])

    conn = get_connection()
    try:
        results = []
        with conn.cursor() as cur:
            cur.execute(query, params)
            for row in cur.fetchall():
                nct_id = row[0].upper() if row[0] else None
                if nct_id:
                    results.append({
                        "nctId": nct_id,
                        "title": row[1] or "",
                        "status": row[2] or "",
                        "phase": row[3] or "",
                        "enrollment": row[4],
                        "startDate": str(row[5]) if row[5] else None,
                        "completionDate": str(row[6]) if row[6] else None,
                    })
        has_more = len(results) > limit
        if has_more:
            results = results[:limit]
        return results, has_more
    finally:
        conn.close()


CV_CONDITION_TERMS = [
    "heart failure", "atrial fibrillation", "myocardial infarction",
    "hypertension", "coronary artery", "coronary heart", "angina",
    "venous thromboembol", "pulmonary embol", "peripheral arter",
    "stroke", "cerebrovascul", "cholesterol", "dyslipid", "statin",
    "cardiac", "cardiovascul", "cardiomyopathy", "arrhythmi",
    "valve", "aortic stenosis", "mitral", "pulmonary hypertension",
    "heart transplant", "pacemaker", "defibrillator",
]


def query_universe(category="cardiovascular", limit=20000, offset=0):
    """Paged fetch of RCTs for a clinical category with interventions, conditions, outcomes."""
    if category != "cardiovascular":
        return []

    # Build condition filter
    like_clauses = []
    params = []
    for term in CV_CONDITION_TERMS:
        like_clauses.append("LOWER(c.name) LIKE %s")
        params.append(f"%{term}%")

    where_cond = " OR ".join(like_clauses)
    params.extend([limit, offset])

    query = f"""
        SELECT
            s.nct_id,
            s.brief_title,
            s.overall_status,
            s.phase,
            s.enrollment,
            s.start_date,
            s.completion_date,
            -- Aggregate conditions as pipe-delimited
            (SELECT string_agg(DISTINCT c2.name, '|')
             FROM conditions c2 WHERE c2.nct_id = s.nct_id) AS conditions,
            -- Aggregate interventions as pipe-delimited (type:name pairs)
            (SELECT string_agg(DISTINCT i.intervention_type || ':' || i.name, '|')
             FROM interventions i WHERE i.nct_id = s.nct_id) AS interventions,
            -- Aggregate primary outcomes
            (SELECT string_agg(DISTINCT do.measure, '|')
             FROM design_outcomes do WHERE do.nct_id = s.nct_id
             AND do.outcome_type = 'primary') AS primary_outcomes
        FROM studies s
        JOIN conditions c ON s.nct_id = c.nct_id
        JOIN designs d ON s.nct_id = d.nct_id
        WHERE ({where_cond})
          AND LOWER(d.allocation) = 'randomized'
        GROUP BY s.nct_id, s.brief_title, s.overall_status, s.phase,
                 s.enrollment, s.start_date, s.completion_date
        ORDER BY s.start_date DESC NULLS LAST, s.nct_id
        LIMIT %s
        OFFSET %s
    """

    conn = get_connection()
    try:
        results = []
        with conn.cursor() as cur:
            cur.execute(query, params)
            for row in cur.fetchall():
                nct_id = (row[0] or "").upper()
                if not nct_id:
                    continue
                # Parse interventions: "Drug:Aspirin|Device:Stent" → [{type, name}]
                interventions = []
                if row[8]:
                    for iv in row[8].split("|"):
                        parts = iv.split(":", 1)
                        if len(parts) == 2:
                            interventions.append({"type": parts[0], "name": parts[1]})
                        else:
                            interventions.append({"type": "Other", "name": parts[0]})

                # Parse conditions
                conditions = [c.strip() for c in (row[7] or "").split("|") if c.strip()]

                # Parse primary outcomes
                primary_outcomes = [o.strip() for o in (row[9] or "").split("|") if o.strip()]

                results.append({
                    "nctId": nct_id,
                    "title": row[1] or "",
                    "status": row[2] or "",
                    "phase": row[3] or "",
                    "enrollment": row[4],
                    "startDate": str(row[5]) if row[5] else None,
                    "completionDate": str(row[6]) if row[6] else None,
                    "conditions": conditions,
                    "interventions": interventions,
                    "primaryOutcomes": primary_outcomes,
                })
        return results
    finally:
        conn.close()


class AACTProxyHandler(http.server.BaseHTTPRequestHandler):
    """Minimal HTTP handler with CORS allowlist, rate limiting, auth, and size caps."""

    # --- CORS ---

    def _get_allowed_origin(self):
        """Return the Origin value to echo back, or None if disallowed."""
        origin = self.headers.get("Origin", "")
        if not origin:
            # No Origin header (e.g. curl, non-browser) — allow but don't echo
            return None
        if _origin_matches(origin):
            return origin
        return None

    def _cors_headers(self):
        origin = self._get_allowed_origin()
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    # --- Security gates (return True if request should be rejected) ---

    def _check_auth(self):
        """Verify bearer token when AACT_AUTH_TOKEN is configured.
        Returns True if the request was rejected (caller should return early)."""
        if not AACT_AUTH_TOKEN:
            return False  # auth disabled
        auth_header = self.headers.get("Authorization", "")
        if auth_header == f"Bearer {AACT_AUTH_TOKEN}":
            return False  # valid
        self._respond(401, {"error": "Unauthorized. Provide Authorization: Bearer <token> header."})
        return True

    def _check_rate_limit(self):
        """Enforce per-IP rate limiting.
        Returns True if the request was rejected."""
        client_ip = self.client_address[0]
        if _rate_limiter.is_allowed(client_ip):
            return False
        self.send_response(429)
        self.send_header("Content-Type", "application/json")
        self.send_header("Retry-After", str(RATE_LIMIT_WINDOW))
        self._cors_headers()
        self.end_headers()
        body = {"error": f"Rate limit exceeded. Max {RATE_LIMIT_MAX} requests per {RATE_LIMIT_WINDOW}s."}
        self.wfile.write(json.dumps(body).encode("utf-8"))
        return True

    def _check_query_length(self):
        """Reject requests whose query string exceeds MAX_QUERY_LENGTH.
        Returns True if the request was rejected."""
        parsed = urllib.parse.urlparse(self.path)
        if len(parsed.query) > MAX_QUERY_LENGTH:
            self._respond(414, {"error": f"Query string too long ({len(parsed.query)} chars). Max {MAX_QUERY_LENGTH}."})
            return True
        return False

    # --- HTTP methods ---

    def do_OPTIONS(self):
        # CORS preflight — no auth/rate-limit needed, but respect CORS allowlist
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_GET(self):
        # Security gates — order: rate limit, auth, query size
        if self._check_rate_limit():
            return
        if self._check_auth():
            return
        if self._check_query_length():
            return

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == "/health":
            try:
                conn = get_connection()
                conn.close()
                self._respond(200, {"status": "ok", "database": AACT_DB, "host": AACT_HOST})
            except Exception as e:
                self._respond(503, {"status": "error", "message": str(e)})

        elif path == "/search":
            terms_raw = params.get("terms", [""])[0]
            terms = [t.strip() for t in terms_raw.split(",") if t.strip()]
            if not terms:
                self._respond(400, {"error": "No search terms provided. Use ?terms=term1,term2"})
                return
            limit_str = params.get("limit", ["2000"])[0]
            offset_str = params.get("offset", ["0"])[0]
            try:
                limit_val = max(1, min(int(limit_str), 10000))
            except ValueError:
                limit_val = 2000
            try:
                offset_val = max(0, int(offset_str))
            except ValueError:
                offset_val = 0
            try:
                results, has_more = query_rcts(terms, limit_val, offset_val)
                self._respond(200, {
                    "count": len(results),
                    "limit": limit_val,
                    "offset": offset_val,
                    "hasMore": has_more,
                    "trials": results
                })
            except Exception as e:
                self._respond(500, {"error": str(e)})

        elif path == "/universe":
            category = params.get("category", ["cardiovascular"])[0]
            limit_str = params.get("limit", ["20000"])[0]
            offset_str = params.get("offset", ["0"])[0]
            try:
                limit_val = max(1, min(int(limit_str), 50000))
            except ValueError:
                limit_val = 20000
            try:
                offset_val = max(0, int(offset_str))
            except ValueError:
                offset_val = 0
            try:
                results = query_universe(category, limit_val, offset_val)
                self._respond(200, {
                    "count": len(results),
                    "category": category,
                    "limit": limit_val,
                    "offset": offset_val,
                    "trials": results,
                })
            except Exception as e:
                self._respond(500, {"error": str(e)})

        else:
            self._respond(404, {"error": "Not found. Use /health, /search?terms=, or /universe?category="})

    def _respond(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, format, *args):
        # Clean logging
        print(f"[AACT Proxy] {args[0]}" if args else "")


def main():
    if not AACT_USER or not AACT_PASSWORD:
        print("ERROR: Set AACT_USER and AACT_PASSWORD environment variables.")
        print("  Register at https://aact.ctti-clinicaltrials.org/users/sign_up")
        print("  Then: set AACT_USER=your_username")
        print("        set AACT_PASSWORD=your_password")
        sys.exit(1)

    try:
        import psycopg2  # noqa: F401
    except ImportError:
        print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
        sys.exit(1)

    # Test connection
    try:
        conn = get_connection()
        conn.close()
        print(f"AACT connection verified ({AACT_HOST}:{AACT_PORT}/{AACT_DB})")
    except Exception as e:
        print(f"WARNING: AACT connection failed: {e}")
        print("Server will start anyway — queries will fail until connection is available.")

    server = http.server.HTTPServer(("127.0.0.1", PROXY_PORT), AACTProxyHandler)
    print(f"AACT Proxy running on http://localhost:{PROXY_PORT}")
    print("  GET /health          — check connection")
    print("  GET /search?terms=   — search for RCTs (supports limit/offset pagination)")
    print("  GET /universe        — bulk CV trial universe (interventions + outcomes)")
    print()
    print("Security:")
    print(f"  CORS origins:  {', '.join(CORS_ALLOWED_ORIGINS)}")
    print(f"  Rate limit:    {RATE_LIMIT_MAX} req/{RATE_LIMIT_WINDOW}s per IP")
    print(f"  Max query len: {MAX_QUERY_LENGTH} chars")
    print(f"  Auth token:    {'ENABLED' if AACT_AUTH_TOKEN else 'DISABLED (set AACT_AUTH_TOKEN to enable)'}")
    print()
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
