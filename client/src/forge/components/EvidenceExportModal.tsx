import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComplianceTemplate, EvidenceExportFormat, EvidenceScope } from "@/forge/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatIcons: Record<EvidenceExportFormat, typeof FileText> = {
  PDF: FileText,
  JSON: FileJson,
  CSV: FileSpreadsheet,
};

const templates: { key: ComplianceTemplate; label: string }[] = [
  { key: "PDPL", label: "PDPL (Saudi Personal Data)" },
  { key: "NCA_ECC", label: "NCA ECC (Cybersecurity Controls)" },
  { key: "SOC2", label: "SOC 2 Type II" },
  { key: "ISO_27001", label: "ISO 27001" },
  { key: "NDMO", label: "NDMO (Data Governance)" },
];

const scopes: { key: EvidenceScope; label: string; detail: string }[] = [
  { key: "story", label: "Current story", detail: "Evidence for the active story only" },
  { key: "project", label: "Current project", detail: "All stories and evidence in this project" },
  { key: "tenant", label: "Full tenant", detail: "Complete evidence across all projects" },
];

export function EvidenceExportModal({ open, onOpenChange }: Props) {
  const [format, setFormat] = useState<EvidenceExportFormat>("PDF");
  const [scope, setScope] = useState<EvidenceScope>("project");
  const [selectedTemplates, setSelectedTemplates] = useState<ComplianceTemplate[]>(["PDPL", "NCA_ECC"]);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const toggleTemplate = (key: ComplianceTemplate) => {
    setSelectedTemplates(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    );
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      toast.success("Evidence pack generated.");
    }, 3000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setExported(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-xl text-slate-950">
            Export evidence pack
          </DialogTitle>
        </DialogHeader>

        {exported ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">Export ready</p>
            <p className="mt-2 text-sm text-slate-600">Your {format} evidence pack has been generated successfully.</p>
            <div className="mt-6 flex gap-3">
              <Button
                className="flex items-center gap-2 bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => {}}
              >
                <Download className="size-4" />
                Download {format}
              </Button>
              <Button variant="outline" onClick={handleClose} className="border-slate-200 text-slate-700">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Format */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Export format</p>
              <div className="flex gap-2">
                {(["PDF", "JSON", "CSV"] as EvidenceExportFormat[]).map(f => {
                  const Icon = formatIcons[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-[14px] border py-3 text-sm font-semibold transition",
                        format === f
                          ? "border-slate-900 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
                      )}
                    >
                      <Icon className="size-4" />
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scope */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Scope</p>
              <div className="space-y-2">
                {scopes.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setScope(s.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left transition",
                      scope === s.key
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-sky-200"
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                      <p className="text-[11px] text-slate-500">{s.detail}</p>
                    </div>
                    <div className={cn(
                      "size-4 rounded-full border-2",
                      scope === s.key ? "border-slate-950 bg-slate-950" : "border-slate-300"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Compliance templates</p>
              <div className="space-y-2">
                {templates.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleTemplate(t.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[14px] border px-4 py-2.5 text-left transition",
                      selectedTemplates.includes(t.key)
                        ? "border-sky-200 bg-sky-50/60"
                        : "border-slate-200 bg-white hover:border-sky-100"
                    )}
                  >
                    <p className="text-sm text-slate-700">{t.label}</p>
                    <div className={cn(
                      "size-4 rounded border-2",
                      selectedTemplates.includes(t.key) ? "border-sky-600 bg-sky-600" : "border-slate-300"
                    )}>
                      {selectedTemplates.includes(t.key) && (
                        <svg viewBox="0 0 16 16" fill="none" className="size-3 text-white mx-auto">
                          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {exporting && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">Generating evidence pack</p>
                  <p className="text-sm text-slate-500">Please wait</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full bg-slate-950"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose} className="border-slate-200 text-slate-700">
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting || selectedTemplates.length === 0}
                className="bg-slate-950 text-white hover:bg-slate-800"
              >
                {exporting ? "Generating" : "Generate export"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
