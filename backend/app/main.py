from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.routes.tasks import router
from app.core.config import CORS_ORIGINS
from app.core.errors import TaskNotFoundError
from app.middleware.error_handler import (
    validation_error_handler, task_not_found_handler, unexpected_error_middleware,
)

app = FastAPI(title="Taskly API", version="1.0.0", description="In-memory task management. Data resets on restart.")
app.middleware("http")(unexpected_error_middleware)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS,
                   allow_credentials=False, allow_methods=["GET", "POST", "PUT", "DELETE"],
                   allow_headers=["Content-Type"])
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(TaskNotFoundError, task_not_found_handler)
app.include_router(router)


def custom_openapi():
    """Document the 400 validation contract instead of FastAPI's default 422."""
    if app.openapi_schema is None:
        schema = get_openapi(title=app.title, version=app.version,
                             description=app.description, routes=app.routes)
        for path in schema["paths"].values():
            for operation in path.values():
                responses = operation.get("responses", {})
                if "422" in responses:
                    responses.pop("422")
                    responses.setdefault("400", {
                        "description": "Invalid request data",
                        "content": {"application/json": {"schema": {
                            "$ref": "#/components/schemas/ValidationErrorResponse"
                        }}},
                    })
        app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi
