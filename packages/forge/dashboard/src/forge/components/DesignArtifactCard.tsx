import type { DesignArtifact } from "@/forge/types";
import { ArrowRight, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  artifact: DesignArtifact;
  compact?: boolean; // compact mode for inline use in Architecture screen
};

/* ── Method badge colours ── */
const methodColours: Record<string, string> = {
  GET:    "bg-emerald-50 text-emerald-700 ring-emerald-100",
  POST:   "bg-sky-50 text-sky-700 ring-sky-100",
  PATCH:  "bg-amber-50 text-amber-700 ring-amber-100",
  DELETE: "bg-red-50 text-red-700 ring-red-100",
};

function getMethodColour(method: string) {
  return methodColours[method.toUpperCase()] ?? "bg-slate-100 text-slate-600 ring-slate-200";
}

/* ── Type label map ── */
const typeLabels: Record<string, string> = {
  user_flow:         "User Flow",
  component_diagram: "Component Diagram",
  api_contract:      "API Contract",
  data_model:        "Data Model",
  wireframe:         "Wireframe",
};

/* ── Renderers ── */

function UserFlowRenderer({
  steps,
  compact,
}: {
  steps: NonNullable<DesignArtifact["content"]["steps"]>;
  compact?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 flex-wrap">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-start gap-2">
          <div className="rounded-[14px] border border-slate-200 bg-white p-3 min-w-[100px] max-w-[160px]">
            <p className="text-sm font-semibold text-slate-900 leading-5">{step.label}</p>
            {!compact && (
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{step.description}</p>
            )}
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className="size-4 text-slate-400 shrink-0 mt-3.5" />
          )}
        </div>
      ))}
    </div>
  );
}

function ComponentDiagramRenderer({
  components,
  compact,
}: {
  components: NonNullable<DesignArtifact["content"]["components"]>;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {components.map((comp) => (
        <div key={comp.name} className="rounded-[14px] border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">{comp.name}</p>
          {!compact && (
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{comp.description}</p>
          )}
          {comp.connections.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Connects to
              </p>
              <div className="flex flex-wrap gap-1">
                {comp.connections.map((conn) => (
                  <span
                    key={conn}
                    className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700 ring-1 ring-sky-100"
                  >
                    {conn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ApiContractRenderer({
  endpoints,
  compact,
}: {
  endpoints: NonNullable<DesignArtifact["content"]["endpoints"]>;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {endpoints.map((ep, idx) => (
        <div
          key={`${ep.method}-${ep.path}-${idx}`}
          className="flex items-start gap-3 rounded-[14px] border border-slate-100 bg-white px-4 py-3"
        >
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 w-14 text-center shrink-0",
              getMethodColour(ep.method),
            )}
          >
            {ep.method.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-slate-900 font-semibold break-all">{ep.path}</p>
            {!compact && ep.description && (
              <p className="mt-0.5 text-sm text-slate-500">{ep.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DataModelRenderer({
  fields,
  compact,
}: {
  fields: NonNullable<DesignArtifact["content"]["fields"]>;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {fields.map((field) => (
        <div
          key={field.name}
          className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-white px-4 py-2.5"
        >
          <span className="text-sm font-semibold text-slate-900 flex-1 font-mono">{field.name}</span>
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700 ring-1 ring-sky-100">
            {field.type}
          </span>
          {!compact && (
            field.required ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100">
                required
              </span>
            ) : (
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                optional
              </span>
            )
          )}
        </div>
      ))}
    </div>
  );
}

function WireframeRenderer({ description }: { description: string }) {
  return (
    <div className="rounded-[14px] border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <Layers3 className="mx-auto mb-3 size-5 text-slate-400" />
      <p className="text-sm text-slate-500 leading-6">{description}</p>
    </div>
  );
}

/* ── Main component ── */

export function DesignArtifactCard({ artifact, compact }: Props) {
  const { type, content } = artifact;

  function renderContent() {
    switch (type) {
      case "user_flow":
        return content.steps && content.steps.length > 0 ? (
          <UserFlowRenderer steps={content.steps} compact={compact} />
        ) : (
          <p className="text-sm text-slate-500">{content.description}</p>
        );

      case "component_diagram":
        return content.components && content.components.length > 0 ? (
          <ComponentDiagramRenderer components={content.components} compact={compact} />
        ) : (
          <p className="text-sm text-slate-500">{content.description}</p>
        );

      case "api_contract":
        return content.endpoints && content.endpoints.length > 0 ? (
          <ApiContractRenderer endpoints={content.endpoints} compact={compact} />
        ) : (
          <p className="text-sm text-slate-500">{content.description}</p>
        );

      case "data_model":
        return content.fields && content.fields.length > 0 ? (
          <DataModelRenderer fields={content.fields} compact={compact} />
        ) : (
          <p className="text-sm text-slate-500">{content.description}</p>
        );

      case "wireframe":
        return <WireframeRenderer description={content.description} />;

      default:
        return <p className="text-sm text-slate-500">{content.description}</p>;
    }
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            {typeLabels[type] ?? type}
          </span>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
