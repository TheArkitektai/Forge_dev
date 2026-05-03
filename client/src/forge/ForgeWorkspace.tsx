import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ForgeLayout } from "@/forge/ForgeLayout";
import { useForge } from "@/forge/context";
import { ArchitectureScreen } from "@/forge/screens/ArchitectureScreen";
import { CommandCenterScreen } from "@/forge/screens/CommandCenter";
import { ConfigStudioScreen } from "@/forge/screens/ConfigStudio";
import { ContextHubScreen } from "@/forge/screens/ContextHub";
import { DeliveryFlowScreen } from "@/forge/screens/DeliveryFlow";
import { GovernanceScreen } from "@/forge/screens/GovernanceScreen";
import { PortfolioScreen } from "@/forge/screens/PortfolioScreen";

import { OutputScreen } from "@/forge/screens/OutputScreen";
import type { ScreenKey } from "@/forge/types";

type ForgeWorkspaceProps = {
  screenKey: ScreenKey;
  routeStoryId?: string;
  routeArtifactId?: string;
};

const screenMeta: Record<ScreenKey, { title: string; summary: string }> = {
  portfolio: {
    title: "Portfolio",
    summary: "See every tenant, project, and release across the platform. Create new projects, switch workspaces, and track compounding value from institutional memory.",
  },
  command: {
    title: "Command Center",
    summary: "See the full operating picture with release posture, active story continuity, persona aware priorities, and system level confidence in one place.",
  },
  delivery: {
    title: "Delivery Flow",
    summary: "Move through planning, design, development, testing, and ship readiness while preserving the same story context across the product.",
  },
  context: {
    title: "Context Hub",
    summary: "Treat institutional memory as a native layer that adapts to persona and feeds the active story with patterns, lessons, and retained evidence.",
  },
  architecture: {
    title: "Architecture",
    summary: "Review the selected story through impacted layers, service boundaries, and design rationale without leaving the product workspace.",
  },
  governance: {
    title: "Governance",
    summary: "Keep approvals, evidence, policy posture, and release readiness visible as operational surfaces rather than after the fact reporting.",
  },
  config: {
    title: "Config Studio",
    summary: "Show how workflow, memory, proof, and policy can be configured from the interface and how those settings affect the rest of the platform.",
  },
  output: {
    title: "Output",
    summary: "View everything Forge tracked that was built: live previews, code artifacts, architecture documents, API specifications, test reports, and evidence packs.",
  },
  operate: {
    title: "Operate",
    summary: "Monitor production health, respond to incidents, capture operational lessons, and maintain service continuity.",
  },
};

export function ForgeWorkspace({ screenKey, routeStoryId, routeArtifactId }: ForgeWorkspaceProps) {
  const { getStoryById, selectedStory, setSelectedStoryId } = useForge();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (routeStoryId && getStoryById(routeStoryId)) {
      setSelectedStoryId(routeStoryId);
    }
  }, [getStoryById, routeStoryId, setSelectedStoryId]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 140);
    return () => window.clearTimeout(timer);
  }, [routeStoryId, screenKey]);

  const meta = screenMeta[screenKey] ?? screenMeta.portfolio;

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-[20px] border border-slate-200 bg-white/80" />
            <div className="h-[420px] animate-pulse rounded-[20px] border border-slate-200 bg-white/80" />
          </div>
          <div className="space-y-4">
            <div className="h-60 animate-pulse rounded-[20px] border border-slate-200 bg-white/80" />
            <div className="h-60 animate-pulse rounded-[20px] border border-slate-200 bg-white/80" />
          </div>
        </div>
      );
    }

    switch (screenKey) {
      case "portfolio":
        return <PortfolioScreen />;
      case "command":
        return <CommandCenterScreen />;
      case "delivery":
        return <DeliveryFlowScreen />;
      case "context":
        return <ContextHubScreen />;
      case "architecture":
        return <ArchitectureScreen />;
      case "governance":
        return <GovernanceScreen />;
      case "config":
        return <ConfigStudioScreen />;
      case "output":
        return <OutputScreen routeArtifactId={routeArtifactId} />;
      default:
        return null;
    }
  }, [isLoading, screenKey, routeArtifactId]);

  const summaryText = screenKey === "portfolio" || screenKey === "output"
    ? meta.summary
    : `${meta.summary} Active story: ${selectedStory?.title ?? "None"}.`;

  return (
    <ForgeLayout
      screenKey={screenKey}
      title={meta.title}
      summary={summaryText}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${screenKey}-${selectedStory?.id ?? "portfolio"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </ForgeLayout>
  );
}
