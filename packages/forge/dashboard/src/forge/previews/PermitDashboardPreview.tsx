import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock, Circle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type PermitStatus = "Approved" | "Pending" | "Under Review" | "Rejected";

type Permit = {
  id: string;
  number: string;
  type: string;
  date: string;
  status: PermitStatus;
};

type View = "list" | "create" | "detail";

const PERMIT_TYPES = [
  "Building Permit",
  "Trade License Renewal",
  "Event Permit",
  "Commercial Activity License",
  "Construction Clearance",
] as const;

const INITIAL_PERMITS: Permit[] = [
  { id: "1", number: "P-2024-0891", type: "Building Permit", date: "2024-03-15", status: "Approved" },
  { id: "2", number: "P-2024-0892", type: "Trade License Renewal", date: "2024-03-16", status: "Pending" },
  { id: "3", number: "P-2024-0893", type: "Event Permit", date: "2024-03-17", status: "Under Review" },
  { id: "4", number: "P-2024-0894", type: "Commercial Activity License", date: "2024-03-18", status: "Approved" },
  { id: "5", number: "P-2024-0895", type: "Construction Clearance", date: "2024-03-19", status: "Rejected" },
];

function statusBadge(status: PermitStatus) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold";
  switch (status) {
    case "Approved":
      return <span className={cn(base, "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100")}>{status}</span>;
    case "Pending":
      return <span className={cn(base, "bg-amber-50 text-amber-700 ring-1 ring-amber-100")}>{status}</span>;
    case "Under Review":
      return <span className={cn(base, "bg-sky-50 text-sky-700 ring-1 ring-sky-100")}>{status}</span>;
    case "Rejected":
      return <span className={cn(base, "bg-red-50 text-red-700 ring-1 ring-red-100")}>{status}</span>;
  }
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function PermitDashboardPreview() {
  const [permits, setPermits] = useState<Permit[]>(INITIAL_PERMITS);
  const [view, setView] = useState<View>("list");
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  // Create form state
  const [permitType, setPermitType] = useState(PERMIT_TYPES[0]);
  const [description, setDescription] = useState("");

  // KPI counts
  const total = permits.length + 242;
  const pendingCount = permits.filter(p => p.status === "Pending").length;
  const approvedCount = permits.filter(p => p.status === "Approved").length;
  const rejectedCount = permits.filter(p => p.status === "Rejected").length;

  function handleRowClick(permit: Permit) {
    setSelectedPermit(permit);
    setView("detail");
  }

  function handleCreate() {
    const newPermit: Permit = {
      id: String(Date.now()),
      number: `P-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      type: permitType,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setPermits(prev => [newPermit, ...prev]);
    setPermitType(PERMIT_TYPES[0]);
    setDescription("");
    setView("list");
    toast.success("Permit application submitted successfully.");
  }

  function backToList() {
    setView("list");
    setSelectedPermit(null);
  }

  // Timeline helpers
  function timelineStepIcon(
    step: "submitted" | "review" | "decision",
    status: PermitStatus
  ) {
    if (step === "submitted") {
      return <CheckCircle2 className="size-5 text-emerald-600" />;
    }
    if (step === "review") {
      if (status === "Approved" || status === "Rejected") {
        return <CheckCircle2 className="size-5 text-emerald-600" />;
      }
      if (status === "Under Review") {
        return <Clock className="size-5 text-sky-500 animate-spin" style={{ animationDuration: "3s" }} />;
      }
      return <Circle className="size-5 text-slate-300" />;
    }
    // decision
    if (status === "Approved" || status === "Rejected") {
      return <CheckCircle2 className="size-5 text-emerald-600" />;
    }
    return <Circle className="size-5 text-slate-300" />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-[#1B2A4A] px-6 py-5">
        <h1 className="text-lg font-semibold text-white">Permit Management Dashboard</h1>
        <p className="mt-0.5 text-[12px] text-white/60">Ministry of Interior · NDPP Release 24.4</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              <KpiCard label="Total" value={total} />
              <KpiCard label="Pending" value={pendingCount} />
              <KpiCard label="Approved" value={approvedCount} />
              <KpiCard label="Rejected" value={rejectedCount} />
            </div>

            {/* Section header */}
            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Recent Applications</h2>
              <button
                type="button"
                onClick={() => setView("create")}
                className="flex items-center gap-1.5 rounded-[12px] bg-[#1B2A4A] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#243560]"
              >
                <Plus className="size-3.5" />
                Create New Permit
              </button>
            </div>

            {/* Table */}
            <div className="mt-3 overflow-hidden rounded-[16px] border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Number</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {permits.map((permit, i) => (
                    <tr
                      key={permit.id}
                      onClick={() => handleRowClick(permit)}
                      className={cn(
                        "cursor-pointer transition hover:bg-slate-50",
                        i !== permits.length - 1 && "border-b border-slate-100"
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-[12px] font-medium text-slate-700">{permit.number}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-700">{permit.type}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{permit.date}</td>
                      <td className="px-4 py-3">{statusBadge(permit.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CREATE VIEW ── */}
        {view === "create" && (
          <div>
            <button
              type="button"
              onClick={backToList}
              className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Back to list
            </button>

            <div className="rounded-[16px] border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">New Permit Application</h2>
              <p className="mt-1 text-[13px] text-slate-500">Fill in the details below to submit a new permit request.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                    Permit Type
                  </label>
                  <select
                    value={permitType}
                    onChange={e => setPermitType(e.target.value as typeof PERMIT_TYPES[number])}
                    className="w-full rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10"
                  >
                    {PERMIT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide any relevant details about this permit request..."
                    className="w-full resize-none rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1B2A4A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#243560]"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && selectedPermit && (
          <div>
            <button
              type="button"
              onClick={backToList}
              className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Back to list
            </button>

            <div className="rounded-[16px] border border-slate-200 bg-white p-6">
              {/* Heading */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[12px] font-medium text-slate-500">{selectedPermit.number}</p>
                  <h2 className="mt-0.5 text-base font-semibold text-slate-900">{selectedPermit.type}</h2>
                </div>
                {statusBadge(selectedPermit.status)}
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Application Timeline</p>

                <div className="space-y-0">
                  {/* Step 1: Submitted */}
                  <TimelineStep
                    icon={timelineStepIcon("submitted", selectedPermit.status)}
                    label="Submitted"
                    date={selectedPermit.date}
                    isLast={false}
                  />

                  {/* Step 2: Under Review */}
                  <TimelineStep
                    icon={timelineStepIcon("review", selectedPermit.status)}
                    label="Under Review"
                    date={
                      selectedPermit.status === "Under Review" ||
                      selectedPermit.status === "Approved" ||
                      selectedPermit.status === "Rejected"
                        ? selectedPermit.date
                        : "Pending"
                    }
                    isLast={false}
                  />

                  {/* Step 3: Decision */}
                  <TimelineStep
                    icon={timelineStepIcon("decision", selectedPermit.status)}
                    label="Decision"
                    date={
                      selectedPermit.status === "Approved"
                        ? `Approved · ${selectedPermit.date}`
                        : selectedPermit.status === "Rejected"
                          ? `Rejected · ${selectedPermit.date}`
                          : "Awaiting decision"
                    }
                    isLast
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  date,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  date: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Icon + connector line */}
      <div className="flex flex-col items-center">
        <div className="flex size-9 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200">
          {icon}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200" style={{ minHeight: 24 }} />}
      </div>

      {/* Text */}
      <div className={cn("pb-5", isLast && "pb-0")}>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-[12px] text-slate-500">{date}</p>
      </div>
    </div>
  );
}
