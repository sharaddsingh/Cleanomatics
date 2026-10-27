"""Adapt validated HTTP inputs to service operations and response models."""

from app.schemas.task_schema import DeleteTaskResponse, Task, TaskInput
from app.services import task_service


def list_tasks() -> list[Task]:
    return task_service.list_tasks()


def get_task(task_id: str) -> Task:
    return task_service.get_task(task_id)


def create_task(data: TaskInput) -> Task:
    return task_service.create_task(data)


def update_task(task_id: str, data: TaskInput) -> Task:
    return task_service.update_task(task_id, data)


def delete_task(task_id: str) -> DeleteTaskResponse:
    task_service.delete_task(task_id)
    return DeleteTaskResponse(message="Task deleted", id=task_id)
