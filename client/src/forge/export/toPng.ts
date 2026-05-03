import { toPng as htmlToPng } from "html-to-image";

export async function downloadAsPng(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await htmlToPng(element, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });
  const link = document.createElement("a");
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
