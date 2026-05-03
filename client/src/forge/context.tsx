import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { LoginScreen } from "@/forge/screens/LoginScreen";
import { buildSearchResults, connectors as allConnectors, modules, notifications as seedNotifications, personas, projects as allProjects, screens, stories as seedStories, tenants as allTenants } from "@/forge/data";
import { personaPresets } from "@/forge/personaPresets";
import { policyRules as seedPolicyRules } from "@/forge/policyRules";
import { auditEvents as seedAuditEvents } from "@/forge/auditTrail";
import { outputArtifacts as seedOutputArtifacts } from "@/forge/outputArtifacts";
import { demoScripts } from "@/forge/demoScripts";
import { designArtifacts as seedDesignArtifacts } from "@/forge/data/designArtifacts";
import { getArtifactConfig, computeArtifactState, getProjectArtifactConfigs, getEpicArtifactConfigs } from "@/forge/artifactRegistry";
import type { ProjectDesignArtifact, EpicDesignArtifact } from "@shared/types/designArtifacts";
import { operateEvents as seedOperateEvents, operateMetrics as seedOperateMetrics } from "@/forge/data/operateData";
import { executionRuns as seedExecutionRuns } from "@/forge/data/executionData";
import { ideConnections as seedIDEConnections } from "@/forge/data/ideData";
import type {
  AIDemoScript,
  AIAgentStatus,
  ApprovalAction,
  ArtifactTypeId,
  AuditEvent,
  CodeExecutionRun,
  Connector,
  ConnectorStatus,
  DesignArtifact,
  Epic,
  ExtractedStoryCandidate,
  IDEConnection,
  ModuleDefinition,
  ModuleKey,
  NotificationItem,
  OperateEvent,
  OperateEventSeverity,
  OperateMetrics,
  OutputArtifact,
  PersonaDefinition,
  PersonaKey,
  PersonaPreset,
  PolicyRule,
  PolicySeverity,
  Project,
  ProjectTypeKey,
  RiskLevel,
  SearchResult,
  Story,
  StoryPhase,
  StoryTransition,
  Tenant,
} from "@/forge/types";

type ForgeContextValue = {
  screens: typeof screens;
  personas: PersonaDefinition[];
  stories: Story[];
  notifications: NotificationItem[];
  modules: ModuleDefinition[];
  searchResults: SearchResult[];
  activePersona: PersonaKey;
  setActivePersona: (persona: PersonaKey) => void;
  selectedStoryId: string;
  setSelectedStoryId: (storyId: string) => void;
  activeModules: Record<ModuleKey, boolean>;
  requestModuleToggle: (moduleKey: ModuleKey) => void;
  pendingModule: ModuleKey | null;
  cancelModuleToggle: () => void;
  confirmModuleToggle: () => void;
  currentUser: { name: string; role: string; initials: string };
  isAuthenticated: boolean;
  authUser: { id: string; name: string; email: string; roleId: string; organizationId: string } | null;
  login: (user: { id: string; name: string; email: string; roleId: string; organizationId: string }) => void;
  logout: () => void;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
  getStoryById: (storyId: string) => Story | undefined;
  selectedStory: Story;
  tenants: Tenant[];
  projects: Project[];
  activeTenantId: string;
  setActiveTenantId: (tenantId: string) => void;
  activeProjectId: string;
  setActiveProjectId: (projectId: string) => void;
  activeTenant: Tenant;
  activeProject: Project;
  tenantProjects: Project[];
  connectors: Connector[];
  connectorStatuses: Record<string, ConnectorStatus>;
  updateConnectorStatus: (connectorId: string, status: ConnectorStatus) => void;
  pendingConnector: string | null;
  requestConnectorAction: (connectorId: string) => void;
  cancelConnectorAction: () => void;
  confirmConnectorAction: () => void;
  /* New state */
  storyList: Story[];
  storyTransitions: StoryTransition[];
  approvalActions: ApprovalAction[];
  aiAgentStatus: AIAgentStatus;
  activeAiScript: AIDemoScript | null;
  configuredPersonas: PersonaPreset[];
  policyStates: Record<string, { enabled: boolean; severity: PolicySeverity }>;
  demoModeActive: boolean;
  currentDemoStep: number;
  outputArtifactsList: OutputArtifact[];
  auditTrailEvents: AuditEvent[];
  designArtifacts: DesignArtifact[];
  storyDrawerOpen: boolean;
  drawerStoryId: string | null;
  operateEvents: OperateEvent[];
  operateMetrics: OperateMetrics;
  executionRuns: CodeExecutionRun[];
  ideConnections: IDEConnection[];
  /* New actions */
  advanceStory: (storyId: string, toPhase: StoryPhase) => void;
  approveGovernanceItem: (itemId: string, action: "approved" | "rejected", reason?: string) => void;
  triggerAiAgent: (scriptId: string) => void;
  stopAiAgent: () => void;
  createProject: (name: string, templateKey: ProjectTypeKey) => void;
  createStory: (story: Story) => void;
  runPlanningAgent: (storyId: string) => void;
  runAgentWithFeedback: (storyId: string, selectedFeedbackIds: string[]) => void;
  createCustomPersona: (preset: PersonaPreset) => void;
  togglePolicy: (policyId: string) => void;
  updatePolicySeverity: (policyId: string, severity: PolicySeverity) => void;
  setDemoModeActive: (active: boolean) => void;
  setCurrentDemoStep: (step: number) => void;
  addNotification: (item: Omit<NotificationItem, "id">) => void;
  openStoryDrawer: (storyId: string) => void;
  closeStoryDrawer: () => void;
  rejectStory: (storyId: string, reason: string) => void;
  addStoryFeedback: (storyId: string, text: string) => void;
  approveDesignArtifact: (artifactId: string, reason?: string) => void;
  rejectDesignArtifact: (artifactId: string, reason: string) => void;
  addDesignFeedback: (artifactId: string, text: string) => void;
  generateDesignArtifact: (storyId: string, typeId: import("@/forge/types").ArtifactTypeId) => void;
  approveStoryDesignArtifact: (storyId: string, typeId: import("@/forge/types").ArtifactTypeId) => void;
  rejectStoryDesignArtifact: (storyId: string, typeId: import("@/forge/types").ArtifactTypeId, reason: string) => void;
  importStoriesFromCandidates: (candidates: ExtractedStoryCandidate[]) => void;
  startExecution: (storyId: string) => void;
  resolveIncident: (eventId: string) => void;
  rollbackStory: (storyId: string) => void;
  scaleStory: (storyId: string) => void;
  reportProductionIssue: (storyId: string, title: string, severity: OperateEventSeverity) => void;
  /* Three-tier design model */
  epicList: Epic[];
  projectDesignArtifacts: ProjectDesignArtifact[];
  epicDesignArtifacts: EpicDesignArtifact[];
  createEpic: (name: string, description?: string) => void;
  generateProjectArtifact: (projectId: string, typeId: string) => void;
  approveProjectArtifact: (artifactId: string) => void;
  rejectProjectArtifact: (artifactId: string, reason: string) => void;
  generateEpicArtifact: (epicId: string, typeId: string) => void;
  approveEpicArtifact: (artifactId: string) => void;
  rejectEpicArtifact: (artifactId: string, reason: string) => void;
};

const PERSONA_STORAGE_KEY = "arkitekt-forge-persona";
const STORY_STORAGE_KEY = "arkitekt-forge-story";
const STORY_LIST_STORAGE_KEY = "arkitekt-forge-story-list";
const ONBOARDING_STORAGE_KEY = "arkitekt-forge-onboarding-dismissed";

const ForgeContext = createContext<ForgeContextValue | null>(null);

const defaultModules: Record<ModuleKey, boolean> = {
  contextCompiler: true,
  proofValidator: true,
  policyEngine: true,
  externalConnectors: false,
  codeExecutionLoop: true,
  operateModule: true,
  ideIntegration: false,
};

const defaultCurrentUser = {
  name: "Sara Malik",
  role: "Lead Solution Architect",
  initials: "SM",
};

const defaultConnectorStatuses: Record<string, ConnectorStatus> = Object.fromEntries(
  allConnectors.map(c => [c.id, c.status])
);

const defaultPolicyStates: Record<string, { enabled: boolean; severity: PolicySeverity }> = Object.fromEntries(
  seedPolicyRules.map(r => [r.id, { enabled: r.enabled, severity: r.severity }])
);

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ForgeProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; name: string; email: string; roleId: string; organizationId: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const currentUser = authUser
    ? { name: authUser.name, role: "Architect", initials: authUser.name.split(" ").map(n => n[0]).join("") }
    : defaultCurrentUser;
  const [activePersona, setActivePersonaState] = useState<PersonaKey>("cto");
  const [selectedStoryId, setSelectedStoryIdState] = useState<string>("");
  const [activeModules, setActiveModules] = useState<Record<ModuleKey, boolean>>(defaultModules);
  const [pendingModule, setPendingModule] = useState<ModuleKey | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTenantId, setActiveTenantIdState] = useState<string>("moi");
  const [activeProjectId, setActiveProjectIdState] = useState<string>("ndpp");
  const [connectorStatuses, setConnectorStatuses] = useState<Record<string, ConnectorStatus>>(defaultConnectorStatuses);
  const [pendingConnector, setPendingConnector] = useState<string | null>(null);
  const [storyList, setStoryList] = useState<Story[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORY_LIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Story[]) : [];
    } catch {
      return [];
    }
  });
  const [projectList, setProjectList] = useState<Project[]>(allProjects);
  const [storyTransitions, setStoryTransitions] = useState<StoryTransition[]>([]);
  const [approvalActions, setApprovalActions] = useState<ApprovalAction[]>([]);
  const [aiAgentStatus, setAiAgentStatus] = useState<AIAgentStatus>("idle");
  const [activeAiScript, setActiveAiScript] = useState<AIDemoScript | null>(null);
  const [configuredPersonas, setConfiguredPersonas] = useState<PersonaPreset[]>(personaPresets);
  const [policyStates, setPolicyStates] = useState(defaultPolicyStates);
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [outputArtifactsList, setOutputArtifacts] = useState<OutputArtifact[]>(seedOutputArtifacts);
  const [auditTrailEvents, setAuditTrailEvents] = useState<AuditEvent[]>(seedAuditEvents);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>(seedNotifications);
  const [designArtifactsList, setDesignArtifacts] = useState<DesignArtifact[]>(seedDesignArtifacts);
  const [storyDrawerOpen, setStoryDrawerOpen] = useState(false);
  const [drawerStoryId, setDrawerStoryId] = useState<string | null>(null);
  const [operateEventsList, setOperateEvents] = useState<OperateEvent[]>(seedOperateEvents);
  const [operateMetricsData] = useState<OperateMetrics>(seedOperateMetrics);
  const [executionRunsList] = useState<CodeExecutionRun[]>(seedExecutionRuns);
  const [ideConnectionsList] = useState<IDEConnection[]>(seedIDEConnections);
  const [epicList, setEpicList] = useState<Epic[]>([]);
  const [projectDesignArtifacts, setProjectDesignArtifacts] = useState<ProjectDesignArtifact[]>([]);
  const [epicDesignArtifacts, setEpicDesignArtifacts] = useState<EpicDesignArtifact[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPersona = window.localStorage.getItem(PERSONA_STORAGE_KEY) as PersonaKey | null;
    const storedStory = window.localStorage.getItem(STORY_STORAGE_KEY);
    const onboardingDismissed = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (storedPersona && personas.some(p => p.key === storedPersona)) setActivePersonaState(storedPersona);
    if (storedStory && storyList.some(s => s.id === storedStory)) setSelectedStoryIdState(storedStory);
    if (onboardingDismissed === "true") setShowOnboarding(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(PERSONA_STORAGE_KEY, activePersona);
  }, [activePersona]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORY_LIST_STORAGE_KEY, JSON.stringify(storyList));
    } catch { /* ignore quota errors */ }
  }, [storyList]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORY_STORAGE_KEY, selectedStoryId);
  }, [selectedStoryId]);

  // Auth check on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch("/api/v1/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setAuthUser(data.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const setActivePersona = useCallback((persona: PersonaKey) => setActivePersonaState(persona), []);

  const setSelectedStoryId = useCallback((storyId: string) => {
    if (storyList.some(s => s.id === storyId)) setSelectedStoryIdState(storyId);
  }, [storyList]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const requestModuleToggle = useCallback((moduleKey: ModuleKey) => setPendingModule(moduleKey), []);
  const cancelModuleToggle = useCallback(() => setPendingModule(null), []);
  const confirmModuleToggle = useCallback(() => {
    if (!pendingModule) return;
    setActiveModules(prev => ({ ...prev, [pendingModule]: !prev[pendingModule] }));
    setPendingModule(null);
  }, [pendingModule]);

  const getStoryById = useCallback((storyId: string) => storyList.find(s => s.id === storyId), [storyList]);

  const emptyStory: Story = useMemo(() => ({
    id: "",
    title: "No story selected",
    phase: "Plan",
    owner: "—",
    ownerRole: "—",
    risk: "Low",
    confidence: 0,
    memoryLinks: 0,
    evidenceScore: 0,
    summary: "Create your first story to begin.",
    nextGate: "Plan",
    services: [],
    dependencies: [],
    personaFocus: {},
    personaActions: {},
    phaseStates: [],
    memoryEvents: [],
    serviceImpacts: [],
    governanceQueue: [],
    controls: [],
    rationale: [],
    configNotes: [],
  }), []);

  const selectedStory = useMemo(() => (getStoryById(selectedStoryId) ?? storyList[0] ?? emptyStory) as Story, [getStoryById, selectedStoryId, storyList, emptyStory]);

  const setActiveTenantId = useCallback((tenantId: string) => {
    if (allTenants.some(t => t.id === tenantId)) {
      setActiveTenantIdState(tenantId);
      const firstProject = projectList.find(p => p.tenantId === tenantId);
      if (firstProject) setActiveProjectIdState(firstProject.id);
    }
  }, [projectList]);

  const setActiveProjectId = useCallback((projectId: string) => {
    if (projectList.some(p => p.id === projectId)) setActiveProjectIdState(projectId);
  }, [projectList]);

  const activeTenant = useMemo(() => allTenants.find(t => t.id === activeTenantId) ?? allTenants[0], [activeTenantId]);
  const activeProject = useMemo(() => projectList.find(p => p.id === activeProjectId) ?? projectList[0], [activeProjectId, projectList]);
  const tenantProjects = useMemo(() => projectList.filter(p => p.tenantId === activeTenantId), [activeTenantId, projectList]);

  const updateConnectorStatus = useCallback((connectorId: string, status: ConnectorStatus) => {
    setConnectorStatuses(prev => ({ ...prev, [connectorId]: status }));
  }, []);

  const requestConnectorAction = useCallback((connectorId: string) => setPendingConnector(connectorId), []);
  const cancelConnectorAction = useCallback(() => setPendingConnector(null), []);
  const confirmConnectorAction = useCallback(() => {
    if (!pendingConnector) return;
    setConnectorStatuses(prev => {
      const current = prev[pendingConnector];
      const next: ConnectorStatus =
        current === "Connected" ? "Disabled"
        : current === "Disabled" ? "Connected"
        : current === "Available" ? "Pending setup"
        : current === "Pending setup" ? "Connected"
        : current;
      return { ...prev, [pendingConnector]: next };
    });
    const connector = allConnectors.find(c => c.id === pendingConnector);
    const newStatus = connectorStatuses[pendingConnector] === "Connected" ? "disconnected" : "connected";
    if (connector) toast.success(`${connector.name} ${newStatus} successfully.`);
    setPendingConnector(null);
  }, [pendingConnector, connectorStatuses]);

  const connectorsWithStatus = useMemo(() => allConnectors.map(c => ({ ...c, status: connectorStatuses[c.id] ?? c.status })), [connectorStatuses]);

  const addAuditEvent = useCallback((event: Omit<AuditEvent, "id">) => {
    setAuditTrailEvents(prev => [{ ...event, id: `audit-${generateId()}` }, ...prev]);
  }, []);

  const addNotification = useCallback((item: Omit<NotificationItem, "id">) => {
    setNotificationList(prev => [{ ...item, id: `notif-${generateId()}` }, ...prev]);
  }, []);

  const openStoryDrawer = useCallback((storyId: string) => {
    if (storyList.some(s => s.id === storyId)) {
      setSelectedStoryIdState(storyId);
      setDrawerStoryId(storyId);
      setStoryDrawerOpen(true);
    }
  }, [storyList]);

  const closeStoryDrawer = useCallback(() => {
    setStoryDrawerOpen(false);
    setDrawerStoryId(null);
  }, []);


  const rejectStory = useCallback((storyId: string, reason: string) => {
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;

      const updatedOutputs = { ...s.agentOutputs };
      if (updatedOutputs[s.phase]?.sections) {
        updatedOutputs[s.phase] = {
          ...updatedOutputs[s.phase],
          sections: updatedOutputs[s.phase]!.sections.map(sec => ({
            ...sec,
            status: "reworked" as const,
          })),
        };
      }

      return {
        ...s,
        agentOutputs: updatedOutputs,
        feedbackHistory: [
          ...(s.feedbackHistory ?? []),
          {
            id: `fh-${generateId()}`,
            author: currentUser.name,
            text: reason,
            timestamp: "Just now",
            phase: s.phase,
            type: "rejection" as const,
          },
        ],
      };
    }));
  }, [currentUser.name]);

  const addStoryFeedback = useCallback((storyId: string, text: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        feedbackHistory: [...(s.feedbackHistory ?? []), {
          id: `fb-${generateId()}`,
          author: currentUser.name,
          text,
          timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          phase: s.phase,
          type: "feedback" as const,
        }],
      };
    }));
    toast.success("Feedback submitted.");
  }, [storyList]);

  const approveDesignArtifact = useCallback((artifactId: string, reason?: string) => {
    setDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId ? { ...a, status: "approved", reviewedBy: currentUser.name } : a,
    ));
    addAuditEvent({
      type: "approval",
      title: "Design artifact approved",
      detail: `Approved by ${currentUser.name}${reason ? `. Note: ${reason}` : ""}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.success("Design artifact approved. Governance record created.");
  }, [addAuditEvent]);

  const rejectDesignArtifact = useCallback((artifactId: string, reason: string) => {
    setDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId ? { ...a, status: "rejected" } : a,
    ));
    addAuditEvent({
      type: "approval",
      title: "Design artifact rejected",
      detail: `Rejected by ${currentUser.name}. Reason: ${reason}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.info("Design rejected. Feedback captured.");
  }, [addAuditEvent]);

  const addDesignFeedback = useCallback((artifactId: string, text: string) => {
    setDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId ? {
        ...a,
        feedback: [...a.feedback, {
          id: `df-${generateId()}`,
          author: currentUser.name,
          text,
          timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          resolved: false,
        }],
      } : a,
    ));
    toast.success("Feedback added to design artifact.");
  }, []);

  const generateDesignArtifact = useCallback((storyId: string, typeId: ArtifactTypeId) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;

    const config = getArtifactConfig(typeId);
    const currentArtifacts = story.storyDesignArtifacts ?? {};

    // Enforce prerequisite gate — no escape hatch
    const unmetPrereqs = config.prerequisites.filter(prereqId => {
      const stored = currentArtifacts[prereqId];
      return !stored || stored.status !== "approved";
    });
    if (unmetPrereqs.length > 0) {
      toast.error(`Cannot generate ${config.label}: approve prerequisites first.`);
      return;
    }

    // Mark as generating
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        storyDesignArtifacts: {
          ...s.storyDesignArtifacts,
          [typeId]: { typeId, content: "", status: "generating" as const },
        },
      };
    }));

    // Build prerequisite context — raw for structural, summarized for narrative
    const prerequisiteContext: Record<string, string> = {};
    for (const prereqId of config.prerequisites) {
      const prereq = currentArtifacts[prereqId];
      if (prereq?.content) {
        const prereqConfig = getArtifactConfig(prereqId);
        if (prereqConfig.contextPassMode === "raw") {
          prerequisiteContext[prereqId] = prereq.content;
        } else {
          prerequisiteContext[prereqId] = prereq.content.slice(0, 400) + (prereq.content.length > 400 ? "..." : "");
        }
      }
    }

    fetch("/api/story/design-artifact", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyId,
        title: story.title,
        description: story.description ?? story.summary,
        typeId,
        prerequisiteContext,
        projectId: activeProjectId,
      }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Agent call failed: ${r.status}`);
        return r.json();
      })
      .then((data: { content: string; renderedSvg?: string }) => {
        setStoryList(prev => prev.map(s => {
          if (s.id !== storyId) return s;
          return {
            ...s,
            storyDesignArtifacts: {
              ...s.storyDesignArtifacts,
              [typeId]: {
                typeId,
                content: data.content,
                ...(data.renderedSvg ? { renderedSvg: data.renderedSvg } : {}),
                status: "draft" as const,
                generatedAt: new Date().toISOString(),
              },
            },
          };
        }));
        toast.success(`${config.label} generated — ready for review.`);
      })
      .catch((err: Error) => {
        setStoryList(prev => prev.map(s => {
          if (s.id !== storyId) return s;
          return {
            ...s,
            storyDesignArtifacts: {
              ...s.storyDesignArtifacts,
              [typeId]: { typeId, content: "", status: "available" as const },
            },
          };
        }));
        toast.error(`Failed to generate ${config.label}: ${err.message}`);
      });
  }, [storyList, activeProjectId]);

  const approveStoryDesignArtifact = useCallback((storyId: string, typeId: ArtifactTypeId) => {
    const config = getArtifactConfig(typeId);
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const existing = s.storyDesignArtifacts?.[typeId];
      if (!existing) return s;
      return {
        ...s,
        storyDesignArtifacts: {
          ...s.storyDesignArtifacts,
          [typeId]: {
            ...existing,
            status: "approved" as const,
            approvedBy: currentUser.name,
            approvedAt: new Date().toISOString(),
          },
        },
      };
    }));
    addAuditEvent({
      type: "approval",
      title: `${config.label} approved`,
      detail: `Approved by ${currentUser.name}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.success(`${config.label} approved.`);
  }, [currentUser, addAuditEvent]);

  const rejectStoryDesignArtifact = useCallback((storyId: string, typeId: ArtifactTypeId, reason: string) => {
    const config = getArtifactConfig(typeId);
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const existing = s.storyDesignArtifacts?.[typeId];
      if (!existing) return s;
      return {
        ...s,
        storyDesignArtifacts: {
          ...s.storyDesignArtifacts,
          [typeId]: {
            ...existing,
            status: "rejected" as const,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          },
        },
      };
    }));
    addAuditEvent({
      type: "approval",
      title: `${config.label} rejected`,
      detail: `Rejected by ${currentUser.name}. Reason: ${reason}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.info(`${config.label} rejected — regenerate to try again.`);
  }, [currentUser, addAuditEvent]);

  const importStoriesFromCandidates = useCallback((candidates: ExtractedStoryCandidate[]) => {
    if (candidates.length === 0) return;
    const now = new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const newStories: Story[] = candidates.map(c => {
      const acLines = c.acceptanceCriteria.split("\n").filter(Boolean);
      return {
        id: `story-${generateId()}`,
        title: c.title,
        phase: "Plan" as StoryPhase,
        owner: currentUser.name,
        ownerRole: currentUser.role,
        risk: "Medium" as RiskLevel,
        confidence: 60,
        memoryLinks: 0,
        evidenceScore: 0,
        summary: c.description,
        description: c.description,
        acceptanceCriteria: acLines.map((text, i) => ({ id: `ac-${generateId()}-${i}`, text, met: false })),
        nextGate: "Brief approval waiting",
        services: [],
        dependencies: [],
        personaFocus: {} as Record<string, string>,
        personaActions: {} as Record<string, string[]>,
        phaseStates: [],
        memoryEvents: [],
        serviceImpacts: [],
        governanceQueue: [],
        controls: [],
        rationale: [],
        configNotes: [],
        agentOutputs: {},
        feedbackHistory: [],
      };
    });

    setStoryList(prev => [...newStories, ...prev]);
    setSelectedStoryIdState(newStories[0].id);

    addAuditEvent({
      type: "ai-action",
      title: `${newStories.length} ${newStories.length === 1 ? "story" : "stories"} imported from document`,
      detail: `Bulk import via BRD extraction. Planning Agent skipped.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: now,
      proofHash: generateId(),
      relatedProjectId: activeProjectId,
    });

    toast.success(`${newStories.length} ${newStories.length === 1 ? "story" : "stories"} imported.`, {
      description: "Planning Agent was not triggered. Stories are ready in Plan phase.",
    });
  }, [currentUser, addAuditEvent, activeProjectId]);

  const startExecution = useCallback((storyId: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    toast.info(`Execution loop started for ${story.title}`);
    addNotification({
      title: "Execution loop started",
      detail: `Agent began autonomous implementation for ${story.title}`,
      time: "Just now",
      tone: "blue",
    });
    addAuditEvent({
      type: "ai-action",
      title: "Code execution loop started",
      detail: `Autonomous generation initiated for story ${story.title}`,
      actor: "Forge Agent",
      actorRole: "AI Agent",
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedStoryId: storyId,
    });
  }, [storyList, addNotification, addAuditEvent]);

  const resolveIncident = useCallback((eventId: string) => {
    setOperateEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, status: "resolved", resolvedAt: new Date().toISOString() } : e,
    ));
    toast.success("Incident marked as resolved");
    addAuditEvent({
      type: "state-change",
      title: "Incident resolved",
      detail: `Operate incident ${eventId} marked resolved`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
  }, [addAuditEvent]);

  const rollbackStory = useCallback((storyId: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    setStoryList(prev => prev.map(s =>
      s.id === storyId && s.productionHealth
        ? { ...s, productionHealth: { ...s.productionHealth, status: "down" as const } }
        : s,
    ));
    toast.warning(`Rollback initiated for ${story.title}`);
    addAuditEvent({
      type: "state-change",
      title: "Production rollback initiated",
      detail: `${story.title} is being rolled back to the previous stable version.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedStoryId: storyId,
    });
  }, [storyList, addAuditEvent]);

  const scaleStory = useCallback((storyId: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    toast.info(`Scaling resources for ${story.title}`);
    addAuditEvent({
      type: "config-change",
      title: "Production scale action",
      detail: `${story.title} resources were scaled.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedStoryId: storyId,
    });
  }, [storyList, addAuditEvent]);

  const reportProductionIssue = useCallback((storyId: string, title: string, severity: OperateEventSeverity) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    const newEvent: OperateEvent = {
      id: `evt-${generateId()}`,
      projectId: activeProjectId,
      title,
      severity,
      status: "active",
      source: "User Reported",
      detectedAt: new Date().toISOString(),
      affectedServices: story.services,
      correlatedStoryId: storyId,
      assignedTo: currentUser.name,
      timelineEvents: [
        { timestamp: new Date().toISOString(), action: `Issue reported: ${title}`, actor: currentUser.name },
      ],
    };
    setOperateEvents(prev => [newEvent, ...prev]);
    toast.error(`Incident reported: ${title}`);
    addAuditEvent({
      type: "state-change",
      title: "Production incident reported",
      detail: `${title} reported for ${story.title}. Severity: ${severity}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedStoryId: storyId,
    });
  }, [storyList, activeProjectId, addAuditEvent]);

  const advanceStory = useCallback((storyId: string, toPhase: StoryPhase) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    const fromPhase = story.phase;
    const proofHash = generateId();

    setStoryList(prev => prev.map(s => s.id === storyId ? { ...s, phase: toPhase } : s));

    const transition: StoryTransition = {
      id: `trans-${generateId()}`,
      storyId,
      fromPhase,
      toPhase,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      approvedBy: currentUser.name,
      gatesPassed: [`${fromPhase} to ${toPhase} gate`],
      proofHash,
    };
    setStoryTransitions(prev => [transition, ...prev]);

    addAuditEvent({
      type: "state-change",
      title: `Story advanced to ${toPhase} phase`,
      detail: `${story.title} moved from ${fromPhase} to ${toPhase}. Gate requirements satisfied.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash,
      relatedStoryId: storyId,
      relatedProjectId: activeProjectId,
    });

    // Cascade: auto-approve design artifacts still in review for this story
    setDesignArtifacts(prev => prev.map(a =>
      a.storyId === storyId && a.status === "in_review" ? { ...a, status: "approved" } : a,
    ));

    // Cascade: resolve governance queue items related to fromPhase
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        governanceQueue: s.governanceQueue.map(item =>
          item.phaseContext === fromPhase ? { ...item, status: "Approved" as const } : item,
        ),
        memoryEvents: [...s.memoryEvents, {
          id: `me-adv-${generateId()}`,
          kind: "Pattern reuse" as const,
          title: `Story completed ${fromPhase}. Patterns retained.`,
          detail: `${s.title} advanced from ${fromPhase} to ${toPhase}. All design artifacts approved and governance gates cleared.`,
          time: "Just now",
        }],
      };
    }));

    addNotification({
      title: `${story.title} advanced to ${toPhase}`,
      detail: `Gate requirements satisfied. Evidence chain updated.`,
      time: "Just now",
      tone: "green",
      actionUrl: "/delivery",
    });

    toast.success(`Story moved to ${toPhase}.`, { description: "View in Delivery Flow." });

    // Trigger the phase agent — compile compressed context from all previous phases
    // This is the token moat: each agent gets a tight brief, not full history
    const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];
    const fromIdx = phaseOrder.indexOf(fromPhase);

    if (toPhase !== "Operate" && fromIdx >= 0) {
      const agentNames: Partial<Record<StoryPhase, string>> = {
        Design: "Design Agent",
        Develop: "Development Agent",
        Test: "QA Agent",
        Ship: "Release Agent",
      };
      const agentName = agentNames[toPhase] ?? "Agent";

      setAiAgentStatus("thinking");
      addNotification({ title: `${agentName} activated`, detail: `Compiling context from ${fromPhase} phase...`, tone: "blue", time: "now" });

      // Build compressed context — take first 200 chars of each previous phase's content
      const compiledPhases: Record<string, string> = {};
      phaseOrder.slice(0, fromIdx + 1).forEach(p => {
        const output = story.agentOutputs?.[p];
        if (output?.sections?.length) {
          compiledPhases[p] = output.sections
            .map(s => `${s.title}: ${s.content.slice(0, 160)}`)
            .join(". ")
            .slice(0, 300);
        }
      });

      // Pull top 2 memory patterns from context hub for this story
      const memoryPatterns = story.memoryEvents
        .slice(0, 2)
        .map(e => e.title);

      setTimeout(() => setAiAgentStatus("compiling-context"), 1000);
      setTimeout(() => setAiAgentStatus("generating"), 2500);

      fetch("/api/story/advance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          toPhase,
          compiledContext: {
            description: story.description ?? story.summary,
            phases: compiledPhases,
            memoryPatterns,
          },
        }),
      })
        .then(r => {
          if (!r.ok) throw new Error(`Agent call failed: ${r.status}`);
          return r.json();
        })
        .then((data: {
          agentOutputs?: Record<string, Story["agentOutputs"][keyof Story["agentOutputs"]]>;
          contextSummary?: string;
          tokensUsed?: number;
          agentName?: string;
        }) => {
          setStoryList(prev => prev.map(s => {
            if (s.id !== storyId) return s;
            const updatedOutputs = { ...s.agentOutputs, ...(data.agentOutputs ?? {}) };
            const newMemoryEvent = {
              id: `me-agent-${generateId()}`,
              kind: "Pattern reuse" as const,
              title: `${data.agentName ?? agentName} completed ${toPhase} phase`,
              detail: data.contextSummary ?? `${toPhase} phase output generated. ${data.tokensUsed ?? 0} tokens used.`,
              time: "Just now",
            };
            return {
              ...s,
              agentOutputs: updatedOutputs,
              memoryEvents: [newMemoryEvent, ...s.memoryEvents],
            };
          }));

          setAiAgentStatus("complete");
          addNotification({
            title: `${agentName} complete`,
            detail: `${toPhase} brief ready for review. ${data.tokensUsed ?? 0} tokens used.`,
            tone: "green",
            time: "now",
          });
          toast.success(`${agentName} finished.`, { description: `Open story drawer to review ${toPhase} output.` });
          setTimeout(() => setAiAgentStatus("idle"), 2000);
        })
        .catch((err) => {
          setAiAgentStatus("idle");
          addNotification({ title: "Agent unavailable", detail: err.message || "Server error", tone: "amber", time: "now" });
        });
    }
  }, [storyList, addAuditEvent, activeProjectId, addNotification]);

  const approveGovernanceItem = useCallback((itemId: string, action: "approved" | "rejected", reason?: string) => {
    const proofHash = generateId();
    const approval: ApprovalAction = {
      id: `appr-${generateId()}`,
      governanceItemId: itemId,
      action,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      reason,
    };
    setApprovalActions(prev => [approval, ...prev]);

    addAuditEvent({
      type: "approval",
      title: `Governance item ${action}`,
      detail: `Item ${itemId} was ${action} by ${currentUser.name}${reason ? `. Reason: ${reason}` : ""}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash,
      relatedProjectId: activeProjectId,
    });

    const label = action === "approved" ? "Compliance gate approved" : "Compliance gate rejected";
    toast.success(`${label} by ${currentUser.name}.`);
  }, [addAuditEvent, activeProjectId]);

  const triggerAiAgent = useCallback((scriptId: string) => {
    const script = demoScripts.find(s => s.id === scriptId);
    if (!script) return;
    setActiveAiScript(script);
    setAiAgentStatus("thinking");

    const delays: [AIAgentStatus, number][] = [
      ["thinking", 1000],
      ["compiling-context", 2500],
      ["generating", 1500],
      ["complete", 0],
    ];

    let cumulative = 0;
    for (const [status, delay] of delays) {
      cumulative += delay;
      setTimeout(() => setAiAgentStatus(status), cumulative);
    }

    setTimeout(() => {
      addNotification({
        title: `${script.title} complete`,
        detail: `AI Agent finished with ${script.confidenceScore}% confidence.`,
        time: "just now",
        tone: "green",
      });
    }, cumulative);
  }, [addNotification]);

  const stopAiAgent = useCallback(() => {
    setAiAgentStatus("idle");
    setActiveAiScript(null);
  }, []);

  const createProject = useCallback((name: string, templateKey: ProjectTypeKey) => {
    const newProject: Project = {
      id: `proj-${generateId()}`,
      tenantId: activeTenantId,
      name,
      release: "Release 1.0",
      phase: "Plan",
      storyCount: 0,
      confidence: 85,
      memoryLinks: 0,
      owner: currentUser.name,
      status: "Planning",
    };
    setProjectList(prev => [...prev, newProject]);
    setActiveProjectIdState(newProject.id);

    addAuditEvent({
      type: "config-change",
      title: `Project created: ${name}`,
      detail: `New project created from ${templateKey} template by ${currentUser.name}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedProjectId: newProject.id,
    });

    toast.success(`Project "${name}" created.`, { description: "Configure connectors and personas in Config Studio." });
  }, [activeTenantId, addAuditEvent]);

  const createStory = useCallback((story: Story) => {
    setStoryList(prev => [story, ...prev]);
    setSelectedStoryIdState(story.id);
    setStoryDrawerOpen(true);
    setDrawerStoryId(story.id);

    // Kick off Planning Agent — animate through thinking states then fetch breakdown
    setAiAgentStatus("thinking");
    addNotification({ title: "Planning Agent activated", detail: `Analysing: ${story.title}`, tone: "blue", time: "now" });

    setTimeout(() => setAiAgentStatus("compiling-context"), 1500);
    setTimeout(() => setAiAgentStatus("generating"), 3000);

    fetch("/api/story/breakdown", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: story.title, summary: story.summary, owner: story.owner, risk: story.risk }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Agent call failed: ${r.status}`);
        return r.json();
      })
      .then((data: { description?: string; acceptanceCriteria?: Story["acceptanceCriteria"]; agentOutputs?: Story["agentOutputs"] }) => {
        setStoryList(prev => prev.map(s =>
          s.id === story.id
            ? {
                ...s,
                description: data.description ?? s.description,
                acceptanceCriteria: data.acceptanceCriteria ?? s.acceptanceCriteria,
                agentOutputs: data.agentOutputs ?? s.agentOutputs,
              }
            : s
        ));
        setAiAgentStatus("complete");
        addNotification({ title: "Planning Agent complete", detail: `Brief ready for review: ${story.title}`, tone: "green", time: "now" });
        setTimeout(() => setAiAgentStatus("idle"), 2000);
      })
      .catch((err) => {
        setAiAgentStatus("idle");
        addNotification({ title: "Agent unavailable", detail: err.message || "Server error", tone: "amber", time: "now" });
      });
  }, [addNotification]);

  const runPlanningAgent = useCallback((storyId: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    setAiAgentStatus("thinking");
    addNotification({ title: "Planning Agent activated", detail: `Re-analysing: ${story.title}`, tone: "blue", time: "now" });
    setTimeout(() => setAiAgentStatus("compiling-context"), 1500);
    setTimeout(() => setAiAgentStatus("generating"), 3000);
    fetch("/api/story/breakdown", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: story.title, summary: story.summary, owner: story.owner, risk: story.risk }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Agent call failed: ${r.status}`);
        return r.json();
      })
      .then((data: { description?: string; acceptanceCriteria?: Story["acceptanceCriteria"]; agentOutputs?: Story["agentOutputs"] }) => {
        setStoryList(prev => prev.map(s =>
          s.id === storyId
            ? {
                ...s,
                description: data.description ?? s.description,
                acceptanceCriteria: data.acceptanceCriteria ?? s.acceptanceCriteria,
                agentOutputs: data.agentOutputs ?? s.agentOutputs,
              }
            : s
        ));
        setAiAgentStatus("complete");
        addNotification({ title: "Planning Agent complete", detail: `Brief ready for review: ${story.title}`, tone: "green", time: "now" });
        setTimeout(() => setAiAgentStatus("idle"), 2000);
      })
      .catch((err) => {
        setAiAgentStatus("idle");
        addNotification({ title: "Agent unavailable", detail: err.message || "Server error", tone: "amber", time: "now" });
      });
  }, [storyList, addNotification]);

  const runAgentWithFeedback = useCallback((storyId: string, selectedFeedbackIds: string[]) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;

    const selectedFeedback = (story.feedbackHistory ?? [])
      .filter(f => selectedFeedbackIds.includes(f.id))
      .map(f => f.text);

    setAiAgentStatus("thinking");
    addNotification({
      title: "Agent re-running",
      detail: selectedFeedback.length > 0 ? `${selectedFeedback.length} comment(s) included` : "Regenerating output for current phase",
      tone: "blue",
      time: "now",
    });
    setTimeout(() => setAiAgentStatus("compiling-context"), 1500);
    setTimeout(() => setAiAgentStatus("generating"), 3000);

    const isFirstPhase = story.phase === "Plan";
    const url = isFirstPhase ? "/api/story/breakdown" : "/api/story/advance";

    const phaseOrder: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];
    const fromIdx = phaseOrder.indexOf(story.phase);
    const compiledPhases: Record<string, string> = {};
    // Only include PREVIOUS phases — not the current one being regenerated
    phaseOrder.slice(0, fromIdx).forEach(p => {
      const output = story.agentOutputs?.[p];
      if (output?.sections?.length) {
        compiledPhases[p] = output.sections
          .map(s => `${s.title}: ${s.content.slice(0, 160)}`)
          .join(". ")
          .slice(0, 300);
      }
    });
    const memoryPatterns = story.memoryEvents.slice(0, 2).map(e => e.title);

    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: story.title,
        summary: story.summary,
        owner: story.owner,
        risk: story.risk,
        toPhase: story.phase,
        selectedFeedback,
        compiledContext: {
          description: story.description ?? story.summary,
          phases: compiledPhases,
          memoryPatterns,
        },
      }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Agent call failed: ${r.status}`);
        return r.json();
      })
      .then((data: {
        description?: string;
        acceptanceCriteria?: Story["acceptanceCriteria"];
        agentOutputs?: Story["agentOutputs"];
        agentName?: string;
        contextSummary?: string;
      }) => {
        setStoryList(prev => prev.map(s => {
          if (s.id !== storyId) return s;
          return {
            ...s,
            description: data.description ?? s.description,
            acceptanceCriteria: data.acceptanceCriteria ?? s.acceptanceCriteria,
            agentOutputs: { ...s.agentOutputs, ...(data.agentOutputs ?? {}) },
          };
        }));
        setAiAgentStatus("complete");
        addNotification({ title: "Agent re-run complete", detail: `Output updated with ${selectedFeedback.length} feedback item(s)`, tone: "green", time: "now" });
        setTimeout(() => setAiAgentStatus("idle"), 2000);
      })
      .catch((err) => {
        setAiAgentStatus("idle");
        addNotification({ title: "Agent unavailable", detail: err.message || "Server error", tone: "amber", time: "now" });
      });
  }, [storyList, addNotification]);

  const createCustomPersona = useCallback((preset: PersonaPreset) => {
    setConfiguredPersonas(prev => [...prev, { ...preset, isCustom: true }]);
  }, []);

  const togglePolicy = useCallback((policyId: string) => {
    setPolicyStates(prev => ({
      ...prev,
      [policyId]: { ...prev[policyId], enabled: !prev[policyId].enabled },
    }));
  }, []);

  const updatePolicySeverity = useCallback((policyId: string, severity: PolicySeverity) => {
    setPolicyStates(prev => ({
      ...prev,
      [policyId]: { ...prev[policyId], severity },
    }));
  }, []);

  // ── Three-tier design model functions ───────────────────────────────────

  const createEpic = useCallback((name: string, description?: string) => {
    const newEpic: Epic = {
      id: `epic-${generateId()}`,
      projectId: activeProjectId,
      name,
      description,
      status: "active",
      storyCount: 0,
      owner: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setEpicList(prev => [...prev, newEpic]);
    addAuditEvent({
      type: "config-change",
      title: `Epic created: ${name}`,
      detail: `Epic created by ${currentUser.name} in project ${activeProjectId}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedProjectId: activeProjectId,
    });
    toast.success(`Epic "${name}" created.`);
  }, [activeProjectId, currentUser, addAuditEvent]);

  const generateProjectArtifact = useCallback((projectId: string, typeId: string) => {
    const config = getProjectArtifactConfigs().find(c => c.id === typeId);
    if (!config) return;

    const prereqsFailed = config.prerequisites.filter(prereqId => {
      const found = projectDesignArtifacts.find(a => a.projectId === projectId && a.typeId === prereqId);
      return !found || found.status !== "approved";
    });
    if (prereqsFailed.length > 0) {
      toast.error(`Approve prerequisites first: ${prereqsFailed.join(", ")}`);
      return;
    }

    const existingId = `proj-art-${projectId}-${typeId}`;
    setProjectDesignArtifacts(prev => {
      const filtered = prev.filter(a => !(a.projectId === projectId && a.typeId === typeId));
      return [...filtered, {
        id: existingId, projectId, typeId, scope: "project" as const,
        status: "generating", content: "", version: 1,
      }];
    });

    const prerequisiteContext: Record<string, string> = {};
    config.prerequisites.forEach(prereqId => {
      const found = projectDesignArtifacts.find(a => a.projectId === projectId && a.typeId === prereqId);
      if (found?.content) {
        const prereqConfig = getProjectArtifactConfigs().find(c => c.id === prereqId);
        prerequisiteContext[prereqId] = prereqConfig?.contextPassMode === "raw"
          ? found.content
          : found.content.slice(0, 400) + (found.content.length > 400 ? "..." : "");
      }
    });

    const activeProject = allProjects.find(p => p.id === projectId);
    fetch("/api/project/design-artifact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: activeProject?.name ?? projectId,
        projectDescription: activeProject?.description,
        typeId,
        prerequisiteContext,
      }),
    })
      .then(r => { if (!r.ok) throw new Error(`Agent call failed: ${r.status}`); return r.json(); })
      .then((data: { content: string }) => {
        setProjectDesignArtifacts(prev => prev.map(a =>
          a.projectId === projectId && a.typeId === typeId
            ? { ...a, status: "draft" as const, content: data.content, generatedAt: new Date().toISOString() }
            : a
        ));
        addAuditEvent({
          type: "ai-action",
          title: `${config.label} generated`,
          detail: `Generated for project ${projectId} by ${currentUser.name}.`,
          actor: currentUser.name,
          actorRole: currentUser.role,
          timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          proofHash: generateId(),
          relatedProjectId: projectId,
        });
        toast.success(`${config.label} generated — ready for review.`);
      })
      .catch((err: Error) => {
        setProjectDesignArtifacts(prev => prev.map(a =>
          a.projectId === projectId && a.typeId === typeId
            ? { ...a, status: "not_generated" as const }
            : a
        ));
        toast.error(`Failed to generate ${config.label}: ${err.message}`);
      });
  }, [projectDesignArtifacts, currentUser, addAuditEvent]);

  const approveProjectArtifact = useCallback((artifactId: string) => {
    setProjectDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId
        ? { ...a, status: "approved" as const, approvedBy: currentUser.name, approvedAt: new Date().toISOString() }
        : a
    ));
    addAuditEvent({
      type: "approval",
      title: "Project artifact approved",
      detail: `Artifact ${artifactId} approved by ${currentUser.name}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.success("Artifact approved.");
  }, [currentUser, addAuditEvent]);

  const rejectProjectArtifact = useCallback((artifactId: string, reason: string) => {
    setProjectDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId
        ? { ...a, status: "rejected" as const, rejectedAt: new Date().toISOString(), rejectionReason: reason }
        : a
    ));
    addAuditEvent({
      type: "approval",
      title: "Project artifact rejected",
      detail: `Artifact ${artifactId} rejected by ${currentUser.name}. Reason: ${reason}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.info("Artifact rejected — regenerate to try again.");
  }, [currentUser, addAuditEvent]);

  const generateEpicArtifact = useCallback((epicId: string, typeId: string) => {
    const epic = epicList.find(e => e.id === epicId);
    if (!epic) return;
    const config = getEpicArtifactConfigs().find(c => c.id === typeId);
    if (!config) return;

    const existingId = `epic-art-${epicId}-${typeId}`;
    setEpicDesignArtifacts(prev => {
      const filtered = prev.filter(a => !(a.epicId === epicId && a.typeId === typeId));
      return [...filtered, {
        id: existingId, epicId, projectId: epic.projectId, typeId, scope: "epic" as const,
        status: "generating", content: "", version: 1,
      }];
    });

    const prerequisiteContext: Record<string, string> = {};
    const approvedTier1 = projectDesignArtifacts.filter(a => a.projectId === epic.projectId && a.status === "approved");
    approvedTier1.forEach(a => {
      prerequisiteContext[a.typeId] = a.content.slice(0, 400) + (a.content.length > 400 ? "..." : "");
    });

    fetch("/api/epic/design-artifact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ epicName: epic.name, epicDescription: epic.description, typeId, prerequisiteContext }),
    })
      .then(r => { if (!r.ok) throw new Error(`Agent call failed: ${r.status}`); return r.json(); })
      .then((data: { content: string }) => {
        setEpicDesignArtifacts(prev => prev.map(a =>
          a.epicId === epicId && a.typeId === typeId
            ? { ...a, status: "draft" as const, content: data.content, generatedAt: new Date().toISOString() }
            : a
        ));
        addAuditEvent({
          type: "ai-action",
          title: `${config.label} generated`,
          detail: `Generated for epic ${epicId} by ${currentUser.name}.`,
          actor: currentUser.name,
          actorRole: currentUser.role,
          timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          proofHash: generateId(),
          relatedProjectId: epic.projectId,
        });
        toast.success(`${config.label} generated.`);
      })
      .catch((err: Error) => {
        setEpicDesignArtifacts(prev => prev.map(a =>
          a.epicId === epicId && a.typeId === typeId ? { ...a, status: "not_generated" as const } : a
        ));
        toast.error(`Failed to generate ${config.label}: ${err.message}`);
      });
  }, [epicList, epicDesignArtifacts, projectDesignArtifacts, currentUser, addAuditEvent]);

  const approveEpicArtifact = useCallback((artifactId: string) => {
    setEpicDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId
        ? { ...a, status: "approved" as const, approvedBy: currentUser.name, approvedAt: new Date().toISOString() }
        : a
    ));
    addAuditEvent({
      type: "approval",
      title: "Epic artifact approved",
      detail: `Artifact ${artifactId} approved by ${currentUser.name}.`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.success("Epic artifact approved.");
  }, [currentUser, addAuditEvent]);

  const rejectEpicArtifact = useCallback((artifactId: string, reason: string) => {
    setEpicDesignArtifacts(prev => prev.map(a =>
      a.id === artifactId
        ? { ...a, status: "rejected" as const, rejectedAt: new Date().toISOString(), rejectionReason: reason }
        : a
    ));
    addAuditEvent({
      type: "approval",
      title: "Epic artifact rejected",
      detail: `Artifact ${artifactId} rejected by ${currentUser.name}. Reason: ${reason}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
    });
    toast.info("Epic artifact rejected.");
  }, [currentUser, addAuditEvent]);

  const value = useMemo<ForgeContextValue>(
    () => ({
      screens,
      personas,
      stories: storyList,
      notifications: notificationList,
      modules,
      searchResults: buildSearchResults(),
      activePersona,
      setActivePersona,
      selectedStoryId,
      setSelectedStoryId,
      activeModules,
      requestModuleToggle,
      pendingModule,
      cancelModuleToggle,
      confirmModuleToggle,
      currentUser: authUser ? { name: authUser.name, role: "Architect", initials: authUser.name.split(" ").map(n => n[0]).join("") } : defaultCurrentUser,
      isAuthenticated,
      authUser,
      login: (user) => { setAuthUser(user); setIsAuthenticated(true); },
      logout: () => {
        fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" })
          .finally(() => {
            setAuthUser(null);
            setIsAuthenticated(false);
            window.location.reload();
          });
      },
      showOnboarding,
      dismissOnboarding,
      getStoryById,
      selectedStory,
      tenants: allTenants,
      projects: projectList,
      activeTenantId,
      setActiveTenantId,
      activeProjectId,
      setActiveProjectId,
      activeTenant,
      activeProject,
      tenantProjects,
      connectors: connectorsWithStatus,
      connectorStatuses,
      updateConnectorStatus,
      pendingConnector,
      requestConnectorAction,
      cancelConnectorAction,
      confirmConnectorAction,
      storyList,
      storyTransitions,
      approvalActions,
      aiAgentStatus,
      activeAiScript,
      configuredPersonas,
      policyStates,
      demoModeActive,
      currentDemoStep,
      outputArtifactsList,
      auditTrailEvents,
      designArtifacts: designArtifactsList,
      storyDrawerOpen,
      drawerStoryId,
      operateEvents: operateEventsList,
      operateMetrics: operateMetricsData,
      executionRuns: executionRunsList,
      ideConnections: ideConnectionsList,
      advanceStory,
      approveGovernanceItem,
      triggerAiAgent,
      stopAiAgent,
      createProject,
      createStory,
      runPlanningAgent,
      runAgentWithFeedback,
      createCustomPersona,
      togglePolicy,
      updatePolicySeverity,
      setDemoModeActive,
      setCurrentDemoStep,
      addNotification,
      openStoryDrawer,
      closeStoryDrawer,
      rejectStory,
      addStoryFeedback,
      approveDesignArtifact,
      rejectDesignArtifact,
      addDesignFeedback,
      generateDesignArtifact,
      approveStoryDesignArtifact,
      rejectStoryDesignArtifact,
      importStoriesFromCandidates,
      startExecution,
      resolveIncident,
      rollbackStory,
      scaleStory,
      reportProductionIssue,
      epicList,
      projectDesignArtifacts,
      epicDesignArtifacts,
      createEpic,
      generateProjectArtifact,
      approveProjectArtifact,
      rejectProjectArtifact,
      generateEpicArtifact,
      approveEpicArtifact,
      rejectEpicArtifact,
    }),
    [
      storyList,
      notificationList,
      activePersona,
      setActivePersona,
      selectedStoryId,
      setSelectedStoryId,
      activeModules,
      requestModuleToggle,
      pendingModule,
      cancelModuleToggle,
      confirmModuleToggle,
      showOnboarding,
      dismissOnboarding,
      getStoryById,
      selectedStory,
      projectList,
      activeTenantId,
      setActiveTenantId,
      activeProjectId,
      setActiveProjectId,
      activeTenant,
      activeProject,
      tenantProjects,
      connectorsWithStatus,
      connectorStatuses,
      updateConnectorStatus,
      pendingConnector,
      requestConnectorAction,
      cancelConnectorAction,
      confirmConnectorAction,
      storyTransitions,
      approvalActions,
      aiAgentStatus,
      activeAiScript,
      configuredPersonas,
      policyStates,
      demoModeActive,
      currentDemoStep,
      outputArtifactsList,
      auditTrailEvents,
      designArtifactsList,
      storyDrawerOpen,
      drawerStoryId,
      advanceStory,
      approveGovernanceItem,
      triggerAiAgent,
      stopAiAgent,
      createProject,
      createStory,
      runPlanningAgent,
      runAgentWithFeedback,
      createCustomPersona,
      togglePolicy,
      updatePolicySeverity,
      addNotification,
      openStoryDrawer,
      closeStoryDrawer,
      rejectStory,
      addStoryFeedback,
      approveDesignArtifact,
      rejectDesignArtifact,
      addDesignFeedback,
      generateDesignArtifact,
      approveStoryDesignArtifact,
      rejectStoryDesignArtifact,
      importStoriesFromCandidates,
      startExecution,
      resolveIncident,
      rollbackStory,
      scaleStory,
      reportProductionIssue,
      operateEventsList,
      operateMetricsData,
      executionRunsList,
      ideConnectionsList,
      epicList,
      projectDesignArtifacts,
      epicDesignArtifacts,
      createEpic,
      generateProjectArtifact,
      approveProjectArtifact,
      rejectProjectArtifact,
      generateEpicArtifact,
      approveEpicArtifact,
      rejectEpicArtifact,
    ]
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ForgeContext.Provider value={value}>
        <LoginScreen onLogin={(user) => { setAuthUser(user); setIsAuthenticated(true); }} />
      </ForgeContext.Provider>
    );
  }

  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge() {
  const context = useContext(ForgeContext);
  if (!context) throw new Error("useForge must be used within ForgeProvider");
  return context;
}
