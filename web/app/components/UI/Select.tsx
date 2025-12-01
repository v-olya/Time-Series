
type SelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

export function Select({ id, label, value, onChange, options, disabled }: SelectProps) {
  const effectiveOptions = disabled
    ? [{ value: '', label: 'Nothing to select' }, ...options]
    : options;

  return (
    <div className="control-group">
      <select
        id={id}
        aria-label={label}
        value={disabled ? '' : value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {effectiveOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
