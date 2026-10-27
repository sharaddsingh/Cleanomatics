from datetime import datetime, timezone
from uuid import uuid4
from app.core.errors import TaskNotFoundError
from app.schemas.task_schema import Task, TaskInput
from app.storage.memory_store import tasks, lock


def list_tasks():
    with lock:
        return sorted(tasks.values(), key=lambda task: task.createdAt, reverse=True)


def get_task(task_id: str):
    with lock:
        if task_id not in tasks:
            raise TaskNotFoundError(task_id)
        return tasks[task_id]


def create_task(data: TaskInput):
    now = datetime.now(timezone.utc)
    task = Task(**data.model_dump(), id=str(uuid4()), createdAt=now, updatedAt=now)
    with lock:
        tasks[task.id] = task
    return task


def update_task(task_id: str, data: TaskInput):
    with lock:
        existing = get_task(task_id)
        task = Task(**data.model_dump(), id=task_id, createdAt=existing.createdAt,
                    updatedAt=datetime.now(timezone.utc))
        tasks[task_id] = task
        return task


def delete_task(task_id: str):
    with lock:
        get_task(task_id)
        del tasks[task_id]
