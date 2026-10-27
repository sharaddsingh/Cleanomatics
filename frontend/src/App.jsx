import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import { Layout } from "./components/layout/Layout";
import { TaskForm } from "./components/tasks/TaskForm";
import { TaskDetails } from "./components/tasks/TaskDetails";
import { DeleteDialog } from "./components/tasks/DeleteDialog";
import { Workspace } from "./pages/Workspace";
import { useTasks } from "./hooks/useTasks";
import { useTheme } from "./hooks/useTheme";
import { useProfile } from "./hooks/useProfile";
import { NameDialog } from "./components/profile/NameDialog";
import { firstName, readProfileName } from "./lib/profile";
export default function App() {
  const data = useTasks();
  const { theme, toggleTheme } = useTheme();
  const { name, saveName } = useProfile();
  const [askName, setAskName] = useState(() => !readProfileName());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    setFilter("all");
  }, [location.pathname]);
  useEffect(() => {
    document.title = name ? `Taskly — ${name}` : "Taskly — Task Management";
  }, [name]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const onCreate = () => setModal({ type: "form" });
  const onEdit = (task) => setModal({ type: "form", task });
  const onDelete = (task) => setModal({ type: "delete", task });
  const common = {
    ...data,
    search: debouncedSearch,
    clearSearch: () => setSearch(""),
    filter,
    setFilter,
    onCreate,
    onEdit,
    onDelete,
    onView: (id) => setModal({ type: "details", id }),
    onComplete: async (task) => {
      await data.save(
        {
          title: task.title,
          description: task.description,
          status: "completed",
          priority: task.priority,
          dueDate: task.dueDate,
        },
        task.id,
      );
      setNotice("Task marked as completed.");
    },
  };
  return (
    <Layout
      name={name}
      onEditName={() => setAskName(true)}
      theme={theme}
      onToggleTheme={toggleTheme}
      search={search}
      setSearch={setSearch}
      onCreate={onCreate}
      total={data.tasks.length}
      completed={data.tasks.filter((t) => t.status === "completed").length}
      pageTitle={
        location.pathname === "/completed"
          ? "Completed"
          : location.pathname === "/tasks"
            ? "All tasks"
            : "Overview"
      }
    >
      <Routes>
        <Route
          path="/"
          element={<Workspace mode="overview" name={name} {...common} />}
        />
        <Route
          path="/tasks"
          element={<Workspace mode="tasks" name={name} {...common} />}
        />
        <Route
          path="/completed"
          element={<Workspace mode="completed" name={name} {...common} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {modal?.type === "form" && (
        <TaskForm
          key={modal.task?.id || "new"}
          task={modal.task}
          onClose={() => setModal(null)}
          onSave={async (values, id) => {
            await data.save(values, id);
            setNotice(
              id ? "Task updated successfully." : "Task created successfully.",
            );
          }}
        />
      )}
      {modal?.type === "details" && (
        <TaskDetails
          id={modal.id}
          onClose={() => setModal(null)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteDialog
          task={modal.task}
          onClose={() => setModal(null)}
          onDelete={async (id) => {
            await data.remove(id);
            setNotice("Task deleted. A little more breathing room.");
          }}
        />
      )}
      {askName && (
        <NameDialog
          key={name || "welcome"}
          open
          name={name}
          onClose={() => setAskName(false)}
          onSave={(next) => {
            const editing = Boolean(name);
            saveName(next);
            setAskName(false);
            setNotice(
              editing ? "Name updated." : `Welcome, ${firstName(next)}.`,
            );
          }}
        />
      )}
      {notice && (
        <div role="status" className="toast">
          <CheckCircle2 size={19} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </Layout>
  );
}
