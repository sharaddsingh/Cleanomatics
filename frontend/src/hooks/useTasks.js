import { useCallback, useEffect, useRef, useState } from "react";
import { taskApi, errorMessage } from "../services/taskApi";
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const refresh = useCallback(async (showLoading = true) => {
    const id = ++requestId.current;
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await taskApi.list();
      if (id === requestId.current) setTasks(data);
    } catch (e) {
      if (id === requestId.current) setError(errorMessage(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    return () => {
      requestId.current++;
    };
  }, [refresh]);
  const save = async (data, id) => {
    const task = id
      ? await taskApi.update(id, data)
      : await taskApi.create(data);
    requestId.current++;
    setLoading(false);
    setError("");
    setTasks((old) =>
      id ? old.map((t) => (t.id === id ? task : t)) : [task, ...old],
    );
    // Reconcile tasks from an initial request superseded by this save.
    void refresh(false);
    return task;
  };
  const remove = async (id) => {
    await taskApi.remove(id);
    requestId.current++;
    setLoading(false);
    setError("");
    setTasks((old) => old.filter((t) => t.id !== id));
    void refresh(false);
  };
  return { tasks, loading, error, refresh, save, remove };
}
