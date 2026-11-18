import logging
import os
import re
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from typing import Any
from uuid import uuid4

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("oqthera.gateway")

MINDAT_API_BASE = "https://api.mindat.org"
MINDAT_TOKEN = os.getenv("MINDAT_API_TOKEN", "").strip()
ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT", os.getenv("ENVIRONMENT", "production")).lower()
IS_PRODUCTION = ENVIRONMENT == "production"
APP_VERSION = "0.2.0"

_raw_origins = os.getenv("ALLOWED_ORIGINS", "https://pnmonja.github.io")
ALLOWED_ORIGINS = [item.strip().rstrip("/") for item in _raw_origins.split(",") if item.strip()]
if "*" in ALLOWED_ORIGINS:
    raise RuntimeError("Wildcard CORS origins are forbidden. Configure exact trusted origins.")
if any(not re.match(r"^https://[A-Za-z0-9.-]+(?::[0-9]+)?$", origin) for origin in ALLOWED_ORIGINS):
    raise RuntimeError("ALLOWED_ORIGINS must contain exact HTTPS origins only.")

WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = int(os.getenv("MAX_REQUESTS_PER_WINDOW", "30"))
MAX_TRACKED_CLIENTS = 10_000
MAX_UPSTREAM_BYTES = 1_000_000
MINDAT_TIMEOUT = httpx.Timeout(12.0, connect=4.0)
_requests: dict[str, deque[float]] = defaultdict(deque)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(
        base_url=MINDAT_API_BASE,
        timeout=MINDAT_TIMEOUT,
        follow_redirects=False,
        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        headers={"Accept": "application/json", "User-Agent": "OQTHERA-Gateway/0.2"},
    )
    yield
    await app.state.http.aclose()


app = FastAPI(
    title="OQTHERA Gateway",
    version=APP_VERSION,
    description="Read-only gateway for authorized Mindat API queries.",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
    debug=False,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
    max_age=600,
)


@app.middleware("http")
async def security_headers_and_request_id(request: Request, call_next):
    request_id = uuid4().hex
    started = time.monotonic()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled gateway error request_id=%s", request_id)
        response = JSONResponse(status_code=500, content={"detail": "Internal server error.", "request_id": request_id})
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    response.headers["X-Request-ID"] = request_id
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" if IS_PRODUCTION else "max-age=0"
    logger.info(
        "request_complete request_id=%s method=%s path=%s status=%s duration_ms=%d",
        request_id, request.method, request.url.path, response.status_code,
        int((time.monotonic() - started) * 1000),
    )
    return response


def check_rate_limit(request: Request) -> None:
    # Use the direct ASGI peer address. Do not trust arbitrary X-Forwarded-For values.
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    bucket = _requests[client_ip]
    while bucket and now - bucket[0] >= WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many requests. Try again shortly.")
    if len(_requests) > MAX_TRACKED_CLIENTS and client_ip not in _requests:
        raise HTTPException(status_code=503, detail="Temporary capacity limit reached.")
    bucket.append(now)


def require_token() -> str:
    if not MINDAT_TOKEN:
        raise HTTPException(status_code=503, detail="Mindat API access is not configured on this server.")
    return MINDAT_TOKEN


async def mindat_get(request: Request, path: str, params: dict[str, Any]) -> Any:
    token = require_token()
    headers = {"Authorization": f"Token {token}"}
    try:
        async with request.app.state.http.stream("GET", path, params=params, headers=headers) as response:
            if response.status_code in (301, 302, 303, 307, 308):
                raise HTTPException(status_code=502, detail="Mindat returned an unexpected redirect.")
            if response.status_code in (401, 403):
                logger.error("Mindat credentials or permissions rejected (HTTP %s).", response.status_code)
                raise HTTPException(status_code=502, detail="Mindat rejected the configured credentials or permissions.")
            if response.status_code == 429:
                raise HTTPException(status_code=503, detail="Mindat rate limit reached.")
            if response.status_code >= 500:
                logger.warning("Mindat upstream error status=%s endpoint=%s", response.status_code, path)
                raise HTTPException(status_code=502, detail="Mindat is temporarily unavailable.")
            if response.status_code >= 400:
                raise HTTPException(status_code=400, detail="Mindat rejected this query.")
            content_type = response.headers.get("content-type", "").lower()
            if "application/json" not in content_type:
                raise HTTPException(status_code=502, detail="Mindat returned an unexpected content type.")
            body = bytearray()
            async for chunk in response.aiter_bytes():
                body.extend(chunk)
                if len(body) > MAX_UPSTREAM_BYTES:
                    raise HTTPException(status_code=502, detail="Mindat response exceeded the safety limit.")
        try:
            import json
            return json.loads(body)
        except (ValueError, UnicodeDecodeError):
            raise HTTPException(status_code=502, detail="Mindat returned invalid JSON.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Mindat did not respond in time.")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not reach Mindat.")


@app.get("/")
async def root():
    return {"service": "OQTHERA Gateway", "version": APP_VERSION, "status": "online", "mindat_configured": bool(MINDAT_TOKEN), "mode": "read-only"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/minerals/search")
async def search_minerals(
    request: Request,
    q: str = Query(..., min_length=2, max_length=80),
    size: int = Query(8, ge=1, le=20),
):
    check_rate_limit(request)
    query = " ".join(q.split())
    if len(query) < 2 or any(ord(char) < 32 for char in query):
        raise HTTPException(status_code=422, detail="Search text is invalid.")
    result = await mindat_get(request, "/geomaterials-search/", {"q": query, "size": size})
    return {"source": "Mindat API", "query": query, "results": result}


@app.get("/api/v1/minerals/{mindat_id}")
async def mineral_detail(request: Request, mindat_id: int):
    check_rate_limit(request)
    if mindat_id <= 0 or mindat_id > 2_147_483_647:
        raise HTTPException(status_code=422, detail="Invalid Mindat identifier.")
    result = await mindat_get(request, f"/geomaterials/{mindat_id}/", {"format": "json"})
    return {"source": "Mindat API", "mindat_id": mindat_id, "result": result}
