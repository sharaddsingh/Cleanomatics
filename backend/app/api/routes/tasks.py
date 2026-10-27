from fastapi import APIRouter
from app.schemas.task_schema import Task, TaskInput, DeleteTaskResponse, ErrorResponse, ValidationErrorResponse
from app.controllers import task_controller as controller

router = APIRouter(prefix="/api/tasks", tags=["Tasks"], responses={
    500: {"model": ErrorResponse, "description": "Unexpected server error"},
})
NOT_FOUND = {404: {"model": ErrorResponse, "description": "Task not found"}}
INVALID_INPUT = {400: {"model": ValidationErrorResponse, "description": "Invalid request data"}}


@router.get("", response_model=list[Task])
def list_tasks():
    return controller.list_tasks()


@router.get("/{task_id}", response_model=Task, responses=NOT_FOUND)
def get_task(task_id: str):
    return controller.get_task(task_id)


@router.post("", response_model=Task, status_code=201, responses=INVALID_INPUT)
def create_task(data: TaskInput):
    return controller.create_task(data)


@router.put("/{task_id}", response_model=Task, responses={**NOT_FOUND, **INVALID_INPUT})
def update_task(task_id: str, data: TaskInput):
    return controller.update_task(task_id, data)


@router.delete("/{task_id}", response_model=DeleteTaskResponse, responses=NOT_FOUND)
def delete_task(task_id: str):
    return controller.delete_task(task_id)
