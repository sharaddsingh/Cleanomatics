import { NavLink } from "react-router-dom";
import {
  Check,
  LayoutDashboard,
  ListTodo,
  CircleCheck,
  Plus,
  Search,
  ArrowUpRight,
  Sprout,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../ui/button";
import { firstName, initials } from "../../lib/profile";
export function Layout({
  children,
  search,
  setSearch,
  onCreate,
  completed,
  total,
  pageTitle,
  theme,
  onToggleTheme,
  name,
  onEditName,
}) {
  const given = name ? firstName(name) : "";
  const mark = name ? initials(name) : "";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <Check size={24} strokeWidth={3} />
          </span>
          Taskly
        </NavLink>
        <div className="workspace">
          <span className="workspace-avatar">{mark || "—"}</span>
          <div>
            {given ? `${given}'s workspace` : "Your workspace"}
            <small>{name || "Add your name to begin"}</small>
          </div>
        </div>
        <span className="nav-label">NAVIGATION</span>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            <LayoutDashboard size={19} />
            Overview
          </NavLink>
          <NavLink to="/tasks" end>
            <ListTodo size={19} />
            All tasks<span className="nav-count">{total}</span>
          </NavLink>
          <NavLink to="/completed">
            <CircleCheck size={19} />
            Completed<span className="nav-count">{completed}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="gentle-card">
            <Sprout size={22} />
            <h3>Quick action</h3>
            <p>
              {given
                ? `Add the next task to ${given}'s list.`
                : "Add a task without leaving this view."}
            </p>
            <Button variant="ghost" onClick={onCreate}>
              New task <ArrowUpRight size={16} />
            </Button>
          </div>
          {name && (
            <button
              type="button"
              className="profile"
              onClick={onEditName}
              aria-label={`Signed in as ${name}. Change name`}
            >
              <span className="profile-avatar">{mark}</span>
              <div>
                {name}
                <small>Change your name</small>
              </div>
              <span className="online-dot" />
            </button>
          )}
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            {given ? `${given}'s workspace` : "Workspace"} <span>/</span>{" "}
            <strong>{pageTitle}</strong>
          </span>
          <div className="topbar-actions">
            <label className="search">
              <Search size={17} />
              <input
                aria-label="Search tasks"
                placeholder={
                  given ? `Search ${given}'s tasks...` : "Search tasks..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="search-hint">⌕</span>
            </label>
            <span className="topbar-divider" />
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-pressed={theme === "dark"}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {name && (
              <button
                type="button"
                className="profile-avatar small"
                onClick={onEditName}
                aria-label={`Signed in as ${name}. Change name`}
              >
                {mark}
              </button>
            )}
          </div>
        </header>
        <main>{children}</main>
        <footer>
          {name ? `Taskly · ${name}'s workspace` : "Taskly"}
          <span>
            REST API · React · FastAPI <Sprout size={14} />
          </span>
        </footer>
      </div>
      <Button
        className="mobile-create"
        onClick={onCreate}
        aria-label="Create task"
      >
        <Plus size={22} />
      </Button>
    </div>
  );
}
