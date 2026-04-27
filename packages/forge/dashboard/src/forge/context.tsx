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
import { buildSearchResults, connectors as allConnectors, modules, notifications as seedNotifications, personas, projects as allProjects, screens, stories as seedStories, tenants as allTenants } from "@/forge/data";
import { personaPresets } from "@/forge/personaPresets";
import { policyRules as seedPolicyRules } from "@/forge/policyRules";
import { auditEvents as seedAuditEvents } from "@/forge/auditTrail";
import { outputArtifacts as seedOutputArtifacts } from "@/forge/outputArtifacts";
import { demoScripts } from "@/forge/demoScripts";
import { designArtifacts as seedDesignArtifacts } from "@/forge/data/designArtifacts";
import { operateEvents as seedOperateEvents, operateMetrics as seedOperateMetrics } from "@/forge/data/operateData";
import { executionRuns as seedExecutionRuns } from "@/forge/data/executionData";
import { ideConnections as seedIDEConnections } from "@/forge/data/ideData";
import type {
  AIDemoScript,
  AIAgentStatus,
  ApprovalAction,
  AuditEvent,
  CodeExecutionRun,
  Connector,
  ConnectorStatus,
  DesignArtifact,
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
  startExecution: (storyId: string) => void;
  resolveIncident: (eventId: string) => void;
  rollbackStory: (storyId: string) => void;
  scaleStory: (storyId: string) => void;
  reportProductionIssue: (storyId: string, title: string, severity: OperateEventSeverity) => void;
};

const PERSONA_STORAGE_KEY = "arkitekt-forge-persona";
const STORY_STORAGE_KEY = "arkitekt-forge-story";
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

const currentUser = {
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
  const [activePersona, setActivePersonaState] = useState<PersonaKey>("cto");
  const [selectedStoryId, setSelectedStoryIdState] = useState<string>(seedStories[0].id);
  const [activeModules, setActiveModules] = useState<Record<ModuleKey, boolean>>(defaultModules);
  const [pendingModule, setPendingModule] = useState<ModuleKey | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTenantId, setActiveTenantIdState] = useState<string>("moi");
  const [activeProjectId, setActiveProjectIdState] = useState<string>("ndpp");
  const [connectorStatuses, setConnectorStatuses] = useState<Record<string, ConnectorStatus>>(defaultConnectorStatuses);
  const [pendingConnector, setPendingConnector] = useState<string | null>(null);
  const [storyList, setStoryList] = useState<Story[]>(seedStories);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPersona = window.localStorage.getItem(PERSONA_STORAGE_KEY) as PersonaKey | null;
    const storedStory = window.localStorage.getItem(STORY_STORAGE_KEY);
    const onboardingDismissed = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (storedPersona && personas.some(p => p.key === storedPersona)) setActivePersonaState(storedPersona);
    if (storedStory && seedStories.some(s => s.id === storedStory)) setSelectedStoryIdState(storedStory);
    if (onboardingDismissed === "true") setShowOnboarding(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(PERSONA_STORAGE_KEY, activePersona);
  }, [activePersona]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORY_STORAGE_KEY, selectedStoryId);
  }, [selectedStoryId]);

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

  const selectedStory = useMemo(() => getStoryById(selectedStoryId) ?? storyList[0], [getStoryById, selectedStoryId, storyList]);

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

  const simulateAgentRework = useCallback((
    entityType: "story" | "design_artifact",
    entityId: string,
    rejectionReason: string,
  ) => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    setAiAgentStatus("thinking");
    addNotification({
      title: "Agent reviewing rejection feedback",
      detail: `Analyzing: "${rejectionReason.slice(0, 60)}..."`,
      time: "just now",
      tone: "blue",
    });

    timeouts.push(setTimeout(() => setAiAgentStatus("compiling-context"), 2000));
    timeouts.push(setTimeout(() => setAiAgentStatus("generating"), 4000));

    timeouts.push(setTimeout(() => {
      setAiAgentStatus("complete");

      if (entityType === "story") {
        setStoryList(prev => prev.map(s => {
          if (s.id !== entityId) return s;
          const phaseOutput = s.agentOutputs?.[s.phase];
          if (!phaseOutput) return s;
          return {
            ...s,
            agentOutputs: {
              ...s.agentOutputs,
              [s.phase]: {
                sections: phaseOutput.sections.map(sec => ({
                  ...sec,
                  status: "reworked" as const,
                  content: `[Reworked based on feedback] ${sec.content}`,
                })),
              },
            },
          };
        }));
      } else {
        setDesignArtifacts(prev => prev.map(a =>
          a.id === entityId ? { ...a, status: "reworked", version: a.version + 1 } : a,
        ));
      }

      addNotification({
        title: "Rework complete",
        detail: "Agent has completed rework. Ready for re review.",
        time: "just now",
        tone: "green",
      });

      timeouts.push(setTimeout(() => setAiAgentStatus("idle"), 2000));
    }, 6000));
  }, [addNotification]);

  const rejectStory = useCallback((storyId: string, reason: string) => {
    const story = storyList.find(s => s.id === storyId);
    if (!story) return;
    const phases: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship", "Operate"];
    const currentIdx = phases.indexOf(story.phase);
    if (currentIdx <= 0) return;
    const previousPhase = phases[currentIdx - 1];

    setStoryList(prev => prev.map(s =>
      s.id === storyId ? { ...s, phase: previousPhase } : s,
    ));

    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        feedbackHistory: [...(s.feedbackHistory ?? []), {
          id: `fb-${generateId()}`,
          author: currentUser.name,
          text: reason,
          timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          phase: story.phase,
          type: "rejection" as const,
        }],
      };
    }));

    addAuditEvent({
      type: "state-change",
      title: `Story rejected and sent back to ${previousPhase}`,
      detail: `${story.title} moved from ${story.phase} to ${previousPhase}. Reason: ${reason}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      proofHash: generateId(),
      relatedStoryId: storyId,
      relatedProjectId: activeProjectId,
    });

    // Cascade: reject design artifacts in review
    setDesignArtifacts(prev => prev.map(a =>
      a.storyId === storyId && a.status === "in_review" ? { ...a, status: "rejected" } : a,
    ));

    // Cascade: mark governance items for current phase as needing action
    setStoryList(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        governanceQueue: s.governanceQueue.map(item =>
          item.phaseContext === story.phase ? { ...item, status: "Needs action" as const } : item,
        ),
        memoryEvents: [...s.memoryEvents, {
          id: `me-rej-${generateId()}`,
          kind: "Lesson learned" as const,
          title: `Story rejected at ${story.phase}. Feedback captured.`,
          detail: `${story.title} returned to ${previousPhase}. Reason: ${reason}`,
          time: "Just now",
        }],
      };
    }));

    addNotification({
      title: `${story.title} sent back to ${previousPhase}`,
      detail: `Rejected from ${story.phase}. Agent is preparing rework.`,
      time: "Just now",
      tone: "amber",
      actionUrl: "/delivery",
    });

    toast.info(`Story sent back to ${previousPhase}. Agent will begin rework.`);
    simulateAgentRework("story", storyId, reason);
  }, [storyList, addAuditEvent, activeProjectId, simulateAgentRework, addNotification]);

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
    toast.info("Design rejected. Agent will produce a revised version.");
    simulateAgentRework("design_artifact", artifactId, reason);
  }, [addAuditEvent, simulateAgentRework]);

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
      currentUser,
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
      startExecution,
      resolveIncident,
      rollbackStory,
      scaleStory,
      reportProductionIssue,
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
      startExecution,
      resolveIncident,
      rollbackStory,
      scaleStory,
      reportProductionIssue,
      operateEventsList,
      operateMetricsData,
      executionRunsList,
      ideConnectionsList,
    ]
  );

  return <ForgeContext.Provider value={value}>{children}</ForgeContext.Provider>;
}

export function useForge() {
  const context = useContext(ForgeContext);
  if (!context) throw new Error("useForge must be used within ForgeProvider");
  return context;
}
