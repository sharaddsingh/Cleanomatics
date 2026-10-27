import { useState } from "react";
import { LoaderCircle, Plus, Check } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { errorMessage } from "../../services/taskApi";
import { ChoiceMenu } from "../ui/choice-menu";
import { PriorityBadge, StatusBadge } from "./TaskList";

const STATUS_OPTIONS = [
  { value: "pending" },
  { value: "in_progress" },
  { value: "completed" },
];

const PRIORITY_OPTIONS = [
  { value: "low" },
  { value: "medium" },
  { value: "high" },
];
export function TaskForm({ task, onClose, onSave }) {
  const [values, setValues] = useState(
    task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate || "",
        }
      : {
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          dueDate: "",
        },
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const update = (e) =>
    setValues((old) => ({ ...old, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.title.trim()) next.title = "Give your task a title.";
    if (!values.description.trim())
      next.description = "Add a description for your task.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFailure("");
    try {
      await onSave(
        {
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          dueDate: values.dueDate || null,
        },
        task?.id,
      );
      onClose();
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title={task ? "Edit task" : "A fresh start, a new task"}
      description={
        task
          ? "A small update to keep things moving."
          : "Make a little room for your next big idea."
      }
    >
      <form onSubmit={submit} noValidate>
        <div className="form-body">
          <label htmlFor="title">
            Task title <span>*</span>
          </label>
          <input
            className="form-control"
            id="title"
            name="title"
            autoFocus
            placeholder="What would you like to get done?"
            value={values.title}
            onChange={update}
            maxLength={160}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="field-error">
              {errors.title}
            </p>
          )}
          <label htmlFor="description">
            Description <span>*</span>
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            placeholder="Add the details, a little context, or a plan..."
            rows={4}
            value={values.description}
            onChange={update}
            maxLength={5000}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          {errors.description && (
            <p id="description-error" className="field-error">
              {errors.description}
            </p>
          )}
          <div className="form-row">
            <div>
              <label htmlFor="status">Status</label>
              <ChoiceMenu
                id="status"
                value={values.status}
                onChange={(status) =>
                  setValues((old) => ({ ...old, status }))
                }
                options={STATUS_OPTIONS}
                renderOption={(status) => <StatusBadge status={status} />}
              />
            </div>
            <div>
              <label htmlFor="priority">Priority</label>
              <ChoiceMenu
                id="priority"
                value={values.priority}
                onChange={(priority) =>
                  setValues((old) => ({ ...old, priority }))
                }
                options={PRIORITY_OPTIONS}
                renderOption={(priority) => (
                  <PriorityBadge priority={priority} />
                )}
              />
            </div>
          </div>
          <label htmlFor="dueDate">
            Due date <small>optional</small>
          </label>
          <input
            className="form-control form-date"
            type="date"
            id="dueDate"
            name="dueDate"
            value={values.dueDate}
            onChange={update}
          />
          {failure && (
            <p role="alert" className="error-box">
              {failure}
            </p>
          )}
        </div>
        <div className="dialog-footer">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={16} className="spin" />
            ) : task ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}{" "}
            {busy ? "Saving..." : task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
