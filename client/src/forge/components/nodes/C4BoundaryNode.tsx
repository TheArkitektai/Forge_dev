import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string; width?: number; height?: number };

export function C4BoundaryNode({ data }: NodeProps) {
  const d = data as Data;
  return (
    <div
      style={{
        border: "2px dashed #94a3b8",
        background: "transparent",
        width: d.width ?? 300,
        height: d.height ?? 200,
        borderRadius: 12,
      }}
      className="relative"
    >
      <Handle type="target" position={Position.Top} />
      <p
        className="absolute top-2 left-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide"
      >
        {d.label}
      </p>
      {d.description && (
        <p className="absolute top-6 left-3 text-[9px] text-slate-400">{d.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
