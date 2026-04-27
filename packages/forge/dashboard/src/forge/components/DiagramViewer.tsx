import type { OutputArtifact } from "@/forge/types";
import { cn } from "@/lib/utils";

const ARCHITECTURE_LAYERS = [
  { number: 1, name: "Customer Interaction", keywords: ["customer interaction", "customer", "interaction", "ui", "portal", "citizen"] },
  { number: 2, name: "Intelligence and Orchestration", keywords: ["intelligence", "orchestration", "ai", "agent", "llm", "intelligence and orchestration"] },
  { number: 3, name: "API and Integration", keywords: ["api", "integration", "connector", "gateway", "rest", "api and integration"] },
  { number: 4, name: "Process and Governance", keywords: ["process", "governance", "workflow", "policy", "approval", "process and governance"] },
  { number: 5, name: "Data and Context", keywords: ["data", "context", "memory", "storage", "database", "data and context"] },
  { number: 6, name: "Module System", keywords: ["module", "system", "service", "infrastructure", "module system"] },
];

function isLayerImpacted(layerKeywords: string[], description: string): boolean {
  const lower = description.toLowerCase();
  return layerKeywords.some((kw) => lower.includes(kw));
}

export function DiagramViewer({ artifact }: { artifact: OutputArtifact }) {
  const description = artifact.description ?? "";

  return (
    <div className="h-full overflow-auto space-y-3 pr-1">
      <div className="space-y-2">
        {ARCHITECTURE_LAYERS.map((layer) => {
          const impacted = isLayerImpacted(layer.keywords, description);
          return (
            <div
              key={layer.number}
              className={cn(
                "rounded-[14px] border p-4 flex items-center gap-3 transition",
                impacted ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"
              )}
            >
              <div className="rounded-full bg-slate-950 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center shrink-0">
                {layer.number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{layer.name}</p>
                {impacted && (
                  <p className="mt-0.5 text-[11px] font-medium text-sky-600">Impacted by this story</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {artifact.codeSnippet && (
        <div className="bg-slate-50 rounded-[14px] p-4 text-sm font-mono text-slate-600 whitespace-pre-wrap leading-7">
          {artifact.codeSnippet}
        </div>
      )}
    </div>
  );
}
