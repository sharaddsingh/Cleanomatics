# Taskly API

See [the root README](../README.md) for Windows setup, architecture, API examples, and tests.

Start from this directory: `.venv\Scripts\python -m uvicorn app.main:app --reload`

Swagger: http://127.0.0.1:8000/docs

The store is empty on startup and is lost on restart. Use a single worker. To add optional example tasks while the server is running, execute `.venv\Scripts\python seed_demo.py`.
