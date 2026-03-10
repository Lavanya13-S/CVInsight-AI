<div align="center">

# CVInsight AI

### Intelligent CV Analysis for Technical Hiring Teams

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Pytest](https://img.shields.io/badge/Pytest-Tested-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-2E7D32?style=for-the-badge)](#)

**Smart hiring decisions powered by multi-signal CV analysis, role-fit scoring, and skill-gap intelligence.**

[Quick Start](#quick-start) •
[Features](#features) •
[Demo](#demo) •
[API](#api-documentation) •
[Project Structure](#project-structure)

</div>

## Why This Project

Hiring managers lose hours sifting through CVs that all look the same on the surface.

CVInsight AI cuts through the noise with a data-driven workflow:

- Drop a job description and a batch of CVs in any format.
- Get structured candidate profiles built automatically from CV content.
- Generate ranked shortlists with score breakdowns and skill-gap reports.
- Surface near-miss candidates who would otherwise be filtered out.
- Validate your shortlist decisions with side-by-side candidate comparison.

## Features

| Capability | Description |
|---|---|
| Multi-Signal Scoring | Combines required skill coverage, must-have constraints, nice-to-have signals, seniority, and semantic proximity into a single role-fit score. |
| Role-Aware Profiles | Purpose-built scoring weights for `backend`, `frontend`, `data_ai`, `devops`, and `fullstack` roles. |
| Universal CV Parsing | Accepts `PDF`, `DOCX`, and `TXT` file formats with automatic text extraction. |
| Automatic Profile Building | Derives candidate name and years of experience directly from CV text. |
| Batch Upload Interface | Drop multiple CV files at once and review parsed profiles before running analysis. |
| Head-to-Head Comparison | Inspect two candidates side-by-side with full score component and evidence breakdown. |

## Demo

### Screenshot

[CVInsight AI Dashboard](docs/media/image.png)

## Architecture

<img width="4190" height="2218" alt="architecture (2)" src="https://github.com/user-attachments/assets/29f8d5de-d5de-4f73-8fd2-61c7bf2f80e7" />


## Quick Start

### Windows (PowerShell)

```powershell
Set-Location "CVInsight-AI"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
$env:PYTHONPATH = "src"
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Open:

- Dashboard: `http://127.0.0.1:8001/`
- API Docs: `http://127.0.0.1:8001/docs`

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
PYTHONPATH=src uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

## API Documentation

Base URL:

`http://127.0.0.1:8001`

### Health Check

- `GET /v1/health`

### Analyze Text Candidates

- `POST /v1/analyze`
- Input: JSON payload with job context and candidate resume text blocks.

### Analyze Uploaded Resumes

- `POST /v1/analyze-files`
- Input: multipart form with `resumes`.

### Preview Uploaded Resume Profiles

- `POST /v1/preview-files`
- Input: multipart form with `resumes`.
- Output: per-file parse status, candidate name, years, and detected skills.

## Example Request Payload

```json
{
  "job_title": "Backend Python Engineer",
  "job_description": "Looking for Python, FastAPI, Docker, PostgreSQL, and AWS experience.",
  "role_family": "backend",
  "must_have_skills": ["python", "fastapi"],
  "nice_to_have_skills": ["aws"],
  "candidates": [
    {
      "name": "Alex",
      "resume_text": "Built Python APIs with FastAPI and Docker, deployed on AWS with PostgreSQL.",
      "years_experience": 4
    }
  ]
}
```

## Demo Data Included

- Job description: `demo_assets/job_descriptions/backend_python_senior_jd.txt`
- Realistic varied-size PDF resumes: `demo_assets/resumes_pdf/`
- Demo guide: `demo_assets/DEMO_RUN_GUIDE.md`

## Project Structure

```text
src/app/
  api/routes.py                # FastAPI endpoints
  services/scoring.py          # Ranking and weighted scoring logic
  services/skill_taxonomy.py   # Skill extraction + semantic adjacency
  services/resume_parser.py    # Resume parsing + profile extraction
  web/static/                  # Dashboard frontend
  schemas.py                   # Request/response models
  main.py                      # App entrypoint

demo_assets/
  job_descriptions/
  resumes/
  resumes_pdf/

portfolio_assets/              # Upwork case-study/demo/proposal assets
scripts/                       # Setup and demo utility scripts
tests/                         # Unit and endpoint tests
```

## Testing

```powershell
Set-Location "CVInsight-AI"
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH = "src"
pytest -q
```

## Troubleshooting

### Error: Failed to fetch

- Ensure backend is running.
- Open dashboard from the same origin (`http://127.0.0.1:8001/`).
- If using another frontend origin, set API base in browser console:

```javascript
localStorage.setItem("cvinsight_api_base", "http://127.0.0.1:8001");
```

## Roadmap

- Export shortlist reports (CSV/PDF)
- Authentication and team workspaces
- Project-level history and audit trail
- Configurable scoring templates per company
- ATS integration hooks

---

If this repository helps you, consider starring it.
