import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ReworkStatus = "draft" | "awaiting_review" | "approved" | "rejected" | "reworked" | "reworking";

type Props = {
  status: ReworkStatus;
  version?: number;
  className?: string;
};

export function ReworkBadge({ status, version, className }: Props) {
  if (status === "draft") {
    return (
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-slate-50 text-slate-600 ring-slate-200", className)}>
        Draft
      </span>
    );
  }

  if (status === "awaiting_review") {
    return (
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-amber-50 text-amber-700 ring-amber-100", className)}>
        Awaiting Review
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-emerald-50 text-emerald-700 ring-emerald-100", className)}>
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-red-50 text-red-700 ring-red-100", className)}>
        Rejected
      </span>
    );
  }

  if (status === "reworked") {
    return (
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-sky-50 text-sky-700 ring-sky-100", className)}>
        Reworked{version != null ? ` · v${version}` : ""}
      </span>
    );
  }

  return (
    <motion.span
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 bg-violet-50 text-violet-700 ring-violet-100", className)}
    >
      <span className="size-1.5 rounded-full bg-violet-500" />
      Agent Reworking...
    </motion.span>
  );
}
