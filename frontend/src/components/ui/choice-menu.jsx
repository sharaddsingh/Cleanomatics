import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function ChoiceMenu({
  id,
  value,
  onChange,
  options,
  renderOption,
  disabled = false,
  ariaLabel,
  variant = "field",
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selected = options[selectedIndex];

  function content(opt) {
    return renderOption ? renderOption(opt.value) : opt.label;
  }

  function measure() {
    const el = rootRef.current?.querySelector(".choice-trigger");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minWidth = variant === "toolbar" ? 210 : rect.width;
    const width = Math.max(rect.width, minWidth);
    let left = variant === "toolbar" ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const estimated = options.length * 40 + 14;
    let top = rect.bottom + 6;
    if (top + estimated > window.innerHeight - 8 && rect.top > estimated) {
      top = Math.max(8, rect.top - estimated - 6);
    }
    setCoords({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    measure();
    function onPointerDown(event) {
      const target = event.target;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onReposition() {
      measure();
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, selectedIndex, options.length, variant]);

  function selectOption(index) {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onTriggerKeyDown(event) {
    if (disabled) return;
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(options.length - 1);
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "choice-menu",
        variant === "toolbar" && "choice-menu-toolbar",
        open && "choice-menu-open",
      )}
    >
      <button
        type="button"
        id={id}
        className="choice-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!open) measure();
          setOpen((was) => !was);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="choice-trigger-value">
          {selected ? content(selected) : null}
        </span>
        <ChevronDown size={15} className="choice-trigger-chevron" aria-hidden />
      </button>
      {open &&
        coords &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            data-choice-panel=""
            aria-label={ariaLabel}
            className="choice-panel"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              right: "auto",
              zIndex: 80,
              pointerEvents: "auto",
            }}
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isActive = index === activeIndex;
              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    id={`${id || listId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "choice-option",
                      isSelected && "is-selected",
                      isActive && "is-active",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(index)}
                  >
                    <span className="choice-option-label">{content(opt)}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        className="choice-option-check"
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
