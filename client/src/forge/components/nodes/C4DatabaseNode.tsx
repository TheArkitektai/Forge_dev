import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string; technology?: string };

export function C4DatabaseNode({ data }: NodeProps) {
  const d = data as Data;
  return (
    <div className="relative min-w-[140px]">
      <Handle type="target" position={Position.Top} />
      {/* Cylinder top ellipse */}
      <div
        style={{ background: "#438dd5", border: "1px solid #2e6da8" }}
        className="h-3 rounded-[50%] w-full"
      />
      {/* Cylinder body */}
      <div
        style={{ background: "#438dd5", borderLeft: "1px solid #2e6da8", borderRight: "1px solid #2e6da8", color: "#fff" }}
        className="px-3 py-2"
      >
        <p className="text-[11px] font-bold leading-tight">{d.label}</p>
        {d.description && <p className="text-[9px] opacity-80 mt-0.5 leading-tight">{d.description}</p>}
        {d.technology && <p className="text-[9px] opacity-60 mt-0.5">[{d.technology}]</p>}
      </div>
      {/* Cylinder bottom ellipse */}
      <div
        style={{ background: "#438dd5", border: "1px solid #2e6da8" }}
        className="h-3 rounded-[50%] w-full"
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
