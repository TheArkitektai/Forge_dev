import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string; color?: string };

export function StateNode({ data }: NodeProps) {
  const d = data as Data;
  const borderColor = d.color ?? "#6366f1";
  return (
    <div
      style={{ borderLeft: `4px solid ${borderColor}` }}
      className="bg-white border border-slate-200 rounded-lg pl-3 pr-4 py-2 min-w-[130px] shadow-sm"
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-[11px] font-semibold text-slate-800 leading-tight">{d.label}</p>
      {d.description && <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{d.description}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
