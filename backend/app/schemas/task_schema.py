from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class TaskInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=5000)
    status: Literal["pending", "in_progress", "completed"] = "pending"
    priority: Literal["low", "medium", "high"] = "medium"
    dueDate: date | None = None


class Task(TaskInput):
    id: str
    createdAt: datetime
    updatedAt: datetime


class DeleteTaskResponse(BaseModel):
    message: str
    id: str


class ValidationIssue(BaseModel):
    field: str
    message: str


class ValidationErrorResponse(BaseModel):
    message: str
    errors: list[ValidationIssue]


class ErrorResponse(BaseModel):
    message: str
