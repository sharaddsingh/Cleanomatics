import {
  Layers,
  Clock3,
  CircleDashed,
  CircleCheck,
  ArrowUpRight,
} from "lucide-react";
const cards = [
  {
    key: "total",
    label: "Total tasks",
    icon: Layers,
    color: "stat-total",
    hint: "All items in workspace",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock3,
    color: "stat-pending",
    hint: "Not started yet",
  },
  {
    key: "in_progress",
    label: "In progress",
    icon: CircleDashed,
    color: "stat-progress",
    hint: "Currently active",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CircleCheck,
    color: "stat-done",
    hint: "Finished work",
  },
];
export function Summary({ tasks, loading, error, onFilter }) {
  return (
    <section className="summary-grid" aria-label="Task statistics">
      {cards.map(({ key, label, icon: Icon, color, hint }) => (
        <button
          key={key}
          className={`summary-card ${color}`}
          onClick={() => onFilter(key)}
        >
          <div className="summary-top">
            <span className="summary-icon">
              <Icon size={20} />
            </span>
            <ArrowUpRight className="summary-arrow" size={17} />
          </div>
          <div className="summary-value">
            {loading || error
              ? "—"
              : key === "total"
                ? tasks.length
                : tasks.filter((t) => t.status === key).length}
          </div>
          <h3>{label}</h3>
          <p>{hint}</p>
        </button>
      ))}
    </section>
  );
}
