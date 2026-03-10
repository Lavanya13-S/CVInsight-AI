# CVInsight AI - Product Execution Plan

## Phase 1: Scoring Engine Foundation (completed)

- FastAPI backend scaffold
- Five-dimension role-fit scoring output
- Skill taxonomy covering major technical hiring categories
- Unit test baseline
- venv-based setup and run scripts

## Phase 2: CV Intelligence Layer (implemented)

- PDF, DOCX, and TXT parsing into normalized candidate text
- Role-family scoring weights (backend, frontend, data_ai, devops, fullstack)
- Hard constraint enforcement for must-have skills
- Nice-to-have tiered scoring bands
- Structured per-candidate evidence fields in score response

## Phase 3: Hiring Dashboard UX

- Dashboard for job context entry and batch CV upload
- Candidate leaderboard with score component visuals
- Head-to-head candidate comparison panel
- Shortlist export to CSV and PDF

## Phase 4: Trust and Production Readiness

- Configurable bias-awareness flags and score transparency controls
- Role-scoped user accounts and persistent job history
- Pluggable storage layer (SQLite default, PostgreSQL upgrade path)
- Audit logs for all screening and shortlist decisions

## Phase 5: Portfolio and Market Packaging

- Case study with problem, approach, and outcome narrative
- Screenshots and capability highlights for Upwork portfolio
- Service tier definitions (basic, standard, premium)
- Proposal materials for HR teams and startup clients

## Success Metrics

- CV processing throughput: 100 files under 3 minutes (target)
- Ranking quality: stable top-5 relevance on held-out benchmark set
- Evidence coverage: every score accompanied by covered skills, gaps, and proximity signals
