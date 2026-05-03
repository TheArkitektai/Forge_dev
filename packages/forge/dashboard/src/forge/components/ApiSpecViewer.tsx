import type { OutputArtifact } from "@/forge/types";
import { cn } from "@/lib/utils";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | string;

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  POST: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  PATCH: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  DELETE: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

function methodColor(method: string): string {
  return METHOD_COLORS[method.toUpperCase()] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

type ParsedEndpoint = {
  method: HttpMethod;
  path: string;
};

/**
 * Very simple YAML path extractor — no external parser needed.
 * Looks for `paths:` block and reads indented path keys + method sub-keys.
 */
function extractEndpoints(yaml: string): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = [];
  const lines = yaml.split("\n");
  let inPaths = false;
  let currentPath: string | null = null;
  const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

  for (const line of lines) {
    const trimmed = line.trimEnd();

    if (/^paths\s*:/.test(trimmed)) {
      inPaths = true;
      continue;
    }

    if (inPaths) {
      // A top-level key (indented by 2 spaces) is a path
      const pathMatch = trimmed.match(/^  (\/[\w/{}\-.:]+)\s*:/);
      if (pathMatch) {
        currentPath = pathMatch[1];
        continue;
      }

      // A second-level key is a method
      if (currentPath) {
        const methodMatch = trimmed.match(/^    (\w+)\s*:/);
        if (methodMatch && HTTP_METHODS.has(methodMatch[1].toLowerCase())) {
          endpoints.push({ method: methodMatch[1].toUpperCase(), path: currentPath });
        }
      }

      // If we hit a new top-level key that isn't paths-related, stop
      if (/^\S/.test(trimmed) && trimmed !== "") {
        inPaths = false;
        currentPath = null;
      }
    }
  }

  return endpoints;
}

export function ApiSpecViewer({ artifact }: { artifact: OutputArtifact }) {
  if (!artifact.codeSnippet) {
    return (
      <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-slate-200">
        <p className="text-sm text-slate-500">API specification not available.</p>
      </div>
    );
  }

  const endpoints = extractEndpoints(artifact.codeSnippet);

  return (
    <div className="h-full overflow-auto space-y-4 pr-1">
      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
          Base URL: https://api.ndpp.gov.sa/v1
        </span>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
          Auth: Bearer Token
        </span>
      </div>

      {/* Endpoint summary */}
      {endpoints.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white divide-y divide-slate-100">
          {endpoints.map((ep, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  "w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold uppercase",
                  methodColor(ep.method)
                )}
              >
                {ep.method}
              </span>
              <code className="text-sm font-mono text-slate-800">{ep.path}</code>
            </div>
          ))}
        </div>
      )}

      {/* Raw YAML */}
      <div className="relative rounded-[14px] bg-slate-950 p-5 overflow-auto">
        <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/60">
          yaml
        </span>
        <pre className="font-mono text-sm leading-7 text-slate-200 whitespace-pre-wrap">{artifact.codeSnippet}</pre>
      </div>
    </div>
  );
}
