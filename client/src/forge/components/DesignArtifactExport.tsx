import { useRef } from "react";
import { Download, FileCode, FileImage, FileJson, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { downloadAsPng } from "../export/toPng";
import { toDrawio, svgToDrawio } from "../export/toDrawio";
import { saveAs } from "file-saver";
import type { XYFlowDocument } from "@shared/types/designArtifacts";

type Props = {
  title: string;
  renderer: "xyflow" | "plantuml" | "table" | "markdown";
  content: string;
  renderedSvg?: string;
  diagramRef?: React.RefObject<HTMLElement>;
};

function parseXYFlow(content: string): XYFlowDocument | null {
  try {
    const doc = JSON.parse(content) as XYFlowDocument;
    if (Array.isArray(doc.nodes)) {
      if (!Array.isArray(doc.edges)) doc.edges = [];
      return doc;
    }
    return null;
  } catch {
    return null;
  }
}

export function DesignArtifactExport({ title, renderer, content, renderedSvg, diagramRef }: Props) {
  const internalRef = useRef<HTMLDivElement>(null);

  const handlePng = async () => {
    const el = (diagramRef?.current ?? internalRef.current) as HTMLElement | null;
    if (el) await downloadAsPng(el, title);
  };

  const handleDrawio = () => {
    if (renderer === "xyflow") {
      const doc = parseXYFlow(content);
      if (!doc) return;
      const xml = toDrawio(doc, title);
      const blob = new Blob([xml], { type: "application/xml" });
      saveAs(blob, `${title}.drawio`);
    } else if (renderer === "plantuml") {
      const svg = renderedSvg ?? content;
      if (!svg) return;
      const xml = svgToDrawio(svg, title);
      const blob = new Blob([xml], { type: "application/xml" });
      saveAs(blob, `${title}.drawio`);
    }
  };

  const handleSvg = () => {
    const svg = renderedSvg ?? content;
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    saveAs(blob, `${title}.svg`);
  };

  const handleJson = () => {
    const blob = new Blob([content], { type: "application/json" });
    saveAs(blob, `${title}.json`);
  };

  const isXYFlow = renderer === "xyflow";
  const isPlantUML = renderer === "plantuml";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full border border-slate-200 hover:bg-slate-50"
        >
          <Download className="size-3.5 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-lg text-[11px]">
        {/* PNG — available for both xyflow and plantuml */}
        {(isXYFlow || isPlantUML) && (
          <DropdownMenuItem onClick={handlePng} className="gap-2 cursor-pointer">
            <Image className="size-3.5" /> PNG
          </DropdownMenuItem>
        )}
        {/* SVG — only for plantuml (already a vector render) */}
        {isPlantUML && (
          <DropdownMenuItem onClick={handleSvg} className="gap-2 cursor-pointer">
            <FileImage className="size-3.5" /> SVG
          </DropdownMenuItem>
        )}
        {/* Draw.io — xyflow exports native graph, plantuml embeds the SVG */}
        {(isXYFlow || isPlantUML) && (
          <DropdownMenuItem onClick={handleDrawio} className="gap-2 cursor-pointer">
            <FileCode className="size-3.5" /> Draw.io
          </DropdownMenuItem>
        )}
        {/* JSON — always available */}
        <DropdownMenuItem onClick={handleJson} className="gap-2 cursor-pointer">
          <FileJson className="size-3.5" /> JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
