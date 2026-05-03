import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckSquare,
  FileText,
  Loader2,
  Square,
  Upload,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForge } from "@/forge/context";
import type { ExtractedStoryCandidate } from "@/forge/types";
import { cn } from "@/lib/utils";

type DialogState = "picker" | "loading" | "preview";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const ACCEPTED_EXTS = ".pdf,.docx,.xlsx,.csv";

function titleSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const wa = new Set(norm(a));
  const wb = new Set(norm(b));
  if (wa.size === 0 && wb.size === 0) return 1;
  const inter = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return inter / union;
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function ImportStoriesDialog({ open, onOpenChange }: Props) {
  const { importStoriesFromCandidates, storyList } = useForge();

  const [dialogState, setDialogState] = useState<DialogState>("picker");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analysing document…");
  const [candidates, setCandidates] = useState<ExtractedStoryCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [truncated, setTruncated] = useState(false);
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setDialogState("picker");
    setDragOver(false);
    setError(null);
    setCandidates([]);
    setSelected(new Set());
    setTruncated(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Accepted formats: PDF, DOCX, XLSX, CSV.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setError(null);
    setDialogState("loading");
    setLoadingMessage("Extracting text from document…");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingMessage("Sending to AI for story extraction…");
      const res = await fetch("/api/story/extract-from-document", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const data: {
        candidates: Omit<ExtractedStoryCandidate, "potentialDuplicate">[];
        truncated: boolean;
        chunksProcessed: number;
        totalChunks: number;
      } = await res.json();

      const existingTitles = storyList.map(s => s.title);
      const withDupFlag: ExtractedStoryCandidate[] = data.candidates.map(c => ({
        ...c,
        potentialDuplicate: existingTitles.some(et => titleSimilarity(et, c.title) >= 0.8),
      }));

      setCandidates(withDupFlag);
      setTruncated(data.truncated);
      setChunksProcessed(data.chunksProcessed);
      setTotalChunks(data.totalChunks);

      // Pre-select all non-duplicates
      const preSelected = new Set<number>();
      withDupFlag.forEach((c, i) => { if (!c.potentialDuplicate) preSelected.add(i); });
      setSelected(preSelected);
      setDialogState("preview");
    } catch (err: unknown) {
      setDialogState("picker");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }, [storyList]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const toggleCandidate = useCallback((i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((_, i) => i)));
    }
  }, [candidates, selected.size]);

  const handleImport = useCallback(() => {
    const toImport = candidates.filter((_, i) => selected.has(i));
    importStoriesFromCandidates(toImport);
    handleClose();
  }, [candidates, selected, importStoriesFromCandidates, handleClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-[20px] border border-slate-200 bg-white p-0 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
              <Upload className="size-4 text-sky-600" />
            </span>
            <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Import from BRD / Document
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Picker state */}
        {dialogState === "picker" && (
          <div className="px-6 py-5 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS}
              className="hidden"
              onChange={handleFileInput}
            />
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
                dragOver
                  ? "border-sky-400 bg-sky-50/60"
                  : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50/80"
              )}
            >
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-400">
                <FileText className="size-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Drop a file or click to browse</p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOCX, XLSX, CSV — max 10 MB</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3">
                <AlertTriangle className="size-4 shrink-0 text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="rounded-[12px] border border-slate-100 bg-slate-50/60 px-4 py-3">
              <p className="text-[11px] text-slate-500">
                The AI will read your document and extract user stories automatically. You will preview and select which stories to import before anything is saved. The Planning Agent will not run on imported stories.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="rounded-full border-slate-200 text-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {dialogState === "loading" && (
          <div className="px-6 py-12 flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <Loader2 className="size-8 text-sky-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">{loadingMessage}</p>
              {chunksProcessed > 0 && (
                <p className="mt-1 text-xs text-slate-400">Processing chunk {chunksProcessed} of {totalChunks}</p>
              )}
            </div>
          </div>
        )}

        {/* Preview state */}
        {dialogState === "preview" && (
          <>
            <div className="px-6 pt-4 pb-2 space-y-3">
              {truncated && (
                <div className="flex items-start gap-2.5 rounded-[12px] border border-amber-100 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Document was too large — only the first {chunksProcessed * 6000} words were processed. Stories from later pages may be missing.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {candidates.length} {candidates.length === 1 ? "story" : "stories"} extracted
                </p>
                <button
                  onClick={toggleAll}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 transition"
                >
                  {selected.size === candidates.length ? "Deselect all" : "Select all"}
                </button>
              </div>
            </div>

            <div className="max-h-[340px] overflow-y-auto px-6 pb-4 space-y-2">
              {candidates.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleCandidate(i)}
                  className={cn(
                    "w-full text-left rounded-[14px] border p-3.5 transition-colors",
                    selected.has(i)
                      ? "border-sky-200 bg-sky-50/60"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 text-sky-500">
                      {selected.has(i)
                        ? <CheckSquare className="size-4" />
                        : <Square className="size-4 text-slate-300" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{c.title}</p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 shrink-0",
                          c.type === "bug"
                            ? "bg-red-50 text-red-700 ring-red-100"
                            : c.type === "chore"
                              ? "bg-slate-100 text-slate-600 ring-slate-200"
                              : "bg-sky-50 text-sky-700 ring-sky-100"
                        )}>
                          {c.type}
                        </span>
                        {c.potentialDuplicate && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-100 shrink-0">
                            Possible duplicate
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
              >
                <X className="size-3.5" />
                Try another file
              </button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleClose} className="rounded-full border-slate-200 text-slate-600">
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selected.size === 0}
                  className="rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Import {selected.size > 0 ? `${selected.size} ` : ""}
                  {selected.size === 1 ? "story" : "stories"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
