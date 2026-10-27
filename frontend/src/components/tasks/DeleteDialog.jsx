import { useState } from "react";
import { Trash2, LoaderCircle } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { errorMessage } from "../../services/taskApi";
export function DeleteDialog({ task, onClose, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    setBusy(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (e) {
      setError(errorMessage(e));
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
      title="Let this task go?"
      description="This will permanently delete the task from your workspace."
    >
      <div className="delete-body">
        <span className="delete-icon">
          <Trash2 size={25} />
        </span>
        <h3>{task.title}</h3>
        <p>This action cannot be undone.</p>
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
      </div>
      <div className="dialog-footer">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Keep task
        </Button>
        <Button variant="destructive" onClick={confirm} disabled={busy}>
          {busy && <LoaderCircle size={16} className="spin" />}Delete task
        </Button>
      </div>
    </Dialog>
  );
}
