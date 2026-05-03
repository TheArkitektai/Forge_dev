import type { XYFlowDocument } from "@shared/types/designArtifacts";

export function svgToDrawio(svgContent: string, title = "diagram"): string {
  const encoded = encodeURIComponent(svgContent);
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="24.0.0">
  <diagram name="${title.replace(/"/g, "&quot;")}">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="2" value="" style="shape=image;verticalLabelPosition=bottom;labelBackgroundColor=none;verticalAlign=top;align=center;strokeColor=none;fillColor=none;image;image=data:image/svg+xml,${encoded};" vertex="1" parent="1">
          <mxGeometry x="0" y="0" width="800" height="600" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const NODE_STYLE_MAP: Record<string, string> = {
  c4System: "rounded=1;whiteSpace=wrap;html=1;fillColor=#1168bd;strokeColor=#0d4f96;fontColor=#ffffff;",
  c4Container: "rounded=1;whiteSpace=wrap;html=1;fillColor=#438dd5;strokeColor=#2e6da8;fontColor=#ffffff;",
  c4Component: "rounded=1;whiteSpace=wrap;html=1;fillColor=#85bbf0;strokeColor=#5a9fd4;fontColor=#1a1a2e;",
  c4Database: "shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#438dd5;strokeColor=#2e6da8;fontColor=#ffffff;",
  c4Boundary: "points=[[0,0,0],[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[1,1,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];shape=mxgraph.lean_mapping.electronic_info_flow_edge;dashed=1;strokeColor=#94a3b8;fillColor=none;",
  flowStep: "rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;",
  flowDecision: "rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;",
  flowStartEnd: "ellipse;whiteSpace=wrap;html=1;fillColor=#22c55e;strokeColor=#15803d;fontColor=#ffffff;",
  stateNode: "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6366f1;strokeWidth=2;",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function toDrawio(doc: XYFlowDocument, title = "diagram"): string {
  const cells: string[] = [
    `<mxCell id="0" />`,
    `<mxCell id="1" parent="0" />`,
  ];

  for (const node of doc.nodes) {
    const style = NODE_STYLE_MAP[node.type] ?? "rounded=1;whiteSpace=wrap;html=1;";
    const x = node.position.x;
    const y = node.position.y;
    const w = node.width ?? 180;
    const h = node.height ?? 60;
    const label = escapeXml(node.data.label ?? "");
    cells.push(
      `<mxCell id="${node.id}" value="${label}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" /></mxCell>`
    );
  }

  for (const edge of doc.edges) {
    const label = escapeXml((edge.label as string | undefined) ?? "");
    cells.push(
      `<mxCell id="${edge.id}" value="${label}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;" edge="1" source="${edge.source}" target="${edge.target}" parent="1"><mxGeometry relative="1" as="geometry" /></mxCell>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="24.0.0">
  <diagram name="${escapeXml(title)}">
    <mxGraphModel dx="1000" dy="760" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        ${cells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}
