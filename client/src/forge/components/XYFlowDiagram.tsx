import { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import type { EdgeTypes } from "@xyflow/react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import "@xyflow/react/dist/style.css";

import { customNodeTypes } from "./nodes";
import { LabeledEdge } from "./edges/LabeledEdge";
import { applyDagreLayout } from "../layout/dagre";
import type { XYFlowDocument } from "@shared/types/designArtifacts";
import { cn } from "@/lib/utils";

const edgeTypes: EdgeTypes = { labeled: LabeledEdge };

type Props = {
  sourceContent: string;
  readOnly?: boolean;
  title?: string;
  className?: string;
};

function tryParseXYFlow(text: string): XYFlowDocument | null {
  try {
    const parsed = JSON.parse(text) as XYFlowDocument;
    if (Array.isArray(parsed.nodes)) {
      if (!Array.isArray(parsed.edges)) parsed.edges = [];
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function parseDocument(source: string): XYFlowDocument | null {
  // 1. Try direct parse
  const direct = tryParseXYFlow(source);
  if (direct) return direct;

  // 2. Strip code fences and try again
  const stripped = source.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
  const afterStrip = tryParseXYFlow(stripped);
  if (afterStrip) return afterStrip;

  // 3. Find the outermost { ... } block in the text
  const start = source.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) {
          const extracted = tryParseXYFlow(source.slice(start, i + 1));
          if (extracted) return extracted;
          break;
        }
      }
    }
  }
  console.warn("[XYFlowDiagram] Could not parse content:", source.slice(0, 200));
  return null;
}

export function XYFlowDiagram({ sourceContent, readOnly = false, title, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const doc = useMemo(() => parseDocument(sourceContent), [sourceContent]);

  const initialNodes = useMemo(() => {
    if (!doc) return [];
    const nodes = doc.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      width: n.width,
      height: n.height,
      parentId: n.parentId,
    }));
    // Always apply dagre — AI positions are unreliable and often overlap
    return applyDagreLayout(nodes, doc.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })));
  }, [doc]);

  const initialEdges = useMemo(() => {
    if (!doc) return [];
    return doc.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type ?? "default",
      label: e.label,
      animated: e.animated,
      data: e.data,
      markerEnd: { type: "arrowclosed" as const },
    }));
  }, [doc]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${title ?? "diagram"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silent fail
    }
  }, [title]);

  if (!doc) {
    return (
      <div className={cn("rounded-xl bg-slate-50 border border-slate-200 p-4", className)}>
        <p className="text-xs text-slate-500 mb-2">Raw content (not valid XYFlow JSON):</p>
        <pre className="text-[10px] text-slate-700 whitespace-pre-wrap overflow-auto max-h-64">{sourceContent}</pre>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-slate-200", className)} style={{ width: "100%", height: 400 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          nodeTypes={customNodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultViewport={doc.viewport ?? { x: 0, y: 0, zoom: 1 }}
        >
          <MiniMap zoomable pannable className="!bottom-2 !right-2" />
          <Controls className="!bottom-2 !left-2" />
          <Background variant={BackgroundVariant.Dots} gap={16} color="#e2e8f0" />
        </ReactFlow>
      </div>

      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-white transition z-10"
      >
        <Download className="size-3" />
        PNG
      </button>
    </div>
  );
}
