"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

const COLORS = [
  "#15803d", "#b45309", "#0369a1", "#7c3aed",
  "#be123c", "#0f766e", "#a16207",
];

export function NetWorthChart({ byType }: { byType: Record<string, number> }) {
  const data = Object.entries(byType)
    .map(([type, value]) => ({
      name: ASSET_TYPE_LABELS[type as AssetType] ?? type,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted">
        Add an asset to see your breakdown here.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
