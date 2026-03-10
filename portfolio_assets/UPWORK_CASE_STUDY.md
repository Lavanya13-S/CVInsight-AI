# CVInsight AI - Intelligent CV Analysis for Technical Hiring

## Project Summary

CVInsight AI is a multi-signal CV scoring and ranking platform built for technical role hiring. It processes batches of CVs in PDF, DOCX, or TXT format, builds structured candidate profiles automatically, and produces a ranked shortlist with full score breakdowns and skill-gap reports so teams can make faster, better-supported hiring decisions.

## Problem

Technical hiring pipelines slow down when evaluators apply inconsistent criteria across CVs. Keyword filters are too rigid and drop strong candidates with adjacent experience, while summary scores from black-box tools offer no evidence to defend shortlist choices to stakeholders.

## Solution

I designed and built a backend scoring engine and browser-based interface that:

- Accepts job descriptions and role-specific constraints (required, must-have, nice-to-have skills) as structured input.
- Parses CV files of any supported format directly, with no manual text preparation.
- Automatically extracts candidate name and seniority signals from CV content.
- Scores every candidate across five weighted dimensions:
  - core skill coverage
  - hard must-have constraints
  - nice-to-have bonus signals
  - years-of-experience depth
  - semantic proximity to adjacent technologies
- Returns structured evidence for every score: covered skills, gaps, near-match signals, strengths, and risk flags.

## Core Features

- Role-family scoring engine with distinct weights for backend, frontend, data/AI, DevOps, and fullstack profiles
- Hard-constraint enforcement ensuring must-have gaps are surfaced immediately
- Semantic adjacency matching that recovers candidates missed by exact-keyword filters
- Batch upload UI with live parse-status feedback and per-candidate profile cards
- Ranked leaderboard with visual score bars and per-dimension breakdowns
- Head-to-head candidate comparison panel for final shortlist decisions

## Technical Stack

- Python, FastAPI, Pydantic
- CV parsing: pypdf, python-docx
- Frontend: HTML/CSS/JS single-page dashboard
- Testing: pytest

## Business Value

- Shortlist generation time reduced from hours to minutes on batch CV volumes
- Every ranking decision backed by traceable evidence, not a black-box score
- Stronger candidate recall through skill proximity matching
- Workflow fits directly into startup, agency, and in-house HR team pipelines

## Demo Workflow (Short)

1. Enter a technical job description and specify must-have and nice-to-have skills.
2. Upload a batch of CV files in PDF, DOCX, or TXT format.
3. Review auto-generated candidate profile cards before running analysis.
4. Generate the ranked leaderboard and inspect score breakdowns.
5. Use the comparison panel to validate your final shortlist picks.

## Extension Roadmap

- ATS integration endpoints
- Role-scoped user accounts and audit history
- CSV and PDF shortlist export
- Collaborative annotation and notes per candidate
- Custom scoring weight templates per organization
