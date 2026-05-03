import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  source: string;
  readOnly?: boolean;
  title?: string;
  className?: string;
};

export function PlantUMLDiagram({ source, title, className }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!source.trim()) return;

    // If we already have a rendered SVG (starts with SVG/XML markers), use it directly
    const trimmed = source.trim();
    if (trimmed.startsWith("<svg") || trimmed.startsWith("<?xml") || trimmed.startsWith("<?plantuml")) {
      setSvg(trimmed);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/plantuml/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Render failed (${r.status})`);
        return r.json() as Promise<{ svg: string }>;
      })
      .then(data => {
        if (!cancelled) setSvg(data.svg);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Render failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [source]);

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title ?? "diagram"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50", className)} style={{ minHeight: 200 }}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-6 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-500">Rendering diagram…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-xl border border-slate-200 bg-slate-50 p-4", className)}>
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">PlantUML server unavailable — showing source</p>
        </div>
        <pre className="text-[10px] text-slate-600 whitespace-pre-wrap overflow-auto max-h-64">{source}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={cn("rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center", className)}>
        <p className="text-xs text-slate-400">No diagram source</p>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl border border-slate-200 overflow-hidden bg-white", className)}>
      <div
        className="p-4 overflow-auto"
        style={{ maxHeight: 400 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-white transition"
      >
        <Download className="size-3" />
        SVG
      </button>
    </div>
  );
}
