import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toDrawio } from "./toDrawio";
import type { XYFlowDocument } from "@shared/types/designArtifacts";

type ArtifactEntry = {
  typeId: string;
  label: string;
  renderer: "xyflow" | "plantuml" | "table" | "markdown";
  content: string;
  renderedSvg?: string;
};

function parseXYFlow(content: string): XYFlowDocument | null {
  try {
    const doc = JSON.parse(content) as XYFlowDocument;
    if (Array.isArray(doc.nodes) && Array.isArray(doc.edges)) return doc;
    return null;
  } catch {
    return null;
  }
}

export async function exportDesignPack(
  artifacts: ArtifactEntry[],
  projectName: string,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(projectName) ?? zip;

  for (const artifact of artifacts) {
    const baseName = artifact.typeId;

    if (artifact.renderer === "xyflow") {
      folder.file(`${baseName}.json`, artifact.content);
      const doc = parseXYFlow(artifact.content);
      if (doc) {
        folder.file(`${baseName}.drawio`, toDrawio(doc, artifact.label));
      }
    } else if (artifact.renderer === "plantuml") {
      folder.file(`${baseName}.puml`, artifact.content);
      if (artifact.renderedSvg) {
        folder.file(`${baseName}.svg`, artifact.renderedSvg);
      }
    } else if (artifact.renderer === "table") {
      folder.file(`${baseName}.json`, artifact.content);
    } else {
      folder.file(`${baseName}.md`, artifact.content);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${projectName}_Design_Pack.zip`);
}
