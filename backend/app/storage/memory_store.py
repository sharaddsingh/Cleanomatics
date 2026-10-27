from threading import RLock
from app.schemas.task_schema import Task

# Single-process, ephemeral storage. All access goes through the service lock.
tasks: dict[str, Task] = {}
lock = RLock()
