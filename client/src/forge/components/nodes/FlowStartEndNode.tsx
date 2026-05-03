import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; color?: string };

export function FlowStartEndNode({ data }: NodeProps) {
  const d = data as Data;
  const isEnd = d.label.toLowerCase().includes("end") || d.color === "red";
  const bg = isEnd ? "#ef4444" : "#22c55e";
  return (
    <div
      style={{ background: bg, color: "#fff", border: `2px solid ${isEnd ? "#b91c1c" : "#15803d"}` }}
      className="rounded-full w-12 h-12 flex items-center justify-center shadow-md"
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-[10px] font-bold text-center leading-tight">{d.label}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
