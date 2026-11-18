import sys
from pathlib import Path

from fastapi.testclient import TestClient

# Ensure gateway/ is importable whether pytest runs from the repository root
# or from inside the gateway directory.
GATEWAY_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(GATEWAY_DIR))

from main import app  # noqa: E402


def test_health_endpoint_is_available():
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_reports_read_only_gateway():
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "OQTHERA Gateway"
    assert payload["mode"] == "read-only"


def test_security_headers_are_present():
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["X-Request-ID"]


def test_invalid_mindat_identifier_is_rejected():
    with TestClient(app) as client:
        response = client.get("/api/v1/minerals/0")

    assert response.status_code == 422


def test_production_api_docs_are_disabled():
    with TestClient(app) as client:
        response = client.get("/docs")

    assert response.status_code == 404
