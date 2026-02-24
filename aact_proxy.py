#!/usr/bin/env python3
"""
AACT Local Proxy — tiny HTTP server that bridges browser to AACT PostgreSQL.

Usage:
  1. Install: pip install psycopg2-binary
  2. Set env vars: AACT_USER and AACT_PASSWORD (register at https://aact.ctti-clinicaltrials.org)
  3. Run: python aact_proxy.py
  4. Open MetaSprint Autopilot in browser — AACT source auto-detected

The server listens on http://localhost:8765 and responds to:
  GET /search?terms=heart+failure,cardiac+failure
  GET /health  (connectivity check)
"""

import http.server
import json
import os
import sys
import urllib.parse

# --- Configuration ---
AACT_HOST = os.environ.get("AACT_HOST", "aact-db.ctti-clinicaltrials.org")
AACT_PORT = int(os.environ.get("AACT_PORT", "5432"))
AACT_DB = os.environ.get("AACT_DB", "aact")
AACT_USER = os.environ.get("AACT_USER", "")
AACT_PASSWORD = os.environ.get("AACT_PASSWORD", "")
PROXY_PORT = int(os.environ.get("AACT_PROXY_PORT", "8765"))


def get_connection():
    """Connect to AACT PostgreSQL."""
    import psycopg2
    return psycopg2.connect(
        host=AACT_HOST, port=AACT_PORT, database=AACT_DB,
        user=AACT_USER, password=AACT_PASSWORD,
        connect_timeout=15,
    )


def query_rcts(terms):
    """Parameterized SQL query for randomized trials matching condition terms."""
    if not terms:
        return []

    like_clauses = []
    params = []
    for term in terms:
        like_clauses.append("LOWER(c.name) LIKE %s")
        params.append(f"%{term.lower().strip()}%")

    where_condition = " OR ".join(like_clauses)

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
        JOIN designs d ON s.nct_id = d.nct_id
        WHERE ({where_condition})
          AND LOWER(d.allocation) = 'randomized'
        ORDER BY s.nct_id
        LIMIT 5000
    """

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
        return results
    finally:
        conn.close()


class AACTProxyHandler(http.server.BaseHTTPRequestHandler):
    """Minimal HTTP handler with CORS for browser access."""

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_GET(self):
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
            try:
                results = query_rcts(terms)
                self._respond(200, {"count": len(results), "trials": results})
            except Exception as e:
                self._respond(500, {"error": str(e)})

        else:
            self._respond(404, {"error": "Not found. Use /health or /search?terms=..."})

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
    print("  GET /health        — check connection")
    print("  GET /search?terms= — search for RCTs")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
