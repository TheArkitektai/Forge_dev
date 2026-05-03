import type {
  ArtifactTypeConfig,
  ArtifactTypeId,
  ArtifactStatus,
  StakeholderViewId,
  StoryDesignArtifact,
} from "./types";
import type {
  ProjectDesignArtifact,
  EpicDesignArtifact,
} from "@shared/types/designArtifacts";

export const artifactRegistry: ArtifactTypeConfig[] = [
  // ── Project-scope (Architecture Screen) ────────────────────────────────────
  {
    id: "solution-architecture",
    label: "Solution Architecture",
    description: "High-level system overview — problem statement, key decisions, and strategic trade-offs",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: [],
    mandatory: true,
    scope: "project",
    renderer: "xyflow",
    stakeholderViews: ["cto", "product", "engineer"],
    agentName: "Architecture Agent",
  },
  {
    id: "deployment-architecture",
    label: "Deployment Architecture",
    description: "Infrastructure topology — cloud regions, services, and data flows",
    outputType: "mermaid",
    contextPassMode: "raw",
    prerequisites: [],
    mandatory: true,
    scope: "project",
    renderer: "xyflow",
    stakeholderViews: ["devops", "cto", "security"],
    agentName: "Architecture Agent",
  },
  {
    id: "security-architecture",
    label: "Security Architecture",
    description: "Threat model, trust boundaries, and security controls",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: [],
    mandatory: true,
    scope: "project",
    renderer: "plantuml",
    stakeholderViews: ["security", "cto"],
    agentName: "Security Agent",
  },
  {
    id: "compliance-mapping",
    label: "Compliance Mapping",
    description: "Regulatory requirement coverage — PDPL, NCA ECC, ISO 27001",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: [],
    mandatory: false,
    scope: "project",
    renderer: "table",
    stakeholderViews: ["cto", "security"],
    agentName: "Compliance Agent",
  },
  {
    id: "technology-stack",
    label: "Technology Stack",
    description: "Language, framework, database, and infrastructure decisions with rationale",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: [],
    mandatory: false,
    scope: "project",
    renderer: "markdown",
    stakeholderViews: ["cto", "engineer", "devops"],
    agentName: "Architecture Agent",
  },

  // ── Epic-scope (Architecture Screen / Epic Panel) ───────────────────────────
  {
    id: "component-architecture",
    label: "Component Architecture",
    description: "Service and component boundaries for this epic",
    outputType: "mermaid",
    contextPassMode: "raw",
    prerequisites: [],
    mandatory: true,
    scope: "epic",
    renderer: "xyflow",
    stakeholderViews: ["cto", "engineer", "devops"],
    agentName: "Architecture Agent",
  },
  {
    id: "api-design",
    label: "API Design",
    description: "REST endpoint contract — paths, methods, and payload summaries",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: [],
    mandatory: true,
    scope: "epic",
    renderer: "table",
    stakeholderViews: ["engineer", "product"],
    agentName: "Architecture Agent",
  },

  // ── Story-scope (Story Design Phase) ───────────────────────────────────────
  // Layer 0 — Foundation (no prerequisites)
  {
    id: "user-flow",
    label: "User Flow",
    description: "End-to-end user journey as an interactive flow diagram",
    outputType: "text",
    contextPassMode: "raw",
    prerequisites: [],
    mandatory: true,
    scope: "story",
    renderer: "xyflow",
    stakeholderViews: ["product", "engineer"],
    agentName: "Design Agent",
  },

  // Layer 1 — depends on user-flow
  {
    id: "technical-architecture",
    label: "Technical Architecture",
    description: "Full technical stack diagram converging components, data, and APIs for this story",
    outputType: "text",
    contextPassMode: "raw",
    prerequisites: ["user-flow"],
    mandatory: true,
    scope: "story",
    renderer: "xyflow",
    stakeholderViews: ["cto", "engineer"],
    agentName: "Architecture Agent",
  },
  {
    id: "sequence-diagram",
    label: "Sequence Diagram",
    description: "Inter-service message sequence for the critical path",
    outputType: "text",
    contextPassMode: "raw",
    prerequisites: ["user-flow"],
    mandatory: false,
    scope: "story",
    renderer: "plantuml",
    stakeholderViews: ["engineer"],
    agentName: "Architecture Agent",
  },

  // Layer 2 — depends on technical-architecture
  {
    id: "data-model",
    label: "Data Model",
    description: "Entity relationships and schema for this story's data",
    outputType: "text",
    contextPassMode: "raw",
    prerequisites: ["technical-architecture"],
    mandatory: true,
    scope: "story",
    renderer: "plantuml",
    stakeholderViews: ["engineer", "security"],
    agentName: "Architecture Agent",
  },
  {
    id: "security-analysis",
    label: "Security Analysis",
    description: "Threat model, attack surface, and security mitigations specific to this story",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: ["technical-architecture"],
    mandatory: true,
    scope: "story",
    renderer: "xyflow",
    stakeholderViews: ["security", "cto"],
    agentName: "Security Agent",
  },
  {
    id: "deployment-notes",
    label: "Deployment Notes",
    description: "Environment config, deployment steps, and rollback plan for this story",
    outputType: "text",
    contextPassMode: "summarizable",
    prerequisites: ["technical-architecture"],
    mandatory: false,
    scope: "story",
    renderer: "markdown",
    stakeholderViews: ["devops", "engineer"],
    agentName: "Architecture Agent",
  },
];

export const artifactMap = new Map(artifactRegistry.map(a => [a.id, a]));

export function getArtifactConfig(id: ArtifactTypeId): ArtifactTypeConfig {
  const config = artifactMap.get(id);
  if (!config) throw new Error(`Unknown artifact type: ${id}`);
  return config;
}

export function computeArtifactDepth(id: ArtifactTypeId): number {
  const config = getArtifactConfig(id);
  if (config.prerequisites.length === 0) return 0;
  return Math.max(...config.prerequisites.map(p => computeArtifactDepth(p))) + 1;
}

export function getArtifactLayers(): ArtifactTypeConfig[][] {
  const maxDepth = Math.max(...artifactRegistry.map(a => computeArtifactDepth(a.id)));
  const layers: ArtifactTypeConfig[][] = [];
  for (let d = 0; d <= maxDepth; d++) {
    layers.push(artifactRegistry.filter(a => computeArtifactDepth(a.id) === d));
  }
  return layers;
}

export function computeArtifactState(
  id: ArtifactTypeId,
  storyDesignArtifacts: Partial<Record<ArtifactTypeId, StoryDesignArtifact>>
): ArtifactStatus {
  const stored = storyDesignArtifacts[id];
  if (stored && stored.status !== "available") return stored.status;
  const config = getArtifactConfig(id);
  const allPrereqsApproved = config.prerequisites.every(prereqId => {
    const prereq = storyDesignArtifacts[prereqId];
    return prereq?.status === "approved";
  });
  return allPrereqsApproved ? "available" : "locked";
}

export function checkDesignGate(
  storyArtifacts: Partial<Record<ArtifactTypeId, StoryDesignArtifact>>,
  projectArtifacts?: ProjectDesignArtifact[],
  epicArtifacts?: EpicDesignArtifact[],
): {
  passed: boolean;
  missing: string[];
  tier1Passed: boolean;
  tier2Passed: boolean;
  tier3Passed: boolean;
  approvedCount: number;
  totalRequired: number;
} {
  const mandatory = artifactRegistry.filter(a => a.mandatory);
  const missing: string[] = [];
  let approvedCount = 0;
  const totalRequired = mandatory.length;

  for (const artifact of mandatory) {
    if (artifact.scope === "project") {
      if (projectArtifacts) {
        const found = projectArtifacts.find(p => p.typeId === artifact.id);
        if (!found || found.status !== "approved") {
          missing.push(artifact.label);
        } else {
          approvedCount++;
        }
      } else {
        approvedCount++;
      }
    } else if (artifact.scope === "epic") {
      if (epicArtifacts) {
        const found = epicArtifacts.find(e => e.typeId === artifact.id);
        if (!found || found.status !== "approved") {
          missing.push(artifact.label);
        } else {
          approvedCount++;
        }
      } else {
        approvedCount++;
      }
    } else {
      const stored = storyArtifacts[artifact.id];
      if (!stored || stored.status !== "approved") {
        missing.push(artifact.label);
      } else {
        approvedCount++;
      }
    }
  }

  const tier1Passed = projectArtifacts
    ? mandatory.filter(a => a.scope === "project").every(a => {
        const found = projectArtifacts.find(p => p.typeId === a.id);
        return found?.status === "approved";
      })
    : true;

  const tier2Passed = epicArtifacts
    ? mandatory.filter(a => a.scope === "epic").every(a => {
        const found = epicArtifacts.find(e => e.typeId === a.id);
        return found?.status === "approved";
      })
    : true;

  const tier3Passed = mandatory.filter(a => a.scope === "story").every(a => {
    const stored = storyArtifacts[a.id];
    return stored?.status === "approved";
  });

  return {
    passed: missing.length === 0,
    missing,
    tier1Passed,
    tier2Passed,
    tier3Passed,
    approvedCount,
    totalRequired,
  };
}

export function getArtifactsByScope(scope: "project" | "epic" | "story"): ArtifactTypeConfig[] {
  return artifactRegistry.filter(a => a.scope === scope);
}

export function getProjectArtifactConfigs(): ArtifactTypeConfig[] {
  return getArtifactsByScope("project");
}

export function getEpicArtifactConfigs(): ArtifactTypeConfig[] {
  return getArtifactsByScope("epic");
}

export function getStoryArtifactConfigs(): ArtifactTypeConfig[] {
  return getArtifactsByScope("story");
}

export const stakeholderViews: Record<StakeholderViewId, { label: string; artifactIds: ArtifactTypeId[] }> = {
  cto: {
    label: "CTO",
    artifactIds: ["user-flow", "technical-architecture", "security-analysis", "data-model"],
  },
  engineer: {
    label: "Engineer",
    artifactIds: ["user-flow", "technical-architecture", "sequence-diagram", "data-model", "deployment-notes"],
  },
  product: {
    label: "Product",
    artifactIds: ["user-flow", "technical-architecture"],
  },
  security: {
    label: "Security",
    artifactIds: ["security-analysis", "data-model", "technical-architecture"],
  },
  devops: {
    label: "DevOps",
    artifactIds: ["deployment-notes", "technical-architecture", "sequence-diagram"],
  },
};
