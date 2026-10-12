import React, { useMemo } from "react";

interface QrPlaceholderProps {
  seed: string;
  size?: number;
}

export const QrPlaceholder: React.FC<QrPlaceholderProps> = ({ seed, size = 96 }) => {
  const cells = useMemo(() => {
    // Deterministic pseudo-random pattern derived from the seed so the same
    // invoice/reference always renders the same "code".
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    const grid = 7;
    const values: boolean[] = [];
    for (let i = 0; i < grid * grid; i++) {
      hash = (hash * 1103515245 + 12345) >>> 0;
      values.push((hash >> 16) % 3 !== 0);
    }
    return { grid, values };
  }, [seed]);

  const cellSize = size / cells.grid;

  return (
    <div
      className="rounded-lg border border-surface-border p-2"
      style={{ width: size + 16, height: size + 16, backgroundColor: "#ffffff" }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {cells.values.map((filled, i) => {
          const x = (i % cells.grid) * cellSize;
          const y = Math.floor(i / cells.grid) * cellSize;
          return filled ? (
            <rect key={i} x={x} y={y} width={cellSize} height={cellSize} fill="#0E3B39" />
          ) : null;
        })}
        {/* corner markers to sell the "QR" look */}
        {[[0, 0], [size - cellSize * 2, 0], [0, size - cellSize * 2]].map(([cx, cy], idx) => (
          <g key={idx}>
            <rect x={cx} y={cy} width={cellSize * 2} height={cellSize * 2} fill="none" stroke="#0E3B39" strokeWidth={cellSize * 0.3} />
          </g>
        ))}
      </svg>
    </div>
  );
};
