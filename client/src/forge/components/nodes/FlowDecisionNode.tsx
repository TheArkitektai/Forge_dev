import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

type Data = { label: string; description?: string };

export function FlowDecisionNode({ data }: NodeProps) {
  const d = data as Data;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 60 }}>
      <Handle type="target" position={Position.Top} />
      <div
        className="absolute inset-0 bg-amber-100 border border-amber-300"
        style={{ transform: "rotate(45deg)", borderRadius: 4 }}
      />
      <div className="relative z-10 text-center px-2">
        <p className="text-[10px] font-semibold text-amber-900 leading-tight">{d.label}</p>
        {d.description && <p className="text-[8px] text-amber-700 mt-0.5">{d.description}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" id="yes" position={Position.Right} />
      <Handle type="source" id="no" position={Position.Left} />
    </div>
  );
}
