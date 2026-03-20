type AuthFieldProps = {
  label: string;
  name: string;
  type?: "date" | "email" | "number" | "password" | "text";
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function AuthField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  autoComplete,
  onChange,
}: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
        {label}
      </span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </label>
  );
}
