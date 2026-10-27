import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDashed,
  Pencil,
  Trash2,
  CalendarDays,
  Plus,
  ListTodo,
  RefreshCw,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "../ui/button";
import { ChoiceMenu } from "../ui/choice-menu";
import { formatDate, isOverdue, statusLabels } from "../../lib/utils";
import {
  PRIORITY_FILTERS,
  SORT_OPTIONS,
  describeTaskView,
  filterAndSortTasks,
} from "../../lib/taskView";

function paginationItems(current, pages) {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }
  const visible = new Set([1, pages, current - 1, current, current + 1]);
  if (current <= 4) {
    [2, 3, 4, 5].forEach((page) => visible.add(page));
  }
  if (current >= pages - 3) {
    [pages - 1, pages - 2, pages - 3, pages - 4].forEach((page) =>
      visible.add(page),
    );
  }
  const sorted = [...visible]
    .filter((page) => page >= 1 && page <= pages)
    .sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push("gap");
    items.push(page);
  });
  return items;
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="badge-dot" />
      {statusLabels[status]}
    </span>
  );
}
export function OverdueBadge() {
  return <span className="badge badge-overdue">Overdue</span>;
}
export function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      <span className="priority-bars">
        <i />
        <i />
        <i />
      </span>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
export function TaskList({
  tasks,
  loading,
  error,
  refresh,
  search,
  clearSearch,
  filter,
  setFilter,
  completedPage,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onComplete,
}) {
  const [completingId, setCompletingId] = useState("");
  async function completeTask(task) {
    setCompletingId(task.id);
    try {
      await onComplete(task);
    } finally {
      setCompletingId("");
    }
  }
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [search, filter, priority, sort, completedPage]);
  const filtered = filterAndSortTasks(tasks, {
    status: filter,
    priority,
    sort,
    search,
    completedOnly: completedPage,
  });
  const viewLabel = describeTaskView({
    status: filter,
    priority,
    sort,
    completedOnly: completedPage,
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 6, current * 6);
  return (
    <section className="task-panel">
      <div className="panel-heading">
        <div>
          <h2>
            {completedPage ? "Completed tasks" : "Your tasks"}
            <span>{loading || error ? "—" : filtered.length}</span>
          </h2>
          <p>
            {completedPage
              ? "Review finished work across the workspace."
              : "Manage status, priority, and due dates in one place."}
          </p>
        </div>
        <Button variant="outline" onClick={onCreate}>
          <Plus size={16} />
          New task
        </Button>
      </div>
      <div className="task-toolbar">
        <div className="tabs" aria-label="Filter by status">
          {(completedPage
            ? ["all"]
            : ["all", "pending", "in_progress", "completed"]
          ).map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All tasks" : statusLabels[value]}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <div className="filter-field">
            <SlidersHorizontal size={15} aria-hidden />
            <ChoiceMenu
              variant="toolbar"
              ariaLabel="Filter by priority"
              value={priority}
              onChange={setPriority}
              options={PRIORITY_FILTERS}
              renderOption={(value) =>
                value === "all" ? (
                  "All priorities"
                ) : (
                  <PriorityBadge priority={value} />
                )
              }
            />
          </div>
          <div className="filter-field">
            <ArrowDownWideNarrow size={16} aria-hidden />
            <ChoiceMenu
              variant="toolbar"
              ariaLabel="Sort tasks"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>
      <p className="active-view" aria-live="polite">
        {viewLabel}
      </p>
      {loading ? (
        <div className="empty-state" role="status">
          <LoaderCircle className="spin" />
          <h3>Loading tasks</h3>
          <p>Fetching the latest data from the server.</p>
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <span className="empty-icon empty-icon-warn">
            <RefreshCw size={28} />
          </span>
          <h3>Connection issue</h3>
          <p>{error}</p>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw size={16} />
            Try again
          </Button>
        </div>
      ) : !visible.length ? (
        <div className="empty-state">
          <span className="empty-icon empty-icon-muted">
            <ListTodo size={30} />
          </span>
          <h3>{tasks.length ? "No matching tasks" : "No tasks yet"}</h3>
          <p>
            {tasks.length
              ? "Adjust search, filters, or sorting to see other items."
              : "Create your first task to populate the dashboard."}
          </p>
          {tasks.length ? (
            <Button
              variant="outline"
              onClick={() => {
                setPriority("all");
                setSort("newest");
                setFilter("all");
                clearSearch();
              }}
            >
              Reset filters
            </Button>
          ) : (
            <Button onClick={onCreate}>
              <Plus size={16} />
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due date</th>
                  <th>Created</th>
                  <th className="actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((task) => {
                  const Icon =
                    task.status === "completed"
                      ? CircleCheck
                      : task.status === "in_progress"
                        ? CircleDashed
                        : Circle;
                  const overdue = isOverdue(task);
                  return (
                    <tr key={task.id}>
                      <td>
                        <div className="task-name">
                          <Icon
                            size={19}
                            className={`task-indicator ${task.status}`}
                          />
                          <button onClick={() => onView(task.id)}>
                            <strong>{task.title}</strong>
                            <span>{task.description}</span>
                          </button>
                        </div>
                        {task.status !== "completed" && (
                          <button
                            className="complete-action"
                            aria-label={`Mark ${task.title} as completed`}
                            disabled={completingId === task.id}
                            onClick={() => completeTask(task)}
                          >
                            {completingId === task.id
                              ? "Saving..."
                              : "Mark as completed"}
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="status-cell">
                          <StatusBadge status={task.status} />
                          {overdue && <OverdueBadge />}
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        <span className={`date-cell${overdue ? " is-overdue" : ""}`}>
                          <CalendarDays size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                      </td>
                      <td className="created-cell">
                        {formatDate(task.createdAt)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${task.title}`}
                            onClick={() => onEdit(task)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-button delete-action"
                            aria-label={`Delete ${task.title}`}
                            onClick={() => onDelete(task)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mobile-task-list">
            {visible.map((task) => {
              const overdue = isOverdue(task);
              return (
              <article className="mobile-task" key={task.id}>
                <div className="mobile-task-top">
                  <span className="status-cell">
                    <StatusBadge status={task.status} />
                    {overdue && <OverdueBadge />}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <button
                  className="mobile-task-title"
                  onClick={() => onView(task.id)}
                >
                  {task.title}
                </button>
                <p>{task.description}</p>
                <div className="mobile-task-bottom">
                  <span className={overdue ? "is-overdue" : undefined}>
                    <CalendarDays size={14} />
                    {formatDate(task.dueDate)}
                  </span>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${task.title}`}
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <small>Created {formatDate(task.createdAt)}</small>
                {task.status !== "completed" && (
                  <button
                    className="complete-action"
                    aria-label={`Mark ${task.title} as completed`}
                    disabled={completingId === task.id}
                    onClick={() => completeTask(task)}
                  >
                    {completingId === task.id
                      ? "Saving..."
                      : "Mark as completed"}
                  </button>
                )}
              </article>
            );
            })}
          </div>
        </>
      )}
      <div className="table-footer">
        <span>
          {loading
            ? "Loading tasks..."
            : error
              ? "Tasks unavailable"
              : filtered.length
                ? `Showing ${(current - 1) * 6 + 1}–${Math.min(current * 6, filtered.length)} of ${filtered.length} tasks`
                : "No tasks to show"}
        </span>
        <nav className="pager" aria-label="Pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {paginationItems(current, pages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="pager-gap" aria-hidden>
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </section>
  );
}
