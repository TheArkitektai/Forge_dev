import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
} from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";

type Data = { protocol?: string; description?: string };

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  data,
  markerEnd,
  style,
}: EdgeProps) {
  const d = data as Data | undefined;
  const displayLabel = label ?? d?.protocol ?? d?.description;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white border border-slate-200 rounded-full px-2 py-0.5 text-[9px] font-medium text-slate-600 shadow-sm"
          >
            {displayLabel as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
