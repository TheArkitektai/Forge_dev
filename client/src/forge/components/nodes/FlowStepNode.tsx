import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string };

export function FlowStepNode({ data }: NodeProps) {
  const d = data as Data;
  return (
    <div className="bg-white border border-slate-200 rounded-full px-4 py-2 min-w-[120px] shadow-sm text-center">
      <Handle type="target" position={Position.Top} />
      <p className="text-[11px] font-semibold text-slate-800 leading-tight">{d.label}</p>
      {d.description && <p className="text-[9px] text-slate-500 mt-0.5">{d.description}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
