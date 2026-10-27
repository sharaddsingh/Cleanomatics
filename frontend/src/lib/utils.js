import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const statusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};
export function isOverdue(task, now = new Date()) {
  if (!task?.dueDate || task.status === "completed") return false;
  const due = String(task.dueDate).slice(0, 10);
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return due < today;
}

export const formatDate = (date) =>
  date
    ? new Date(
        date.length === 10 ? date + "T12:00:00" : date,
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
