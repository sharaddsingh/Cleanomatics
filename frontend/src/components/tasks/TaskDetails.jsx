import { useEffect, useState } from "react";
import { Pencil, Trash2, LoaderCircle } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { taskApi, errorMessage } from "../../services/taskApi";
import { formatDate, isOverdue } from "../../lib/utils";
import { StatusBadge, PriorityBadge, OverdueBadge } from "./TaskList";
export function TaskDetails({ id, onClose, onEdit, onDelete }) {
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    taskApi
      .get(id)
      .then((t) => {
        if (active) setTask(t);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Task details"
      description="Everything you need, in one place."
    >
      {error ? (
        <p role="alert" className="error-box">
          {error}
        </p>
      ) : !task ? (
        <div className="empty-state">
          <LoaderCircle className="spin" />
          Loading task...
        </div>
      ) : (
        <>
          <div className="details-body">
            <div className="details-badges">
              <StatusBadge status={task.status} />
              {isOverdue(task) && <OverdueBadge />}
              <PriorityBadge priority={task.priority} />
            </div>
            <h2>{task.title}</h2>
            <p className="full-description">{task.description}</p>
            <dl>
              <div>
                <dt>Due date</dt>
                <dd className={isOverdue(task) ? "is-overdue" : undefined}>
                  {formatDate(task.dueDate)}
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(task.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{new Date(task.updatedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Task ID</dt>
                <dd className="task-id">{task.id}</dd>
              </div>
            </dl>
          </div>
          <div className="dialog-footer">
            <Button
              variant="outline"
              className="danger-text"
              onClick={() => onDelete(task)}
            >
              <Trash2 size={16} />
              Delete
            </Button>
            <Button onClick={() => onEdit(task)}>
              <Pencil size={16} />
              Edit task
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
