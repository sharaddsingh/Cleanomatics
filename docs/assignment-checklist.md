# Assignment compliance review

Reviewed against the original Full-Stack Developer Assignment supplied on 27 October 2026.

| Requirement | Result and evidence |
| --- | --- |
| React or Next.js frontend | React + Vite; JSX components, React Router and hooks |
| Express or FastAPI backend | Python + FastAPI, explicitly allowed by the assignment |
| Backend in-memory storage only | Locked Python dictionary in `backend/app/storage/memory_store.py`; no database, Firebase, authentication, or browser task persistence |
| Dashboard and all required task fields | Responsive table/cards show title, description, status, priority, created date, and due date |
| Create, edit, view, delete | Real API calls, editable form, full-details modal, delete confirmation; browser tests pass |
| Required-field validation | Client-side title/description checks plus backend Pydantic validation |
| GET all / GET one | 200 on success; 404 for missing individual task |
| POST | 201 on success; 400 for invalid or malformed input |
| PUT / DELETE | 200 on success; 404 for missing task; invalid PUT is 400 |
| Task model | UUID, title, description, valid status/priority, nullable due date, UTC created/updated timestamps |
| Backend architecture | Separate routes → controllers → services → memory store; schemas and centralized error handling |
| CORS and configuration | Environment-based frontend origins; safe JSON error responses, including CORS on 500 responses |
| Reusable frontend and API layer | Focused components, Axios service, synchronized task hook; loading/error/empty/success states |
| Responsive behavior | Real browser checks at 320, 390, 768, 1024, and 1440 pixels, including long content |
| Documentation | Root/backend README, Windows commands, API schema at `/docs` and `/openapi.json`, environment examples |
| Screenshots | Desktop and mobile PNGs in `docs/` |
| Git + GitHub deliverable | `.gitignore` present; repository initialized with **no commits yet**. **Pending:** initial commit, GitHub remote, push, and submission URL |
| Postman collection | **Optional** — Swagger/OpenAPI at `/docs` satisfies “Postman **or** Swagger” |

## Optional bonuses

Implemented: search by title/description, combined status/priority filters, all three requested sort criteria, pagination, debounced search, dark mode (saved preference, system fallback), Swagger.

## Executed checks

- 19 backend tests passed.
- 9 browser tests passed against the real API.
- Production frontend build passed.
- Source formatting check passed.

The API is intentionally ephemeral and single-process. Backend changes take effect on restart, which clears tasks. The audit tests use independent servers; the user's running preview and its task data are not cleared. No production deployment, formal accessibility certification, or exhaustive performance audit is claimed.
