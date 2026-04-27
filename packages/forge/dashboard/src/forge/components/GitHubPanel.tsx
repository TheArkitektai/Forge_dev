import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, GitBranch, GitMerge, GitPullRequest, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { demoCommits, demoPullRequests, demoRepo, GITHUB_BASE_URL } from "@/forge/githubData";
import { cn } from "@/lib/utils";
import type { GitHubCommit, GitHubPullRequest } from "@/forge/types";

function demoGitHubToast(label: string) {
  toast.info(`GitHub — ${label}`, {
    description: "Live repository access is available in the full Arkitekt Forge deployment.",
    duration: 3000,
  });
}

type View = "commits" | "prs";

const prStatusStyles: Record<GitHubPullRequest["status"], string> = {
  open: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  merged: "bg-violet-50 text-violet-700 ring-violet-100",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const checkStatusIcons: Record<string, typeof CheckCircle2> = {
  passed: CheckCircle2,
  running: Loader2,
  failed: CheckCircle2,
};

function CommitRow({ commit }: { commit: GitHubCommit }) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{commit.message}</p>
        <button
          type="button"
          onClick={() => demoGitHubToast(`commit ${commit.shortSha}`)}
          className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-500 transition hover:border-sky-200 hover:text-sky-700"
        >
          {commit.shortSha}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span>{commit.author}</span>
        <span className="text-slate-300">·</span>
        <span>{commit.timestamp}</span>
        <span className="text-slate-300">·</span>
        <span className="text-emerald-600">+{commit.additions}</span>
        <span className="text-red-500">-{commit.deletions}</span>
        <span className="text-slate-300">·</span>
        <span>{commit.filesChanged} files</span>
      </div>
    </div>
  );
}

function PullRequestRow({ pr }: { pr: GitHubPullRequest }) {
  const [expanded, setExpanded] = useState(false);
  const passedCount = pr.checks.filter(c => c.status === "passed").length;
  const totalCount = pr.checks.length;
  const hasRunning = pr.checks.some(c => c.status === "running");

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white transition hover:border-sky-200">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => demoGitHubToast(`PR #${pr.number} — ${pr.title}`)}
            className="text-left text-sm font-semibold text-slate-900 hover:text-sky-700 line-clamp-1"
          >
            #{pr.number} {pr.title}
          </button>
          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1", prStatusStyles[pr.status])}>
            {pr.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
          <span>{pr.author}</span>
          <span className="text-slate-300">·</span>
          <span>{pr.branch}</span>
          <span className="text-slate-300">{"->"}</span>
          <span>{pr.targetBranch}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            {hasRunning ? (
              <Loader2 className="size-3.5 animate-spin text-amber-600" />
            ) : (
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            )}
            <span className={hasRunning ? "text-amber-700" : "text-emerald-700"}>
              {passedCount}/{totalCount} checks
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-700"
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {expanded ? "Hide checks" : "Show checks"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-3 pt-2 space-y-1.5">
              {pr.checks.map(check => {
                const Icon = checkStatusIcons[check.status] ?? CheckCircle2;
                return (
                  <div key={check.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{check.name}</span>
                    <div className="flex items-center gap-1">
                      <Icon className={cn("size-3.5", check.status === "passed" ? "text-emerald-600" : check.status === "running" ? "animate-spin text-amber-600" : "text-red-500")} />
                      <span className={check.status === "passed" ? "text-emerald-700" : check.status === "running" ? "text-amber-700" : "text-red-700"}>
                        {check.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Props = {
  defaultView?: View;
  maxItems?: number;
};

export function GitHubPanel({ defaultView = "commits", maxItems = 5 }: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const branches = ["all", ...demoRepo.branches];

  const filteredCommits = selectedBranch === "all"
    ? demoCommits
    : demoCommits.filter(c => c.branch === selectedBranch);

  const visibleCommits = showAll ? filteredCommits : filteredCommits.slice(0, maxItems);
  const visiblePRs = showAll ? demoPullRequests : demoPullRequests.slice(0, maxItems);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">GitHub integration</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">{demoRepo.owner}/{demoRepo.name}</h3>
        </div>
        <a
          href={GITHUB_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
        >
          <ExternalLink className="size-3.5" />
          Open repo
        </a>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <GitBranch className="size-3.5" />
        <span>{demoRepo.defaultBranch}</span>
        <span className="text-slate-300">·</span>
        <span>{demoRepo.branches.length} branches</span>
        <span className="text-slate-300">·</span>
        <span>Last push {demoRepo.lastPush}</span>
      </div>

      <div className="mt-4 flex gap-1">
        {(["commits", "prs"] as View[]).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => { setView(v); setShowAll(false); }}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              view === v
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
            )}
          >
            {v === "commits" ? <GitMerge className="size-3.5" /> : <GitPullRequest className="size-3.5" />}
            {v === "commits" ? "Commits" : "Pull requests"}
          </button>
        ))}
      </div>

      {view === "commits" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {branches.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => { setSelectedBranch(b); setShowAll(false); }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                selectedBranch === b
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
              )}
            >
              {b === "all" ? "All branches" : b}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {view === "commits"
          ? visibleCommits.map(commit => <CommitRow key={commit.sha} commit={commit} />)
          : visiblePRs.map(pr => <PullRequestRow key={pr.number} pr={pr} />)
        }
      </div>

      {(view === "commits" ? filteredCommits : demoPullRequests).length > maxItems && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-700"
        >
          {showAll ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {showAll ? "Show fewer" : `Show all ${(view === "commits" ? filteredCommits : demoPullRequests).length}`}
        </button>
      )}
    </div>
  );
}
