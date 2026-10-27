import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage.memory_store import tasks

client = TestClient(app)
VALID = {"title": "Ship the dashboard", "description": "Verify the complete workflow", "priority": "high"}


@pytest.fixture(autouse=True)
def clean_store():
    tasks.clear()
    yield
    tasks.clear()


def test_complete_lifecycle():
    assert client.get("/api/tasks").json() == []
    response = client.post("/api/tasks", json=VALID)
    assert response.status_code == 201
    task = response.json()
    assert task["createdAt"] == task["updatedAt"]
    assert task["dueDate"] is None
    assert task["status"] == "pending"
    assert client.get("/api/tasks").json() == [task]
    url = f'/api/tasks/{task["id"]}'
    assert client.get(url).json() == task
    changed = client.put(url, json={**VALID, "title": "Done", "status": "completed", "dueDate": "2026-10-28"})
    assert changed.status_code == 200
    assert changed.json()["title"] == "Done"
    assert changed.json()["status"] == "completed"
    assert changed.json()["createdAt"] == task["createdAt"]
    assert changed.json()["updatedAt"] > task["updatedAt"]
    assert changed.json()["dueDate"] == "2026-10-28"
    assert client.delete(url).status_code == 200
    assert client.get(url).status_code == 404
    assert client.get("/api/tasks").json() == []


@pytest.mark.parametrize("field,value", [("title", None), ("description", None),
    ("title", "   "), ("description", ""), ("status", "invalid"),
    ("priority", "urgent"), ("dueDate", "not-a-date"), ("title", "a" * 161)])
def test_invalid_input(field, value):
    data = {**VALID, field: value}
    if value is None:
        del data[field]
    response = client.post("/api/tasks", json=data)
    assert response.status_code == 400
    assert response.json()["errors"]
    assert not tasks


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_missing_task(method):
    kwargs = {"json": VALID} if method == "put" else {}
    response = getattr(client, method)("/api/tasks/missing", **kwargs)
    assert response.status_code == 404


def test_unique_ids_and_failed_update_preserves_task():
    first = client.post("/api/tasks", json=VALID).json()
    second = client.post("/api/tasks", json=VALID).json()
    assert first["id"] != second["id"]
    url = f'/api/tasks/{first["id"]}'
    assert client.put(url, json={**VALID, "status": "bad"}).status_code == 400
    assert client.get(url).json() == first


def test_cors_and_docs():
    response = client.options("/api/tasks", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert client.get("/docs").status_code == 200


def test_edit_all_fields_and_clear_due_date():
    created = client.post("/api/tasks", json={**VALID, "dueDate": "2026-10-05"}).json()
    url = f'/api/tasks/{created["id"]}'
    updated = client.put(url, json={"title": " Revised title ", "description": " Revised description ",
                                    "status": "in_progress", "priority": "low", "dueDate": None})
    assert updated.status_code == 200
    task = updated.json()
    assert task["title"] == "Revised title"
    assert task["description"] == "Revised description"
    assert task["priority"] == "low"
    assert task["status"] == "in_progress"
    assert task["dueDate"] is None
    assert task["id"] == created["id"]
    assert task["createdAt"] == created["createdAt"]


def test_malformed_json_and_server_owned_fields():
    malformed = client.post("/api/tasks", content='{bad', headers={"Content-Type": "application/json"})
    assert malformed.status_code == 400
    assert malformed.json()["errors"]
    assert client.post("/api/tasks", json={**VALID, "id": "supplied-id"}).status_code == 400


def test_swagger_matches_actual_error_contract():
    schema = client.get("/openapi.json").json()
    for path in schema["paths"].values():
        for operation in path.values():
            assert "422" not in operation["responses"]
    responses = schema["paths"]["/api/tasks"]["post"]["responses"]
    assert "201" in responses and "400" in responses
    assert client.get("/api/tasks/not-found").json() == {"message": "Task not found"}


def test_unexpected_errors_are_sanitized(monkeypatch):
    from app.services import task_service

    def fail():
        raise RuntimeError("Private implementation details")

    monkeypatch.setattr(task_service, "list_tasks", fail)
    with TestClient(app, raise_server_exceptions=False) as error_client:
        response = error_client.get("/api/tasks", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 500
    assert response.json() == {"message": "Something went wrong. Please try again."}
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_unlisted_cors_origin_is_rejected():
    response = client.options("/api/tasks", headers={
        "Origin": "https://unlisted.example", "Access-Control-Request-Method": "POST",
    })
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
