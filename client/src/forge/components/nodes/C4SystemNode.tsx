import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string; technology?: string };

export function C4SystemNode({ data }: NodeProps) {
  const d = data as Data;
  return (
    <div
      style={{ background: "#1168bd", color: "#fff", border: "1px solid #0d4f96" }}
      className="rounded-lg px-3 py-2 min-w-[140px] shadow-md"
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-[11px] font-bold leading-tight">{d.label}</p>
      {d.description && <p className="text-[9px] opacity-80 mt-0.5 leading-tight">{d.description}</p>}
      {d.technology && <p className="text-[9px] opacity-60 mt-0.5">[{d.technology}]</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
