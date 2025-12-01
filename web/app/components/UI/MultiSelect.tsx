import React, { useState, useRef, useEffect } from 'react';

type MultiSelectProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
};

export function MultiSelect({ id, label, value, onChange, options }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const toggleOption = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const removeBadge = (ev: React.MouseEvent, opt: string) => {
    ev.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className="control-group multi-select" ref={rootRef}>

      <div
        id={id}
        aria-label={label}
        className="ms-control"
        role="button"
        tabIndex={0}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((s) => !s);
          if (e.key === 'Escape') setOpen(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="ms-badges">
          {selectedLabels.length === 0 ? (
            <span className="ms-placeholder">Select…</span>
          ) : (
            selectedLabels.map((s) => (
              <span className="ms-badge" key={s.value} title={s.label.includes('(P)') ? 'Industry' : 'Retail'}>
                {s.label}
                <button
                  type="button"
                  className="ms-remove"
                  aria-label={`Remove ${s.label}`}
                  onClick={(ev) => removeBadge(ev, s.value)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className={`ms-caret ${open ? 'open' : ''}`} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden>
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {open && (
        <ul className="ms-dropdown" role="listbox" aria-multiselectable>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value.includes(opt.value)}
              className={`ms-option ${value.includes(opt.value) ? 'selected' : ''}`}
              onClick={() => toggleOption(opt.value)}
            >
              {opt.label}
              {value.includes(opt.value) && <span className="ms-check">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
