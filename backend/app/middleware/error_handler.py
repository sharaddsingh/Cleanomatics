import logging
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.errors import TaskNotFoundError


async def task_not_found_handler(request: Request, exc: TaskNotFoundError):
    return JSONResponse(status_code=404, content={"message": "Task not found"})


async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(part) for part in error["loc"]),
               "message": error["msg"]} for error in exc.errors()]
    return JSONResponse(status_code=400, content={"message": "Please check your input", "errors": errors})


async def server_error_handler(request: Request, exc: Exception):
    logging.exception("Unhandled API error", exc_info=exc)
    return JSONResponse(status_code=500, content={"message": "Something went wrong. Please try again."})


async def unexpected_error_middleware(request: Request, call_next):
    # Return errors inside CORSMiddleware so allowed frontend origins can read them.
    try:
        return await call_next(request)
    except Exception as exc:
        return await server_error_handler(request, exc)
