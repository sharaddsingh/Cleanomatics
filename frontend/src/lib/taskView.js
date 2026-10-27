export const PRIORITY_FILTERS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "due", label: "Due soonest" },
  { value: "due-latest", label: "Due latest" },
];

export function filterAndSortTasks(
  tasks,
  {
    status = "all",
    priority = "all",
    sort = "newest",
    search = "",
    completedOnly = false,
  } = {},
) {
  const query = search.trim().toLowerCase();
  const matched = tasks.filter((task) => {
    if (completedOnly && task.status !== "completed") return false;
    if (status !== "all" && task.status !== status) return false;
    if (priority !== "all" && task.priority !== priority) return false;
    if (
      query &&
      !`${task.title} ${task.description}`.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  const newestFirst = (a, b) =>
    b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

  return [...matched].sort((a, b) => {
    if (sort === "oldest") {
      return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
    }
    if (sort === "due" || sort === "due-latest") {
      const missing = sort === "due" ? "9999-99-99" : "0000-00-00";
      const dueOf = (task) => task.dueDate || missing;
      const byDue = dueOf(a).localeCompare(dueOf(b));
      return (sort === "due" ? byDue : -byDue) || newestFirst(a, b);
    }
    return newestFirst(a, b);
  });
}

export function describeTaskView({
  status = "all",
  priority = "all",
  sort = "newest",
  completedOnly = false,
}) {
  const statusText = completedOnly
    ? "Completed"
    : status === "all"
      ? "All statuses"
      : {
          pending: "Pending",
          in_progress: "In progress",
          completed: "Completed",
        }[status];
  const priorityText =
    priority === "all"
      ? "Any priority"
      : `${priority[0].toUpperCase()}${priority.slice(1)} priority`;
  const sortText =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Newest first";
  return `${statusText} · ${priorityText} · ${sortText}`;
}
