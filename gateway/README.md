# OQTHERA Gateway

Read-only server-side gateway between the OQTHERA web app and the Mindat API.

## What it exposes

- `GET /` service status (does not reveal the token)
- `GET /health` health check
- `GET /api/v1/minerals/search?q=quartz&size=8` Mindat geomaterial name search
- `GET /api/v1/minerals/{mindat_id}` Mindat geomaterial detail

The browser never receives the Mindat token. This gateway deliberately exposes only two fixed read operations; it does not accept arbitrary upstream URLs, write requests, image downloads, or token values from clients.

## Local run

Python 3.11+ recommended.

```bash
cd gateway
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

Set environment variables in your local terminal or a private environment file (never commit the real token):

- `MINDAT_API_TOKEN`: token issued by Mindat, only after access and permitted use are confirmed.
- `ALLOWED_ORIGINS`: comma-separated exact website origins. Default is `https://pnmonja.github.io`.

Run:

```bash
uvicorn main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs` to inspect the API.

## Railway deployment

1. Connect the GitHub repository.
2. Set the service root directory to `/gateway`.
3. Railway detects the Python app and can use the included `Procfile`. If it asks for a start command, use:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add `MINDAT_API_TOKEN` as a private service variable only after Mindat has authorized the intended use.
5. Set `ALLOWED_ORIGINS` to the exact production origin of the OQTHERA website.
6. Deploy, then test `/health`, `/`, and a mineral search.

## Important limitations

- This is a first deployment scaffold, not a production security certification.
- The in-memory rate limit is per process; use shared rate limiting and platform controls for a public production service.
- CORS is not authentication. Public visitors can call public read endpoints, so apply quotas/abuse controls before broad release.
- Do not use Mindat data for AI training, model evaluation, or model improvement unless Mindat has granted written permission for that use.
- Follow Mindat's API terms, attribution rules, rate limits, and data licensing requirements. The API documentation is beta and endpoint behavior may change.
- Do not store or expose specimen photographs from Mindat through this gateway; Mindat's API access guide states that the API does not permit use of photographs.
