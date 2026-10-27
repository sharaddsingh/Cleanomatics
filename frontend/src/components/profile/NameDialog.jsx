import { useState } from "react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { normalizeName } from "../../lib/profile";

export function NameDialog({ open, name, onSave, onClose }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const editing = Boolean(name);

  function submit(event) {
    event.preventDefault();
    const next = normalizeName(value);
    if (!next) {
      setError("Enter your name to continue.");
      return;
    }
    if (next.length > 40) {
      setError("Use 40 characters or fewer.");
      return;
    }
    onSave(next);
  }

  return (
    <Dialog
      open={open}
      closable={editing}
      onOpenChange={(next) => {
        if (!next && editing) onClose();
      }}
      title={editing ? "Update your name" : "Welcome to Taskly"}
      description={
        editing
          ? "This name is used across your workspace in this browser."
          : "Tell us what to call you. Your name personalizes this workspace and stays in this browser."
      }
    >
      <form onSubmit={submit} noValidate>
        <div className="form-body">
          <label htmlFor="profile-name">
            Your name <span>*</span>
          </label>
          <input
            id="profile-name"
            name="name"
            autoFocus
            autoComplete="name"
            maxLength={40}
            placeholder="e.g. Sam Rivera"
            value={value}
            aria-invalid={!!error}
            aria-describedby={error ? "profile-name-error" : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
          />
          {error && (
            <p id="profile-name-error" className="field-error">
              {error}
            </p>
          )}
        </div>
        <div className="dialog-footer">
          {editing && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit">{editing ? "Save name" : "Continue"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
