import os
import time
from collections import defaultdict, deque
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

MINDAT_API_BASE = "https://api.mindat.org"
MINDAT_TOKEN = os.getenv("MINDAT_API_TOKEN", "").strip()
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://pnmonja.github.io"
    ).split(",")
    if origin.strip()
]

app = FastAPI(
    title="OQTHERA Gateway",
    version="0.1.0",
    description="Read-only gateway for authorized Mindat API queries."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Basic per-process request guard. For production multi-instance deployments,
# replace this with a shared store (e.g. Redis) and platform-level protections.
_requests: dict[str, deque[float]] = defaultdict(deque)
WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = 30


def check_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    bucket = _requests[client_ip]
    while bucket and now - bucket[0] > WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many requests. Try again shortly.")
    bucket.append(now)


def require_token() -> str:
    if not MINDAT_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="Mindat API access is not configured on this server."
        )
    return MINDAT_TOKEN


async def mindat_get(path: str, params: dict[str, Any]) -> Any:
    token = require_token()
    headers = {
        # Mindat documents tokenAuth; do not expose this token to the browser.
        "Authorization": f"Token {token}",
        "Accept": "application/json",
        "User-Agent": "OQTHERA-Gateway/0.1"
    }
    timeout = httpx.Timeout(15.0, connect=5.0)
    try:
        async with httpx.AsyncClient(
            base_url=MINDAT_API_BASE,
            headers=headers,
            timeout=timeout,
            follow_redirects=False
        ) as client:
            response = await client.get(path, params=params)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Mindat did not respond in time.")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not reach Mindat.")

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=502,
            detail="Mindat rejected the configured credentials or permissions."
        )
    if response.status_code == 429:
        raise HTTPException(status_code=503, detail="Mindat rate limit reached.")
    if response.status_code >= 500:
        raise HTTPException(status_code=502, detail="Mindat is temporarily unavailable.")
    if response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Mindat rejected this query.")

    try:
        return response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Mindat returned an invalid response.")


@app.get("/")
async def root():
    return {
        "service": "OQTHERA Gateway",
        "version": "0.1.0",
        "status": "online",
        "mindat_configured": bool(MINDAT_TOKEN),
        "mode": "read-only"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v1/minerals/search")
async def search_minerals(
    request: Request,
    q: str = Query(..., min_length=2, max_length=80),
    size: int = Query(8, ge=1, le=20)
):
    check_rate_limit(request)
    query = q.strip()
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Search text must contain at least 2 characters.")
    # Only this fixed Mindat endpoint and these validated parameters are exposed.
    result = await mindat_get(
        "/geomaterials-search/",
        {"q": query, "size": size}
    )
    return {
        "source": "Mindat API",
        "query": query,
        "results": result
    }


@app.get("/api/v1/minerals/{mindat_id}")
async def mineral_detail(
    request: Request,
    mindat_id: int
):
    check_rate_limit(request)
    if mindat_id <= 0:
        raise HTTPException(status_code=422, detail="Invalid Mindat identifier.")
    result = await mindat_get(
        f"/geomaterials/{mindat_id}/",
        {"format": "json"}
    )
    return {
        "source": "Mindat API",
        "mindat_id": mindat_id,
        "result": result
    }
