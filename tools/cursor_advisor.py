#!/usr/bin/env python3
"""
Cursor Model Advisor
Fetches live pricing from Cursor's JS bundle; falls back to cached data when
the site is unreachable.  After every successful live fetch the FALLBACK_MODELS
block in this file is automatically rewritten so future offline runs stay fresh.

Usage:
    python3 cursor_advisor.py                     # normal run
    python3 cursor_advisor.py --requests 1000 --budget 40   # custom plan
    python3 cursor_advisor.py --debug             # dump raw JS fragment
"""

import argparse
import json
import random
import re
import sys
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import List, Optional, Tuple

try:
    import requests as _requests
except ImportError:
    print("Missing dependency. Run: pip install requests")
    sys.exit(1)

# ╔══════════════════════════════════════════════════════════════════╗
# ║  USER CONFIGURATION — edit these to match your Cursor plan      ║
# ╚══════════════════════════════════════════════════════════════════╝

PLAN_NAME          = "Pro"    # shown in output header (informational only)
PREMIUM_REQUESTS   = 500      # free request-pool credits per billing cycle
ON_DEMAND_BUDGET   = 20.00    # $ on-demand allowance per billing cycle

# Pricing constants — update if Cursor changes their rates
REQUESTS_FLAT_RATE = 0.04     # $ per 1 request-pool credit
CURSOR_OVERHEAD    = 1.20     # Max Mode: 20% surcharge on top of API token cost

# Token estimates per task type — tune these to your actual coding patterns
TASKS = [
    # strategy "quality": pick highest API-cost model in tier (capability first)
    # strategy "value":   pick cheapest in tier (most requests for budget)
    {"key": "heavy",   "label": "Complex  (refactor/arch/debug)", "in": 12000, "out": 2000,
     "preferred_tier": "premium",  "strategy": "quality"},
    {"key": "medium",  "label": "Medium   (feature/code review)",  "in": 6000,  "out": 800,
     "preferred_tier": "premium",  "strategy": "value"},
    {"key": "light",   "label": "Light    (small fix/explain)",    "in": 2000,  "out": 300,
     "preferred_tier": "standard", "strategy": "value"},
    {"key": "trivial", "label": "Trivial  (autocomplete/rename)",  "in": 500,   "out": 100,
     "preferred_tier": "free",     "strategy": "value"},
]

# ── URLs ──────────────────────────────────────────────────────────────
DOC_URL = "https://cursor.com/docs/models-and-pricing"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",   # omit 'br': requests doesn't handle Brotli natively
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-CH-UA": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Linux"',
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

# Headers for fetching JS chunks — adds Referer + script-fetch Sec-Fetch hints.
CHUNK_HEADERS = {
    **HEADERS,
    "Referer": "https://www.cursor.com/",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Dest": "script",
    "Sec-Fetch-Mode": "no-cors",
}


# ── Data model ────────────────────────────────────────────────────────
@dataclass
class ModelRecord:
    name: str                            # technical model ID (e.g. "claude-opus-4-6")
    display_name: str = ""               # human-readable name (e.g. "Claude 4.6 Opus")
    tier: str = "standard"               # "premium" | "standard" | "free" | "daily_driver"
    in_price: float = 0.0                # $ per 1M input tokens
    out_price: float = 0.0               # $ per 1M output tokens
    request_price: Optional[float] = None  # flat $ per request (overrides token pricing)
    is_max_only: bool = False            # req=0, isMax=true — per-token, Max Mode only
    is_daily_driver: bool = False        # req>=1 model — flat-rate request pool
    is_free_preview: bool = False        # free now, may change
    is_hidden: bool = False              # not shown in Cursor model picker UI
    intelligence_tier: str = "moderate"  # Cursor quality tier: "frontier"|"high"|"moderate"
    provider: Optional[str] = None
    region: Optional[str] = None
    notes: str = ""


def label(m: ModelRecord) -> str:
    """Human-readable display name with fallback to technical ID."""
    return m.display_name or m.name


# ── FALLBACK_START ────────────────────────────────────────────
FALLBACK_DATE = "2026-04-20"

FALLBACK_MODELS: List[ModelRecord] = [
    # ── Daily drivers (request-pool, req>=1) ───────────────────
    # These cost REQUESTS_FLAT_RATE * req_n per request from the budget pool.
    ModelRecord("claude-4-sonnet", display_name="Claude 4 Sonnet", tier="daily_driver", in_price=3.0, out_price=15.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Anthropic"),
    ModelRecord("claude-4-5-haiku", display_name="Claude 4.5 Haiku", tier="daily_driver", in_price=1.0, out_price=5.0, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="Anthropic"),
    ModelRecord("claude-4-sonnet-1m", display_name="Claude 4 Sonnet 1M", tier="daily_driver", in_price=6.0, out_price=22.5, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Anthropic"),
    ModelRecord("gemini-3.1-pro", display_name="Gemini 3.1 Pro", tier="daily_driver", in_price=2.0, out_price=12.0, request_price=0.04, is_daily_driver=True, intelligence_tier="frontier", provider="Google"),
    ModelRecord("gemini-3-pro", display_name="Gemini 3 Pro", tier="daily_driver", in_price=2.0, out_price=12.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Google"),
    ModelRecord("gemini-3-flash", display_name="Gemini 3 Flash", tier="daily_driver", in_price=0.5, out_price=3.0, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="Google"),
    ModelRecord("gemini-3-pro-image-preview", display_name="Gemini 3 Pro Image Preview", tier="daily_driver", in_price=2.0, out_price=12.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Google"),
    ModelRecord("gemini-2.5-flash", display_name="Gemini 2.5 Flash", tier="daily_driver", in_price=0.3, out_price=2.5, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="Google"),
    ModelRecord("gpt-5.1", display_name="GPT-5", tier="daily_driver", in_price=1.25, out_price=10.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5-codex", display_name="GPT-5-Codex", tier="daily_driver", in_price=1.25, out_price=10.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5-mini", display_name="GPT-5 Mini", tier="daily_driver", in_price=0.25, out_price=2.0, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="OpenAI"),
    ModelRecord("gpt-5-fast", display_name="GPT-5 Fast", tier="daily_driver", in_price=2.5, out_price=20.0, request_price=0.08, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5.2", display_name="GPT-5.2", tier="daily_driver", in_price=1.75, out_price=14.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5.2-codex", display_name="GPT-5.2 Codex", tier="daily_driver", in_price=1.75, out_price=14.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5.4-mini", display_name="GPT-5.4 Mini", tier="daily_driver", in_price=0.75, out_price=4.5, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5.4-nano", display_name="GPT-5.4 Nano", tier="daily_driver", in_price=0.2, out_price=1.25, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="OpenAI"),
    ModelRecord("gpt-5.1-codex", display_name="GPT-5.1 Codex", tier="daily_driver", in_price=1.25, out_price=10.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("gpt-5.1-codex-mini", display_name="GPT-5.1 Codex Mini", tier="daily_driver", in_price=0.25, out_price=2.0, request_price=0.04, is_daily_driver=True, is_hidden=True, provider="OpenAI"),
    ModelRecord("gpt-5.1-codex-max", display_name="GPT-5.1 Codex Max", tier="daily_driver", in_price=1.25, out_price=10.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="OpenAI"),
    ModelRecord("grok-4-20", display_name="Grok 4.20", tier="daily_driver", in_price=2.0, out_price=6.0, request_price=0.04, is_daily_driver=True, intelligence_tier="high", provider="xAI"),
    ModelRecord("kimi-k2.5", display_name="Kimi K2.5", tier="daily_driver", in_price=0.6, out_price=3.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Moonshot"),
    ModelRecord("composer-1", display_name="Composer 1", tier="daily_driver", in_price=1.25, out_price=10.0, request_price=0.04, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Cursor"),
    ModelRecord("composer-1.5", display_name="Composer 1.5", tier="daily_driver", in_price=3.5, out_price=17.5, request_price=0.08, is_daily_driver=True, is_hidden=True, intelligence_tier="high", provider="Cursor"),
    ModelRecord("composer-2", display_name="Composer 2", tier="daily_driver", in_price=0.5, out_price=2.5, request_price=0.08, is_daily_driver=True, intelligence_tier="frontier", provider="Cursor"),
    # ── Max Mode / per-token (req=0, isMax=true) ─────────────────
    ModelRecord("claude-4-6-sonnet", display_name="Claude 4.6 Sonnet", tier="premium", in_price=3.0, out_price=15.0, is_max_only=True, intelligence_tier="high", provider="Anthropic"),
    ModelRecord("claude-4-5-sonnet", display_name="Claude 4.5 Sonnet", tier="premium", in_price=3.0, out_price=15.0, is_max_only=True, is_hidden=True, intelligence_tier="high", provider="Anthropic"),
    ModelRecord("claude-opus-4-7", display_name="Claude 4.7 Opus", tier="premium", in_price=5.0, out_price=25.0, is_max_only=True, intelligence_tier="frontier", provider="Anthropic"),
    ModelRecord("claude-4-6-opus", display_name="Claude 4.6 Opus", tier="premium", in_price=5.0, out_price=25.0, is_max_only=True, is_hidden=True, intelligence_tier="frontier", provider="Anthropic"),
    ModelRecord("claude-4-5-opus", display_name="Claude 4.5 Opus", tier="premium", in_price=5.0, out_price=25.0, is_max_only=True, is_hidden=True, intelligence_tier="frontier", provider="Anthropic"),
    ModelRecord("claude-4-6-opus-fast", display_name="Claude 4.6 Opus (Fast mode)", tier="premium", in_price=30.0, out_price=150.0, is_max_only=True, is_hidden=True, intelligence_tier="frontier", provider="Anthropic"),
    ModelRecord("gpt-5.4", display_name="GPT-5.4", tier="premium", in_price=2.5, out_price=15.0, is_max_only=True, intelligence_tier="frontier", provider="OpenAI"),
    # ── API-pool per-token (req=0, isMax=false) ────────────────
    ModelRecord("gpt-5.3-codex", display_name="GPT-5.3 Codex", tier="premium", in_price=1.75, out_price=14.0, intelligence_tier="frontier", provider="OpenAI"),
]
# ── FALLBACK_END ────────────────────────────────────────────


# ── Dynamic fetching from Cursor's JS bundle ──────────────────────────
# Cursor docs use Next.js App Router (RSC). The model table is a lazy component
# whose data is embedded in a JS chunk — not in the initial HTML.  Strategy:
#   1. Fetch the RSC payload (RSC:1 header) to get the chunk URL list
#   2. Scan those chunks for the one containing the MODELS array
#   3. Parse JS object notation with targeted regex

def _get_with_retry(
    url: str,
    headers: dict,
    timeout: int,
    label: str,
    session: Optional[object] = None,
    debug: bool = False,
) -> Optional[str]:
    """GET a URL with up to 5 retries on 429; returns response text or None.

    Pass a requests.Session as *session* so cookies and TCP connections are
    reused across calls (mirrors real browser behaviour and helps CDN auth).
    """
    get = (session.get if session is not None else _requests.get)
    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            r = get(url, headers=headers, timeout=timeout)
        except Exception as e:
            print(f"[-] {label} fetch failed (attempt {attempt + 1}): {e}")
            time.sleep(2 ** attempt)
            continue
        if r.status_code == 200:
            if debug:
                enc = r.headers.get("Content-Encoding", "(none)")
                ct  = r.headers.get("Content-Type",     "(none)")
                print(f"[d] {label} — Content-Encoding: {enc}, Content-Type: {ct}, "
                      f"raw len: {len(r.content)}, text len: {len(r.text)}")
            return r.text
        if r.status_code == 429:
            # Respect Retry-After if present; otherwise use exponential backoff
            # with a 15 s minimum and 120 s cap to survive aggressive CDN limits.
            retry_after = int(r.headers.get("Retry-After", 0))
            backoff = min(120, 15 * (2 ** attempt))
            wait = max(retry_after, backoff)
            print(f"[-] {label} rate-limited (429) — waiting {wait}s "
                  f"(attempt {attempt + 1}/{max_attempts})")
            time.sleep(wait)
        else:
            print(f"[-] {label} returned HTTP {r.status_code}")
            return None
    print(f"[-] {label} failed after {max_attempts} attempts")
    return None


def _fetch_model_chunk(debug: bool = False) -> str:
    """Return raw JS source of the chunk with MODELS data, or '' on failure.

    Uses a single requests.Session for all HTTP calls so that cookies set by
    the initial HTML page request (CDN auth, bot-detection tokens, etc.) are
    automatically included in every subsequent chunk fetch — mirroring what a
    real browser does.
    """
    chunk_paths: List[str] = []
    session = _requests.Session()

    # ── Strategy A: plain HTML fetch ─────────────────────────────────
    # A normal browser GETs the HTML page first.  Chunk URLs appear in
    # <script src>, <link href>, and in inline Next.js chunk maps embedded
    # inside <script> bodies — we scan the whole HTML text for any quoted
    # /_next/static/chunks/ reference rather than requiring src= only.
    html = _get_with_retry(DOC_URL, HEADERS, 20, "HTML page",
                           session=session, debug=debug)
    if html:
        print(f"[*] HTML page: {len(html)} bytes")
        if debug:
            print(f"[d] HTML preview: {html[:300]!r}")
        chunk_paths = list(dict.fromkeys(re.findall(
            r'"((?:/docs-static)?/_next/static/chunks/[^"?]+\.js(?:\?[^"]*)?)"',
            html,
        )))
        print(f"[*] Chunk URLs from HTML: {len(chunk_paths)}")

        # ── Strategy A2: build manifest (when HTML has no direct chunk refs) ──
        # Next.js embeds the buildId in __NEXT_DATA__ or in static asset paths.
        # The build manifest at /_next/static/<buildId>/_buildManifest.js lists
        # every chunk the app ships, making it a reliable second source.
        if not chunk_paths:
            print("[!] No chunks in HTML body — trying build manifest")
            bid_m = (re.search(r'"buildId"\s*:\s*"([^"]+)"', html) or
                     re.search(r'/_next/static/([A-Za-z0-9_-]{6,})/', html))
            if bid_m:
                build_id = bid_m.group(1)
                manifest_url = (f"https://cursor.com/_next/static/"
                                f"{build_id}/_buildManifest.js")
                manifest = _get_with_retry(
                    manifest_url, CHUNK_HEADERS, 15, "build manifest",
                    session=session, debug=debug,
                )
                if manifest:
                    chunk_paths = list(dict.fromkeys(re.findall(
                        r'"(/_next/static/chunks/[^"]+\.js)"',
                        manifest,
                    )))
                    print(f"[*] Chunk URLs from build manifest: {len(chunk_paths)}")

        # Pause briefly so the chunk requests don't look like an instant bot hit.
        if chunk_paths:
            delay = random.uniform(2.0, 5.0)
            print(f"[*] Pausing {delay:.1f}s before fetching chunks …")
            time.sleep(delay)

    # ── Strategy B: RSC payload scan (last resort) ────────────────────
    # RSC headers are aggressively rate-limited on GitHub Actions IPs, so
    # this path is only attempted when Strategy A (and A2) both produce nothing.
    if not chunk_paths:
        print("[!] No chunks from HTML — trying RSC payload")
        rsc_text = _get_with_retry(
            DOC_URL,
            {**HEADERS, "RSC": "1", "Next-Router-Prefetch": "1"},
            20,
            "RSC payload",
            session=session,
            debug=debug,
        )
        if not rsc_text:
            return ""
        print(f"[*] RSC payload: {len(rsc_text)} bytes")
        if debug:
            print(f"[d] RSC preview: {rsc_text[:300]!r}")
        # Scan all N:I[...] component blocks
        for block in re.findall(r'\d+:I\[\d+,\[([^\]]*)\]', rsc_text):
            chunk_paths += re.findall(
                r'"((?:/docs-static)?/_next/static/chunks/[^"?]+(?:\?[^"]*)?)"',
                block,
            )
        # Last resort: scan the whole RSC text
        if not chunk_paths:
            chunk_paths = re.findall(
                r'"((?:/docs-static)?/_next/static/chunks/[^"?]+(?:\?[^"]*)?)"',
                rsc_text,
            )

    seen: set = set()
    unique_paths = [p for p in chunk_paths if not (p in seen or seen.add(p))]
    print(f"[*] Candidate chunk URLs: {len(unique_paths)}")

    if not unique_paths:
        print("[-] No _next/static/chunks/ URLs found")
        return ""

    # OR logic across 4 independent signals — tolerates single field renames.
    _SIGNALS = ('"MODELS"', "tokenInput", "uncachedInput", "requests:")

    for path in unique_paths:
        text = _get_with_retry(
            "https://cursor.com" + path, CHUNK_HEADERS, 15, f"chunk {path}",
            session=session, debug=debug,
        )
        if text is None:
            continue

        hits = [s for s in _SIGNALS if s in text]
        if len(hits) >= 2:
            print(f"[+] Model chunk found: {path} (signals: {hits})")
            return text
        if hits:
            print(f"[~] Partial signal match on {path}: {hits} — skipping")

    print(f"[-] No model chunk matched among {len(unique_paths)} candidate(s)")
    return ""


def _js_bool(val: str) -> bool:
    """Convert JS boolean literals to Python: !0->True, !1->False."""
    return val in ("!0", "true")


def _parse_js_models(js: str) -> List[ModelRecord]:
    """Parse the MODELS array embedded in Cursor's JS bundle into ModelRecords."""
    m = re.search(r'"MODELS",0,\[', js)
    if not m:
        return []

    raw = js[m.end() - 1:]  # start at '['

    parts = re.split(r'(?<=\}),\{(?=id:)', raw.lstrip('['))

    def _str(entry: str, key: str) -> Optional[str]:
        hit = re.search(rf'\b{key}:"([^"]*)"', entry)
        return hit.group(1) if hit else None

    def _bool(entry: str, key: str) -> Optional[bool]:
        hit = re.search(rf'\b{key}:(!0|!1|true|false)\b', entry)
        return _js_bool(hit.group(1)) if hit else None

    def _num(entry: str, key: str) -> Optional[float]:
        hit = re.search(rf'\b{key}:(-?\.?\d+\.?\d*)\b', entry)
        return float(hit.group(1)) if hit else None

    records: List[ModelRecord] = []
    for i, part in enumerate(parts):
        entry = part if i == 0 else "{id:" + part

        model_id = _str(entry, "id")
        provider  = _str(entry, "provider")

        # Sub-rows (e.g. long-context variants) have no provider — skip them
        if not model_id or not provider:
            continue

        disp_name    = _str(entry, "name") or ""
        is_max       = _bool(entry, "isMax") or False
        is_hidden    = _bool(entry, "hidden") or False
        is_free_prev = _bool(entry, "isFreePreview") or _bool(entry, "freePreview") or False
        req_n        = _num(entry, "requests") or 0.0
        itier        = _str(entry, "intelligenceTier") or "moderate"

        # Token pricing (uncachedInput preferred over tokenInput for input cost)
        in_price  = _num(entry, "uncachedInput") or _num(entry, "tokenInput") or 0.0
        out_price = _num(entry, "output") or _num(entry, "tokenOutput") or 0.0

        # ── Classification ────────────────────────────────────────────
        # IMPORTANT: `requests` (billing pool) takes priority over `isMax`.
        # `isMax` means the model *supports* Max Mode, not that it requires it.
        # Only when req=0 AND isMax=true is Max Mode the only way to use the model.
        if req_n >= 1:
            # Request-pool model — costs req_n credits at REQUESTS_FLAT_RATE each
            tier          = "daily_driver"
            request_price = REQUESTS_FLAT_RATE * req_n
            is_max_only   = False
            is_daily_driv = True
        elif is_max:
            # Pure per-token Max Mode model (req=0, isMax=true)
            tier          = "premium"
            request_price = None
            is_max_only   = True
            is_daily_driv = False
        elif in_price > 0:
            # API-pool per-token model (req=0, isMax=false)
            tier          = "premium" if itier in ("frontier", "high") else "standard"
            request_price = None
            is_max_only   = False
            is_daily_driv = False
        else:
            tier          = "free"
            request_price = 0.0
            is_max_only   = False
            is_daily_driv = False

        records.append(ModelRecord(
            name=model_id,
            display_name=disp_name,
            tier=tier,
            in_price=float(in_price),
            out_price=float(out_price),
            request_price=request_price,
            is_max_only=is_max_only,
            is_daily_driver=is_daily_driv,
            is_free_preview=bool(is_free_prev),
            is_hidden=bool(is_hidden),
            intelligence_tier=itier,
            provider=provider,
        ))

    return records


# ── Self-updating fallback ────────────────────────────────────────────

# Sentinel tag halves — never concatenate these into the full tag inside this
# function body, otherwise re.sub would match (and corrupt) the function itself.
_FB_TAG = "FALLBACK"   # joined with _START/_END below only in the sentinel lines


def _model_to_source(m: ModelRecord) -> str:
    """Serialise a ModelRecord to a Python source line (non-default fields only)."""
    parts = [f'"{m.name}"']
    if m.display_name:
        parts.append(f'display_name="{m.display_name}"')
    if m.tier != "standard":
        parts.append(f'tier="{m.tier}"')
    if m.in_price:
        parts.append(f'in_price={m.in_price}')
    if m.out_price:
        parts.append(f'out_price={m.out_price}')
    if m.request_price is not None:
        parts.append(f'request_price={m.request_price}')
    if m.is_max_only:
        parts.append('is_max_only=True')
    if m.is_daily_driver:
        parts.append('is_daily_driver=True')
    if m.is_free_preview:
        parts.append('is_free_preview=True')
    if m.is_hidden:
        parts.append('is_hidden=True')
    if m.intelligence_tier != "moderate":
        parts.append(f'intelligence_tier="{m.intelligence_tier}"')
    if m.provider:
        parts.append(f'provider="{m.provider}"')
    if m.region:
        parts.append(f'region="{m.region}"')
    if m.notes:
        parts.append(f'notes="{m.notes}"')
    return f'    ModelRecord({", ".join(parts)}),\n'


def _update_fallback_in_source(models: List[ModelRecord], date_str: str) -> None:
    """Rewrite the FALLBACK_MODELS block in this script file with fresh live data."""
    script_path = Path(__file__).resolve()
    try:
        source = script_path.read_text()
    except Exception as e:
        print(f"[-] Could not read script for fallback update: {e}")
        return

    # Build the sentinel lines by constructing the tag at runtime so the
    # literal marker text never appears inside this function body.
    dashes = "\u2500" * 44
    start_line = f"# \u2500\u2500 {_FB_TAG}_START {dashes}\n"
    end_line   = f"# \u2500\u2500 {_FB_TAG}_END {dashes}\n"

    lines: List[str] = [
        start_line,
        f'FALLBACK_DATE = "{date_str}"\n',
        "\n",
        "FALLBACK_MODELS: List[ModelRecord] = [\n",
        "    # \u2500\u2500 Daily drivers (request-pool, req>=1) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n",
        "    # These cost REQUESTS_FLAT_RATE * req_n per request from the budget pool.\n",
    ]
    for mdl in models:
        if mdl.is_daily_driver:
            lines.append(_model_to_source(mdl))

    lines.append(
        "    # \u2500\u2500 Max Mode / per-token (req=0, isMax=true) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
    )
    for mdl in models:
        if mdl.is_max_only:
            lines.append(_model_to_source(mdl))

    lines.append(
        "    # \u2500\u2500 API-pool per-token (req=0, isMax=false) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"
    )
    for mdl in models:
        if not mdl.is_daily_driver and not mdl.is_max_only and mdl.in_price > 0:
            lines.append(_model_to_source(mdl))

    lines.append("]\n")
    lines.append(end_line)

    new_block = "".join(lines)

    # Match from start sentinel to end sentinel (including the end line)
    start_tag = re.escape(f"# \u2500\u2500 {_FB_TAG}_START")
    end_tag   = re.escape(f"# \u2500\u2500 {_FB_TAG}_END")
    pattern   = start_tag + r"[^\n]*\n" + r".*?" + end_tag + r"[^\n]*\n"
    updated   = re.sub(pattern, new_block, source, count=1, flags=re.DOTALL)

    if updated == source:
        return  # nothing changed

    try:
        script_path.write_text(updated)
        print(f"[+] Fallback updated in {script_path.name} "
              f"({len(models)} models, date={date_str}).")
    except Exception as e:
        print(f"[-] Could not write updated fallback: {e}")


# ── JSON output ───────────────────────────────────────────────────────

def write_json_output(models: List[ModelRecord], source: str, date_str: str, path: str) -> None:
    """Write models to a JSON file consumable by the web app."""
    source_tag = "live" if source.startswith("live") else "fallback"
    payload = {
        "date": date_str,
        "source": source_tag,
        "models": [
            {
                "name":             m.name,
                "displayName":      m.display_name,
                "tier":             m.tier,
                "inPrice":          m.in_price,
                "outPrice":         m.out_price,
                "requestPrice":     m.request_price,
                "isMaxOnly":        m.is_max_only,
                "isDailyDriver":    m.is_daily_driver,
                "isFreePreview":    m.is_free_preview,
                "isHidden":         m.is_hidden,
                "intelligenceTier": m.intelligence_tier,
                "provider":         m.provider,
            }
            for m in models
        ],
    }
    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"[+] JSON written to {out_path} ({len(models)} models, source={source_tag}).")


# ── Model loading ─────────────────────────────────────────────────────

def get_models(debug: bool = False) -> Tuple[List[ModelRecord], str]:
    print(f"[*] Fetching live model data from {DOC_URL} ...")
    chunk_js = _fetch_model_chunk(debug=debug)

    if debug and chunk_js:
        m = re.search(r'"MODELS",0,\[', chunk_js)
        if m:
            print("\n--- DEBUG: MODELS raw (first 2000 chars) ---")
            print(chunk_js[m.end() - 1 : m.end() + 1999])
            print("--- END DEBUG ---\n")

    if chunk_js:
        models = _parse_js_models(chunk_js)
        if models:
            print(f"[+] Loaded {len(models)} models from live data.")
            _update_fallback_in_source(models, date.today().isoformat())
            return models, "live (cursor.com)"
        print("[-] Parsed chunk but found no model records.")

    print("[!] Could not fetch live pricing — using cached fallback data.")
    return FALLBACK_MODELS, f"cached fallback (last updated {FALLBACK_DATE})"


# ── Cost math ─────────────────────────────────────────────────────────

def cost_per_request(model: ModelRecord, in_tok: int, out_tok: int) -> float:
    if model.request_price is not None:
        return model.request_price
    return ((in_tok / 1_000_000) * model.in_price +
            (out_tok / 1_000_000) * model.out_price) * CURSOR_OVERHEAD


# ── ANSI color helpers ────────────────────────────────────────────────
# Colors are auto-detected (TTY check) and can be disabled via --no-color.

_COLOR = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()

def _bold(s: str) -> str:
    return f"\033[1m{s}\033[0m" if _COLOR else s

def _dim(s: str) -> str:
    return f"\033[2m{s}\033[0m" if _COLOR else s

def _grn(s: str) -> str:
    return f"\033[32m{s}\033[0m" if _COLOR else s

def _ylw(s: str) -> str:
    return f"\033[33m{s}\033[0m" if _COLOR else s


# ── Quality tier helpers ─────────────────────────────────────────────

_TIER_RANK = {"frontier": 0, "high": 1, "moderate": 2}

def _tier_sort_key(m: ModelRecord) -> Tuple:
    """Sort key: best intelligence_tier first, then highest API cost as tiebreak."""
    return (_TIER_RANK.get(m.intelligence_tier, 9), -(m.in_price + m.out_price))


# ── Output ────────────────────────────────────────────────────────────

def _print_header(source: str) -> None:
    budget_credits = int(ON_DEMAND_BUDGET / REQUESTS_FLAT_RATE)
    print(f"\n{_bold('=' * 62)}")
    print(_bold(f"  Cursor Model Advisor  |  Plan: {PLAN_NAME}"))
    print(f"  {PREMIUM_REQUESTS:,} included credits  |  "
          f"${ON_DEMAND_BUDGET:.0f} on-demand ({budget_credits:,} credits @ "
          f"${REQUESTS_FLAT_RATE}/req)")
    print(f"  {source}")
    print(_bold('=' * 62))


# ── TL;DR Quick Decision Guide ──────────────────────────────────────

_PROVIDER_RANK = {"Anthropic": 0, "OpenAI": 1, "Google": 2, "xAI": 3, "Cursor": 4}


def _pick_best_driver(models: List[ModelRecord], *, hidden: bool) -> Optional[ModelRecord]:
    """Pick the best daily driver by intelligence tier, among cheapest request price.
    Tiebreak: major provider first, shorter name (base model over niche variant)."""
    candidates = [m for m in models if m.is_daily_driver and m.is_hidden == hidden]
    if not candidates:
        return None
    min_price = min(m.request_price or REQUESTS_FLAT_RATE for m in candidates)
    cheapest = [m for m in candidates
                if (m.request_price or REQUESTS_FLAT_RATE) == min_price]
    return min(cheapest, key=lambda m: (
        _TIER_RANK.get(m.intelligence_tier, 9),
        _PROVIDER_RANK.get(m.provider, 9),
        len(m.display_name or m.name),
    ))


def print_tldr(models: List[ModelRecord]) -> None:
    best_visible = _pick_best_driver(models, hidden=False)
    best_hidden  = _pick_best_driver(models, hidden=True)
    budget_pick  = None
    moderate_drivers = [m for m in models if m.is_daily_driver
                        and m.intelligence_tier == "moderate"]
    if moderate_drivers:
        budget_pick = min(moderate_drivers,
                          key=lambda m: (m.request_price or REQUESTS_FLAT_RATE,
                                         m.in_price + m.out_price))

    # Max Mode pick: cheapest visible max-only by heavy-task cost
    heavy = next((t for t in TASKS if t["key"] == "heavy"), TASKS[0])
    max_models = [m for m in models if m.is_max_only and not m.is_hidden]
    max_pick = (min(max_models,
                    key=lambda m: cost_per_request(m, heavy["in"], heavy["out"]))
                if max_models else None)

    total_credits = PREMIUM_REQUESTS + int(ON_DEMAND_BUDGET / REQUESTS_FLAT_RATE)

    print(f"\n  {_bold('QUICK GUIDE')}")
    print(f"  {'─' * 56}")

    def _rec_line(prefix: str, m: Optional[ModelRecord], extra: str = "") -> None:
        if not m:
            return
        cost = f"${m.request_price:.2f}/req" if m.request_price else f"${cost_per_request(m, heavy['in'], heavy['out']):.2f}/req"
        tier_tag = f"[{m.intelligence_tier}]"
        id_tag = f"  {_dim('(' + m.name + ')')}" if m.is_hidden else ""
        line = f"  {prefix}  {label(m):<24} {cost:<12} {tier_tag}{id_tag}{extra}"
        print(line)

    _rec_line(_grn(">> Best daily driver: "), best_visible)
    _rec_line("   Best hidden driver:", best_hidden)
    _rec_line("   Budget pick:       ", budget_pick)
    if max_pick:
        mc = cost_per_request(max_pick, heavy["in"], heavy["out"])
        _rec_line("   Max Mode pick:     ", max_pick,
                  f"  {_ylw(f'{mc / REQUESTS_FLAT_RATE:.1f}x vs driver')}")

    print()
    print(f"  Total budget: {PREMIUM_REQUESTS:,} included + "
          f"{int(ON_DEMAND_BUDGET / REQUESTS_FLAT_RATE):,} on-demand = "
          f"{_bold(f'{total_credits:,} requests')} at ${REQUESTS_FLAT_RATE}/req.")
    print(f"  Max Mode costs {_ylw('2-20x more')} per request — use only when drivers aren't enough.")


# ── Request Pool (merged Phase 1 + Daily Drivers) ────────────────────

def print_request_pool(models: List[ModelRecord]) -> None:
    budget_credits = int(ON_DEMAND_BUDGET / REQUESTS_FLAT_RATE)
    print(f"\n{_bold('=' * 62)}")
    print(_bold(f"REQUEST POOL — {PREMIUM_REQUESTS:,} Included + "
                f"{budget_credits:,} On-Demand Credits"))
    print(f"{'=' * 62}")
    print(
        f"All models below bill at a flat rate from your request pool.\n"
        f"${REQUESTS_FLAT_RATE}/credit (2-credit models = "
        f"${REQUESTS_FLAT_RATE * 2:.2f}). Disable 'Auto' to control credit spend.\n"
    )

    drivers = [m for m in models if m.is_daily_driver]
    if not drivers:
        print("  (No request-pool models in current data.)")
        return

    # Pick the recommended model (same as TL;DR best visible)
    rec = _pick_best_driver(models, hidden=False)

    # Group by provider, sorted alphabetically
    providers: dict = {}
    for m in drivers:
        prov = m.provider or "Other"
        providers.setdefault(prov, []).append(m)

    for prov in sorted(providers.keys()):
        group = sorted(providers[prov], key=_tier_sort_key)
        first = True
        for m in group:
            prov_col = prov if first else ""
            first = False

            # Build model name column — show display name + dim ID for hidden
            if m.is_hidden:
                name_col = f"{label(m)} {_dim('(' + m.name + ')')}"
                name_plain = f"{label(m)} ({m.name})"  # for width calc
            else:
                name_col = label(m)
                name_plain = label(m)

            cost_str = f"${m.request_price:.2f}" if m.request_price else "free"
            tier_str = m.intelligence_tier
            note = ""
            if m.request_price and m.request_price > REQUESTS_FLAT_RATE:
                note = f"{int(m.request_price / REQUESTS_FLAT_RATE)} credits"

            # Mark recommended model
            marker = _grn(">>") if m is rec else "  "

            print(f"  {marker} {prov_col:<11} {name_col:<42} {cost_str:<8} {tier_str:<10} {note}")

    # Free API-pool models (not daily_driver, not max, price=0)
    free_api = [m for m in models
                if not m.is_daily_driver and not m.is_max_only
                and m.in_price == 0 and m.out_price == 0 and m.tier == "free"]
    if free_api:
        print()
        for m in free_api:
            print(f"  {_ylw('**')} {label(m)} [{m.provider}]  "
                  f"{_ylw('FREE PREVIEW — pricing may change')}")

    print(f"\n  {_dim('Tips: Disable Auto routing. Avoid Max Mode for credit-pool tasks.')}")
    print(f"  {_dim(f'After {PREMIUM_REQUESTS:,} included credits, on-demand kicks in at the same rate.')}")


# ── API Pool (condensed Phase 2) ─────────────────────────────────────

def _best_model_for_task(models: List[ModelRecord], preferred_tier: str,
                          strategy: str, in_tok: int, out_tok: int) -> Optional[ModelRecord]:
    """Pick a per-token API-pool model for the task breakdown table."""
    tier_order = {"premium":  ["premium", "standard"],
                  "standard": ["standard", "premium"],
                  "free":     ["free", "standard"]}
    eligible = [m for m in models
                if not m.is_max_only and m.tier != "daily_driver"
                and m.request_price is None and m.in_price > 0]

    for tier in tier_order.get(preferred_tier, ["standard"]):
        candidates = [m for m in eligible if m.tier == tier]
        if not candidates:
            continue
        if strategy == "quality":
            return max(candidates, key=lambda m: m.in_price + m.out_price)
        else:
            return min(candidates, key=lambda m: cost_per_request(m, in_tok, out_tok))

    return min(eligible, key=lambda m: cost_per_request(m, in_tok, out_tok)) if eligible else None


def print_api_pool(models: List[ModelRecord]) -> None:
    eligible = [m for m in models
                if not m.is_max_only and m.tier != "daily_driver"
                and m.request_price is None and m.in_price > 0]

    if not eligible:
        return  # skip section entirely

    print(f"\n{_bold('=' * 62)}")
    print(_bold("API POOL — Per-Token Billing"))
    print(f"{'=' * 62}")

    if len(eligible) == 1:
        # Compact single-model summary
        m = eligible[0]
        heavy   = next((t for t in TASKS if t["key"] == "heavy"), TASKS[0])
        trivial = next((t for t in TASKS if t["key"] == "trivial"), TASKS[-1])
        c_heavy   = cost_per_request(m, heavy["in"], heavy["out"])
        c_trivial = cost_per_request(m, trivial["in"], trivial["out"])
        r_heavy   = int(ON_DEMAND_BUDGET / c_heavy) if c_heavy > 0 else 0
        r_trivial = int(ON_DEMAND_BUDGET / c_trivial) if c_trivial > 0 else 0
        print(
            f"One API-pool model: {_bold(label(m))} [{m.intelligence_tier}] "
            f"(${m.in_price:.2f}/${m.out_price:.2f} per 1M in/out)"
        )
        print(
            f"Cost: ${c_trivial:.3f}/trivial to ${c_heavy:.3f}/complex "
            f"({r_heavy:,}-{r_trivial:,} requests for ${ON_DEMAND_BUDGET:.0f})"
        )
    else:
        # Full task-breakdown table (future-proof for 2+ models)
        print(
            "These models bill per-token from your on-demand budget.\n"
        )
        col_w = (36, 26, 10, 16)
        header = (
            f"{'Task Type':<{col_w[0]}} | "
            f"{'Recommended Model':<{col_w[1]}} | "
            f"{'$/req':<{col_w[2]}} | "
            f"Credits for ${ON_DEMAND_BUDGET:.0f}"
        )
        print(header)
        print("-" * (sum(col_w) + 11))
        for task in TASKS:
            in_tok, out_tok = task["in"], task["out"]
            best = _best_model_for_task(models, task["preferred_tier"],
                                         task["strategy"], in_tok, out_tok)
            if best is None:
                print(f"{task['label']:<{col_w[0]}} | {'(none)':<{col_w[1]}} | — | —")
                continue
            cost     = cost_per_request(best, in_tok, out_tok)
            reqs     = int(ON_DEMAND_BUDGET / cost) if cost > 0 else -1
            reqs_str = "unlimited" if reqs < 0 else f"{reqs:,}"
            print(
                f"{task['label']:<{col_w[0]}} | "
                f"{label(best):<{col_w[1]}} | "
                f"${cost:<{col_w[2] - 1}.4f} | "
                f"{reqs_str}"
            )


# ── Plan Mode (request-pool recommendations) ─────────────────────────

def print_plan_mode_section(models: List[ModelRecord]) -> None:
    """Recommend request-pool models for Cursor Plan Mode with a Max Mode cost comparison."""
    print(f"\n{_bold('=' * 62)}")
    print(_bold("PLAN MODE — Recommendations"))
    print(f"{'=' * 62}")
    print(
        "Plan Mode runs on the request pool — using a request-pool model\n"
        "avoids per-token Max Mode billing.\n"
    )

    heavy = next((t for t in TASKS if t["key"] == "heavy"), TASKS[0])

    # ── Request-pool picks ────────────────────────────────────────────
    drivers = [m for m in models if m.is_daily_driver and not m.is_hidden]
    if not drivers:
        print("  (No visible request-pool models in current data.)")
    else:
        tier_rank = {"frontier": 0, "high": 1, "moderate": 2}
        # Best: highest intelligence, tiebreak by provider then cheapest
        best = min(drivers, key=lambda m: (
            tier_rank.get(m.intelligence_tier, 9),
            _PROVIDER_RANK.get(m.provider, 9),
            m.request_price or REQUESTS_FLAT_RATE,
        ))
        # Value: best high-tier at lowest cost; exclude Best
        value_candidates = [m for m in drivers if m is not best
                            and m.intelligence_tier in ("frontier", "high")]
        value = (min(value_candidates, key=lambda m: (
            m.request_price or REQUESTS_FLAT_RATE,
            tier_rank.get(m.intelligence_tier, 9),
        )) if value_candidates else None)
        # Best-for-value: lowest cost among intelligence >= "high", excluding above
        bv_candidates = [m for m in drivers
                         if m not in (best, value)
                         and m.intelligence_tier in ("frontier", "high")]
        best_val = (min(bv_candidates, key=lambda m: (
            m.request_price or REQUESTS_FLAT_RATE,
            tier_rank.get(m.intelligence_tier, 9),
        )) if bv_candidates else None)

        print(f"  {'─' * 56}")
        print(f"  {'Label':<12} {'Model':<28} {'Tier':<10} {'$/req':<8}  Budget sessions")
        print(f"  {'─' * 56}")

        def _plan_row(tag: str, m: ModelRecord) -> None:
            cost = m.request_price or REQUESTS_FLAT_RATE
            cr = int(cost / REQUESTS_FLAT_RATE)
            incl_sessions = int(PREMIUM_REQUESTS / cr)
            odm_sessions  = int(ON_DEMAND_BUDGET / cost)
            credits_note = f"{cr} credit{'s' if cr > 1 else ''}"
            print(f"  {tag:<12} {label(m):<28} {m.intelligence_tier:<10} "
                  f"${cost:.2f}    "
                  f"{incl_sessions:,} incl + {odm_sessions:,} on-demand  ({credits_note})")

        _plan_row("Best",        best)
        if value:
            _plan_row("Value",   value)
        if best_val:
            _plan_row("Best/val", best_val)

    # ── Max Mode comparison ───────────────────────────────────────────
    max_models = [m for m in models if m.is_max_only and not m.is_hidden]
    if max_models:
        cheapest_max = min(max_models,
                           key=lambda m: cost_per_request(m, heavy["in"], heavy["out"]))
        priciest_max = max(max_models,
                           key=lambda m: cost_per_request(m, heavy["in"], heavy["out"]))
        c_cheap = cost_per_request(cheapest_max, heavy["in"], heavy["out"])
        c_pricey = cost_per_request(priciest_max, heavy["in"], heavy["out"])
        mult_cheap  = c_cheap  / REQUESTS_FLAT_RATE if REQUESTS_FLAT_RATE > 0 else 0
        mult_pricey = c_pricey / REQUESTS_FLAT_RATE if REQUESTS_FLAT_RATE > 0 else 0
        print(f"\n  {_ylw('⚠  Max Mode comparison (per-token billing):')}")
        print(f"  Selecting a Max Mode model in Plan Mode activates per-token billing.")
        print(f"  {label(cheapest_max)}: ~${c_cheap:.3f}/session "
              f"({_ylw(f'{mult_cheap:.1f}x')} vs request-pool)")
        if priciest_max is not cheapest_max:
            print(f"  {label(priciest_max)}: ~${c_pricey:.3f}/session "
                  f"({_ylw(f'{mult_pricey:.1f}x')} vs request-pool)")
        print(f"  {_dim('Use a request-pool model in Plan Mode to stay within your credit budget.')}")


# ── Max Mode (enhanced with cost comparison) ─────────────────────────

def print_max_mode_section(models: List[ModelRecord]) -> None:
    surcharge = round((CURSOR_OVERHEAD - 1) * 100)
    print(f"\n{_bold('=' * 62)}")
    print(_bold(_ylw("MAX MODE — Per-Token Models (Cost Warning)")))
    print(f"{'=' * 62}")
    print(
        f"Max Mode bills per-token from your ${ON_DEMAND_BUDGET:.0f} budget "
        f"({surcharge}% surcharge on API cost).\n"
        f"Does NOT consume request credits — every call deducts directly.\n"
    )

    max_models = [m for m in models if m.is_max_only and m.request_price is None]
    if not max_models:
        print("  (No Max Mode models in current data.)")
        return

    heavy  = next((t for t in TASKS if t["key"] == "heavy"), TASKS[0])
    light  = next((t for t in TASKS if t["key"] == "light"), TASKS[2] if len(TASKS) > 2 else TASKS[0])

    # Sort all by cost (cheapest first), mark hidden with dim text
    all_max = sorted(max_models,
                     key=lambda m: cost_per_request(m, heavy["in"], heavy["out"]))

    col_w = (30, 11, 11, 11, 10)
    print(f"  {'Model':<{col_w[0]}}  {'$/complex':<{col_w[1]}}  "
          f"{'$/light':<{col_w[2]}}  {'Reqs/$' + str(int(ON_DEMAND_BUDGET)):<{col_w[3]}}  "
          f"vs driver")
    print("  " + "-" * (sum(col_w) + 8))

    for m in all_max:
        c_heavy = cost_per_request(m, heavy["in"], heavy["out"])
        c_light = cost_per_request(m, light["in"], light["out"])
        reqs    = int(ON_DEMAND_BUDGET / c_heavy) if c_heavy > 0 else -1
        reqs_s  = f"{reqs:,}" if reqs >= 0 else "unlimited"
        mult    = c_heavy / REQUESTS_FLAT_RATE if REQUESTS_FLAT_RATE > 0 else 0
        mult_s  = _ylw(f"{mult:.1f}x")

        name_str = label(m)
        if m.is_hidden:
            name_str = f"{label(m)} {_dim('(' + m.name + ')')}"

        print(
            f"  {name_str:<{col_w[0]}}  "
            f"${c_heavy:<{col_w[1] - 1}.4f}  "
            f"${c_light:<{col_w[2] - 1}.4f}  "
            f"{reqs_s:<{col_w[3]}}  "
            f"{mult_s}"
        )

    print(f"\n  {_dim('Break-even: a $0.04 driver is always cheaper per-request.')}")
    print(f"  {_dim('Use Max Mode when you need capability the drivers lack,')}")
    print(f"  {_dim('or when one high-quality response saves multiple round-trips.')}")


def main() -> None:
    global PREMIUM_REQUESTS, ON_DEMAND_BUDGET, _COLOR

    parser = argparse.ArgumentParser(
        description="Cursor Model Advisor — live pricing + budget strategy"
    )
    parser.add_argument("--debug",    action="store_true",
                        help="dump raw JS model data for parser debugging")
    parser.add_argument("--no-color", action="store_true", dest="no_color",
                        help="disable ANSI color output")
    parser.add_argument("--requests", type=int,   default=None,
                        help=f"override PREMIUM_REQUESTS (default: {PREMIUM_REQUESTS})")
    parser.add_argument("--budget",   type=float, default=None,
                        help=f"override ON_DEMAND_BUDGET in $ (default: {ON_DEMAND_BUDGET})")
    parser.add_argument("--json-output", metavar="PATH", default=None,
                        help="write models JSON to PATH (does not suppress terminal output)")
    args = parser.parse_args()

    global _COLOR
    if args.no_color:
        _COLOR = False
    if args.requests is not None:
        PREMIUM_REQUESTS = args.requests
    if args.budget is not None:
        ON_DEMAND_BUDGET = args.budget

    models, source = get_models(debug=args.debug)

    if args.json_output:
        date_str = date.today().isoformat() if source.startswith("live") else FALLBACK_DATE
        write_json_output(models, source, date_str, args.json_output)

    _print_header(source)
    print_tldr(models)
    print_request_pool(models)
    print_plan_mode_section(models)
    print_api_pool(models)
    print_max_mode_section(models)
    print()


if __name__ == "__main__":
    main()
