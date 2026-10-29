interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: Props) {
  return (
    <div className="relative sm:w-72">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาชื่อเพื่อนร่วมกะ…"
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-sm text-text placeholder:text-text-subtle shadow-sm focus-visible:border-accent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="ล้างการค้นหา"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-subtle hover:text-text"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
