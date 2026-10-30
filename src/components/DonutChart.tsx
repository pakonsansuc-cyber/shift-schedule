interface Segment {
  value: number;
  color: string;
  label: string;
}

interface Props {
  segments: Segment[];
  size?: number;
  thickness?: number;
}

/** A lightweight SVG donut chart. */
export function DonutChart({ segments, size = 108, thickness = 16 }: Props) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs =
    total > 0
      ? segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const frac = s.value / total;
            const dash = frac * circumference;
            const arc = {
              color: s.color,
              dasharray: `${dash} ${circumference - dash}`,
              dashoffset: -offset,
            };
            offset += dash;
            return arc;
          })
      : [];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={thickness}
      />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={thickness}
          strokeDasharray={a.dasharray}
          strokeDashoffset={a.dashoffset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${c} ${c})`}
        />
      ))}
      <text
        x={c}
        y={c}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-text"
        style={{ fontSize: size * 0.26, fontWeight: 700 }}
      >
        {total}
      </text>
    </svg>
  );
}
