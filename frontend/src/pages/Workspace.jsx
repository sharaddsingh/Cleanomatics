import {
  Plus,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Summary } from "../components/dashboard/Summary";
import { TaskList } from "../components/tasks/TaskList";
export function Workspace({
  mode,
  name,
  tasks,
  loading,
  error,
  onCreate,
  filter,
  setFilter,
  ...props
}) {
  const given = name ? name.trim().split(/\s+/)[0] : "";
  const completed = tasks.filter((t) => t.status === "completed").length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            TASK MANAGEMENT
          </div>
          <h1>
            {mode === "completed"
              ? given
                ? `${given}, your completed tasks`
                : "Completed tasks"
              : mode === "tasks"
                ? given
                  ? `${given}'s tasks`
                  : "All tasks"
                : given
                  ? `Hello, ${given}`
                  : "Dashboard"}
          </h1>
          <p>
            {mode === "completed"
              ? given
                ? `Work ${given} has already finished.`
                : "Tasks marked as completed."
              : mode === "tasks"
                ? given
                  ? `Everything currently on ${given}'s list.`
                  : "Every task in this workspace."
                : given
                  ? `Here is what is on ${given}'s list today.`
                  : "Overview of workload, filters, and task operations."}
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus size={18} />
          Create task
        </Button>
      </div>
      {mode === "overview" && (
        <>
          <div className="section-label">
            <span>At a glance</span>
            <span>
              <CalendarDays size={14} />
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <Summary
            tasks={tasks}
            loading={loading}
            error={error}
            onFilter={(key) => setFilter(key === "total" ? "all" : key)}
          />
          <div className="progress-banner">
            <span className="progress-emblem">
              <Sparkles size={23} />
            </span>
            <div className="progress-copy">
              <h3>
                {tasks.length && percent === 100
                  ? "All tasks completed"
                  : "Completion progress"}
              </h3>
              <p>
                {loading
                  ? "Calculating statistics..."
                  : error
                    ? "Unable to load progress until the API is available."
                    : tasks.length
                      ? `${completed} of ${tasks.length} tasks completed (${percent}%).`
                      : "No tasks yet. Create one to track progress here."}
              </p>
            </div>
            <div className="progress-meter">
              <div>
                <span>Your progress</span>
                <strong>{loading || error ? "—" : `${percent}%`}</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Tasks completed"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>
            <span className="banner-check">
              <Check size={18} />
            </span>
          </div>
        </>
      )}
      <TaskList
        {...props}
        tasks={tasks}
        loading={loading}
        error={error}
        onCreate={onCreate}
        filter={filter}
        setFilter={setFilter}
        completedPage={mode === "completed"}
      />
      <div className="bottom-note">
        <Sparkles size={14} />
        <span>
          Data is stored in backend memory and resets when the server restarts.
        </span>
        <ArrowUpRight size={14} />
      </div>
    </>
  );
}
