# Arkitekt Forge: Design Phase Implementation Plan

**Version:** 3.0 (Final, Execution Ready)
**Date:** 3 May 2026
**Purpose:** Complete step by step implementation specification for Claude Code. Every file, every function, every type, every change is specified. No ambiguity.

**Target project:** `arkitekt-forge-ui-refreshv2.0/`
**Client source:** `client/src/forge/`
**Server source:** `server/`
**Shared types:** `shared/`

---

## 0. Prerequisites (Run First)

```bash
cd arkitekt-forge-ui-refreshv2.0
pnpm remove mermaid
pnpm add @xyflow/react @dagrejs/dagre html-to-image jszip file-saver
pnpm add -D @types/file-saver
```

---

## 1. SACRED RULES (Read Before Every Change)

These are non negotiable constraints. Violating any one means the implementation is wrong.

1. **The v12 architecture document is the bible.** The 22 state kanban, Context Hub, Proof Chain, BullMQ orchestrator are all implemented and working. Do NOT reinvent them.

2. **Extend, never replace.** The following functions already work correctly. Extend them for new scope levels, do not rewrite them:
   - `generateDesignArtifact()` in `context.tsx` line 482
   - `approveStoryDesignArtifact()` in `context.tsx` line 576
   - `rejectStoryDesignArtifact()` in `context.tsx` line 607
   - `advanceStory()` in `context.tsx` line 799
   - `checkDesignGate()` in `artifactRegistry.ts`
   - `addAuditEvent()` pattern used throughout

3. **Design system tokens.** All new UI must use:
   - Cards: `rounded-[18px] border border-slate-200 shadow-sm`
   - Sidebar items: `rounded-[22px]`
   - Typography: Inter font, `tracking-tight` on headings
   - Labels: `text-[11px] font-semibold uppercase tracking-[0.28em]`
   - Colors: navy-900, gold-500, slate-50/100/200/300/400/500/600/700/800
   - Animations: framer-motion `AnimatePresence` and `motion.div`
   - Icons: lucide-react
   - Primitives: Radix UI (DropdownMenu, Dialog, Tooltip already in deps)

4. **No dashes in any text output.** Use "to" for ranges. Use colons or commas for separation. No em dashes, en dashes, or hyphens as separators.

5. **GCP Saudi region (me-central2).** PlantUML server deploys here. No external SaaS for rendering.

6. **DeliveryFlow kanban is untouched.** Stories still appear in phase columns. Changes happen inside the story drawer and Architecture screen only.

7. **Proof Chain is additive.** Every generate, approve, reject action must call `addAuditEvent()` with a `proofHash`.

---

## 2. TYPE DEFINITIONS

### 2.1 Create `shared/types/designArtifacts.ts`

```typescript
// shared/types/designArtifacts.ts

export type ArtifactScope = 'project' | 'epic' | 'story';
export type ArtifactRenderer = 'xyflow' | 'plantuml' | 'table' | 'markdown';
export type ArtifactStatus = 'not_generated' | 'generating' | 'draft' | 'approved' | 'rejected';

export interface XYFlowDocument {
  nodes: XYFlowNode[];
  edges: XYFlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface XYFlowNode {
  id: string;
  type: 'c4System' | 'c4Container' | 'c4Component' | 'c4Database' | 'c4Boundary' | 'flowStep' | 'flowDecision' | 'flowStartEnd' | 'stateNode';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    technology?: string;
    stereotype?: string;
    color?: string;
  };
  parentId?: string;
  width?: number;
  height?: number;
}

export interface XYFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'labeled' | 'default';
  label?: string;
  animated?: boolean;
  data?: {
    protocol?: string;
    description?: string;
  };
}

export interface ProjectDesignArtifact {
  id: string;
  projectId: string;
  typeId: string;
  scope: 'project';
  status: ArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  proofHash?: string;
  version: number;
}

export interface EpicDesignArtifact {
  id: string;
  epicId: string;
  projectId: string;
  typeId: string;
  scope: 'epic';
  status: ArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  proofHash?: string;
  version: number;
}

export interface DesignExportFormat {
  type: 'png' | 'svg' | 'pdf' | 'drawio' | 'json' | 'zip';
  label: string;
  extension: string;
}

export const EXPORT_FORMATS: DesignExportFormat[] = [
  { type: 'png', label: 'PNG Image', extension: '.png' },
  { type: 'svg', label: 'SVG Vector', extension: '.svg' },
  { type: 'pdf', label: 'PDF Document', extension: '.pdf' },
  { type: 'drawio', label: 'Draw.io Editable', extension: '.drawio' },
  { type: 'json', label: 'Raw JSON Source', extension: '.json' },
  { type: 'zip', label: 'All Formats (ZIP)', extension: '.zip' },
];
```

### 2.2 Export from shared types barrel

Add to `shared/types/index.ts`:
```typescript
export * from './designArtifacts';
```

---

## 3. MODIFY `artifactRegistry.ts`

### 3.1 Add scope and renderer to ArtifactConfig interface

Find the `ArtifactConfig` interface (approximately line 8) and add two fields:

```typescript
// ADD these fields to the existing interface:
scope: ArtifactScope;
renderer: ArtifactRenderer;
```

### 3.2 Update every entry in ARTIFACT_CONFIGS

For each existing artifact config, add the `scope` and `renderer` fields:

**Tier 1 (Project Level):**

| Artifact ID | scope | renderer |
|-------------|-------|----------|
| `solution-architecture` | `'project'` | `'xyflow'` |
| `deployment-architecture` | `'project'` | `'xyflow'` |
| `security-architecture` | `'project'` | `'plantuml'` |
| `compliance-mapping` | `'project'` | `'table'` |

**Add NEW entry for Technology Stack:**

```typescript
'technology-stack': {
  id: 'technology-stack',
  label: 'Technology Stack',
  scope: 'project',
  renderer: 'markdown',
  outputType: 'text',
  contextPassMode: 'summarizable',
  prerequisites: ['solution-architecture'],
  mandatory: false,
  stakeholderViews: { cto: true, engineer: true, product: false, security: false, devops: true },
  agentName: 'Architecture Agent',
  description: 'Language, framework, database, infrastructure decisions with rationale.',
  layer: 1,
},
```

**Tier 2 (Epic Level):**

| Artifact ID | scope | renderer |
|-------------|-------|----------|
| `component-architecture` | `'epic'` | `'xyflow'` |
| `data-model` | `'epic'` | `'plantuml'` |
| `api-design` | `'epic'` | `'table'` |

**Tier 3 (Story Level):**

| Artifact ID | scope | renderer |
|-------------|-------|----------|
| `user-flow` | `'story'` | `'xyflow'` |
| `sequence-diagram` | `'story'` | `'plantuml'` |
| `technical-architecture` | `'story'` | `'xyflow'` |

### 3.3 Rewrite `checkDesignGate()` function

Replace the entire `checkDesignGate` function with:

```typescript
export function checkDesignGate(
  storyArtifacts: Partial<Record<ArtifactTypeId, StoryDesignArtifact>>,
  projectArtifacts?: ProjectDesignArtifact[],
  epicArtifacts?: EpicDesignArtifact[],
  complexityTier?: 'low' | 'medium' | 'high' | 'critical'
): {
  passed: boolean;
  missing: string[];
  tier1Passed: boolean;
  tier2Passed: boolean;
  tier3Passed: boolean;
  tier1Missing: string[];
  tier2Missing: string[];
  tier3Missing: string[];
  approvedCount: number;
  totalRequired: number;
} {
  const tier1Missing: string[] = [];
  const tier2Missing: string[] = [];
  const tier3Missing: string[] = [];
  let approvedCount = 0;
  let totalRequired = 0;

  const complexity = complexityTier ?? 'medium';

  for (const [typeId, config] of Object.entries(ARTIFACT_CONFIGS)) {
    if (!config.mandatory) continue;

    totalRequired++;

    if (config.scope === 'project') {
      const artifact = (projectArtifacts ?? []).find(a => a.typeId === typeId);
      if (artifact && artifact.status === 'approved') {
        approvedCount++;
      } else {
        tier1Missing.push(config.label);
      }
    } else if (config.scope === 'epic') {
      const artifact = (epicArtifacts ?? []).find(a => a.typeId === typeId);
      if (artifact && artifact.status === 'approved') {
        approvedCount++;
      } else {
        tier2Missing.push(config.label);
      }
    } else {
      const artifact = storyArtifacts[typeId as ArtifactTypeId];
      if (artifact && artifact.status === 'approved') {
        approvedCount++;
      } else {
        tier3Missing.push(config.label);
      }
    }
  }

  const allMissing = [...tier1Missing, ...tier2Missing, ...tier3Missing];

  return {
    passed: allMissing.length === 0,
    missing: allMissing,
    tier1Passed: tier1Missing.length === 0,
    tier2Passed: tier2Missing.length === 0,
    tier3Passed: tier3Missing.length === 0,
    tier1Missing,
    tier2Missing,
    tier3Missing,
    approvedCount,
    totalRequired,
  };
}
```

### 3.4 Add helper functions

Add at the bottom of `artifactRegistry.ts`:

```typescript
export function getArtifactsByScope(scope: ArtifactScope): ArtifactConfig[] {
  return Object.values(ARTIFACT_CONFIGS).filter(c => c.scope === scope);
}

export function getProjectArtifactConfigs(): ArtifactConfig[] {
  return getArtifactsByScope('project');
}

export function getEpicArtifactConfigs(): ArtifactConfig[] {
  return getArtifactsByScope('epic');
}

export function getStoryArtifactConfigs(): ArtifactConfig[] {
  return getArtifactsByScope('story');
}
```

---

## 4. MODIFY `context.tsx` (ForgeProvider)

### 4.1 Add state for project and epic artifacts

Find the state declarations inside `ForgeProvider` (around line 30 to 80). Add:

```typescript
const [projectDesignArtifacts, setProjectDesignArtifacts] = useState<ProjectDesignArtifact[]>([]);
const [epicDesignArtifacts, setEpicDesignArtifacts] = useState<EpicDesignArtifact[]>([]);
```

### 4.2 Add `generateProjectArtifact` function

Add after the existing `generateDesignArtifact` function (after line ~575):

```typescript
const generateProjectArtifact = useCallback(async (projectId: string, typeId: ArtifactTypeId) => {
  const config = ARTIFACT_CONFIGS[typeId];
  if (config.scope !== 'project') {
    throw new Error(`Artifact ${typeId} is not project scoped`);
  }

  // Validate prerequisites are approved at project level
  for (const prereqId of config.prerequisites) {
    const prereq = projectDesignArtifacts.find(a => a.projectId === projectId && a.typeId === prereqId);
    if (!prereq || prereq.status !== 'approved') {
      throw new Error(`Prerequisite ${prereqId} must be approved before generating ${typeId}`);
    }
  }

  // Build prerequisite context (same pattern as existing generateDesignArtifact)
  const prerequisiteContext: Record<string, string> = {};
  for (const prereqId of config.prerequisites) {
    const prereq = projectDesignArtifacts.find(a => a.projectId === projectId && a.typeId === prereqId);
    if (prereq) {
      const prereqConfig = ARTIFACT_CONFIGS[prereqId as ArtifactTypeId];
      if (prereqConfig.contextPassMode === 'raw') {
        prerequisiteContext[prereqId] = prereq.content;
      } else {
        prerequisiteContext[prereqId] = prereq.content.slice(0, 400);
      }
    }
  }

  // Set generating state
  const tempId = `proj-${projectId}-${typeId}-${Date.now()}`;
  setProjectDesignArtifacts(prev => [...prev, {
    id: tempId,
    projectId,
    typeId,
    scope: 'project',
    status: 'generating',
    content: '',
    version: 1,
  }]);

  try {
    const response = await fetch('/api/project/design-artifact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        typeId,
        renderer: config.renderer,
        prerequisiteContext,
        projectDescription: activeProject?.description ?? '',
      }),
    });

    if (!response.ok) throw new Error('Generation failed');

    const result = await response.json();

    setProjectDesignArtifacts(prev => prev.map(a =>
      a.id === tempId ? {
        ...a,
        id: result.id,
        status: 'draft',
        content: result.content,
        renderedSvg: result.renderedSvg,
        generatedAt: new Date().toISOString(),
        proofHash: result.proofHash,
      } : a
    ));

    // Proof chain audit event
    addAuditEvent({
      type: 'design_artifact_generated',
      scope: 'project',
      entityId: projectId,
      artifactTypeId: typeId,
      proofHash: result.proofHash,
    });
  } catch (error) {
    setProjectDesignArtifacts(prev => prev.filter(a => a.id !== tempId));
    throw error;
  }
}, [projectDesignArtifacts, activeProject]);
```

### 4.3 Add `approveProjectArtifact` function

```typescript
const approveProjectArtifact = useCallback((artifactId: string) => {
  setProjectDesignArtifacts(prev => prev.map(a =>
    a.id === artifactId ? {
      ...a,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.email ?? 'unknown',
    } : a
  ));

  const artifact = projectDesignArtifacts.find(a => a.id === artifactId);
  if (artifact) {
    addAuditEvent({
      type: 'design_artifact_approved',
      scope: 'project',
      entityId: artifact.projectId,
      artifactTypeId: artifact.typeId,
      proofHash: generateProofHash(artifact.content, 'approved'),
    });
  }
}, [projectDesignArtifacts, currentUser]);
```

### 4.4 Add `rejectProjectArtifact` function

```typescript
const rejectProjectArtifact = useCallback((artifactId: string, reason: string) => {
  setProjectDesignArtifacts(prev => prev.map(a =>
    a.id === artifactId ? {
      ...a,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedReason: reason,
    } : a
  ));

  const artifact = projectDesignArtifacts.find(a => a.id === artifactId);
  if (artifact) {
    addAuditEvent({
      type: 'design_artifact_rejected',
      scope: 'project',
      entityId: artifact.projectId,
      artifactTypeId: artifact.typeId,
      reason,
      proofHash: generateProofHash(artifact.content, 'rejected'),
    });
  }
}, [projectDesignArtifacts, currentUser]);
```

### 4.5 Add parallel epic functions

Create `generateEpicArtifact`, `approveEpicArtifact`, `rejectEpicArtifact` using the same pattern as project functions above. Key differences:
- Uses `epicId` instead of `projectId`
- Prerequisite context includes approved project level Tier 1 artifacts as additional context
- Posts to `/api/epic/design-artifact`
- Sets on `epicDesignArtifacts` state

### 4.6 Add to context value

Find where the context value is assembled (the object passed to `ForgeContext.Provider`). Add:

```typescript
projectDesignArtifacts,
epicDesignArtifacts,
generateProjectArtifact,
approveProjectArtifact,
rejectProjectArtifact,
generateEpicArtifact,
approveEpicArtifact,
rejectEpicArtifact,
```

---

## 5. CREATE `XYFlowDiagram.tsx`

### File: `client/src/forge/components/XYFlowDiagram.tsx`

```typescript
'use client';

import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Download, Maximize2, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { customNodeTypes } from './nodes';
import { LabeledEdge } from './edges/LabeledEdge';
import { applyDagreLayout } from '../layout/dagre';
import type { XYFlowDocument } from '@shared/types/designArtifacts';

interface XYFlowDiagramProps {
  sourceContent: string;
  readOnly?: boolean;
  onExport?: (format: 'png' | 'svg' | 'drawio') => void;
  title?: string;
  className?: string;
}

const edgeTypes = { labeled: LabeledEdge };

export function XYFlowDiagram({ sourceContent, readOnly = true, onExport, title, className }: XYFlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const document = useMemo<XYFlowDocument>(() => {
    try {
      const parsed = JSON.parse(sourceContent);
      // Apply auto layout if nodes have position {0,0}
      const needsLayout = parsed.nodes.every((n: Node) => n.position.x === 0 && n.position.y === 0);
      if (needsLayout) {
        return applyDagreLayout(parsed);
      }
      return parsed;
    } catch {
      return { nodes: [], edges: [] };
    }
  }, [sourceContent]);

  const [nodes, setNodes, onNodesChange] = useNodesState(document.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(document.edges);

  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    const dataUrl = await toPng(containerRef.current, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });
    const link = window.document.createElement('a');
    link.download = `${title ?? 'diagram'}.png`;
    link.href = dataUrl;
    link.click();
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-[18px] border border-slate-200 overflow-hidden bg-slate-50 ${className ?? ''}`}
      style={{ height: 400 }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          nodeTypes={customNodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
          <MiniMap
            style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            maskColor="rgba(248, 250, 252, 0.7)"
          />
          <Controls
            showInteractive={false}
            style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Panel position="top-right">
            <div className="flex gap-1.5">
              <button
                onClick={handleExportPng}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
                title="Export PNG"
              >
                <Download size={14} className="text-slate-600" />
              </button>
              {onExport && (
                <button
                  onClick={() => onExport('drawio')}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
                  title="Export Draw.io"
                >
                  <Maximize2 size={14} className="text-slate-600" />
                </button>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </motion.div>
  );
}
```

---

## 6. CREATE CUSTOM NODE COMPONENTS

### 6.1 Create directory: `client/src/forge/components/nodes/`

### 6.2 File: `nodes/index.ts`

```typescript
import { C4SystemNode } from './C4SystemNode';
import { C4ContainerNode } from './C4ContainerNode';
import { C4ComponentNode } from './C4ComponentNode';
import { C4DatabaseNode } from './C4DatabaseNode';
import { C4BoundaryNode } from './C4BoundaryNode';
import { FlowStepNode } from './FlowStepNode';
import { FlowDecisionNode } from './FlowDecisionNode';
import { FlowStartEndNode } from './FlowStartEndNode';
import { StateNode } from './StateNode';

export const customNodeTypes = {
  c4System: C4SystemNode,
  c4Container: C4ContainerNode,
  c4Component: C4ComponentNode,
  c4Database: C4DatabaseNode,
  c4Boundary: C4BoundaryNode,
  flowStep: FlowStepNode,
  flowDecision: FlowDecisionNode,
  flowStartEnd: FlowStartEndNode,
  stateNode: StateNode,
};
```

### 6.3 File: `nodes/C4SystemNode.tsx`

```typescript
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface C4SystemData {
  label: string;
  description?: string;
  technology?: string;
}

export const C4SystemNode = memo(({ data, selected }: NodeProps<C4SystemData>) => (
  <div
    className={`px-4 py-3 rounded-xl min-w-[160px] text-center border-2 transition-shadow ${
      selected ? 'shadow-lg ring-2 ring-gold-500/30' : ''
    }`}
    style={{ background: '#1168bd', borderColor: '#0b4d8c', color: 'white' }}
    role="group"
    aria-label={`System: ${data.label}`}
  >
    <div className="text-xs font-bold">{data.label}</div>
    {data.technology && (
      <div className="text-[10px] opacity-80 mt-0.5">[{data.technology}]</div>
    )}
    {data.description && (
      <div className="text-[10px] opacity-70 mt-1">{data.description}</div>
    )}
    <Handle type="target" position={Position.Top} className="!bg-white/50 !w-2 !h-2" />
    <Handle type="source" position={Position.Bottom} className="!bg-white/50 !w-2 !h-2" />
  </div>
));

C4SystemNode.displayName = 'C4SystemNode';
```

### 6.4 File: `nodes/C4ContainerNode.tsx`

Same pattern as C4SystemNode but with:
- Background: `#438dd5`, border: `#2d6eaa`

### 6.5 File: `nodes/C4ComponentNode.tsx`

Same pattern but with:
- Background: `#85bbf0`, border: `#5a9dd6`, text color: `#0b4d8c`

### 6.6 File: `nodes/C4DatabaseNode.tsx`

Same pattern but with cylinder visual (add `rounded-b-[50%]` or use an SVG cylinder shape). Background: `#438dd5`.

### 6.7 File: `nodes/C4BoundaryNode.tsx`

```typescript
import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';

interface C4BoundaryData {
  label: string;
  description?: string;
}

export const C4BoundaryNode = memo(({ data }: NodeProps<C4BoundaryData>) => (
  <div
    className="px-4 py-3 rounded-xl min-w-[200px] min-h-[120px] border-2 border-dashed border-slate-400"
    style={{ background: 'rgba(241, 245, 249, 0.5)' }}
  >
    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
      {data.label}
    </div>
    {data.description && (
      <div className="text-[10px] text-slate-400 mt-0.5">{data.description}</div>
    )}
  </div>
));

C4BoundaryNode.displayName = 'C4BoundaryNode';
```

### 6.8 File: `nodes/FlowStepNode.tsx`

```typescript
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface FlowStepData {
  label: string;
  description?: string;
}

export const FlowStepNode = memo(({ data, selected }: NodeProps<FlowStepData>) => (
  <div
    className={`px-4 py-2.5 rounded-full min-w-[120px] text-center bg-white border border-slate-200 transition-shadow ${
      selected ? 'shadow-md ring-2 ring-blue-500/20' : 'shadow-sm'
    }`}
  >
    <div className="text-xs font-semibold text-slate-700">{data.label}</div>
    {data.description && (
      <div className="text-[10px] text-slate-400 mt-0.5">{data.description}</div>
    )}
    <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-2 !h-2" />
    <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-2 !h-2" />
  </div>
));

FlowStepNode.displayName = 'FlowStepNode';
```

### 6.9 File: `nodes/FlowDecisionNode.tsx`

Diamond shape using CSS `transform: rotate(45deg)` with inner content counter rotated.

### 6.10 File: `nodes/FlowStartEndNode.tsx`

Pill shape (fully rounded), green fill for start, red fill for end. Differentiate via `data.type: 'start' | 'end'`.

### 6.11 File: `nodes/StateNode.tsx`

Rounded rectangle with a colored left border indicating state type.

---

## 7. CREATE LABELED EDGE

### File: `client/src/forge/components/edges/LabeledEdge.tsx`

```typescript
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

interface LabeledEdgeData {
  protocol?: string;
  description?: string;
}

export function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, style, markerEnd
}: EdgeProps<LabeledEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{ ...style, strokeWidth: 1.5, stroke: '#94a3b8' }}
        markerEnd={markerEnd}
      />
      {data?.protocol && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[9px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm pointer-events-none"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.protocol}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
```

---

## 8. CREATE DAGRE AUTO LAYOUT

### File: `client/src/forge/layout/dagre.ts`

```typescript
import dagre from '@dagrejs/dagre';
import type { XYFlowDocument } from '@shared/types/designArtifacts';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 60;

export function applyDagreLayout(doc: XYFlowDocument, direction: 'TB' | 'LR' = 'TB'): XYFlowDocument {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });

  for (const node of doc.nodes) {
    graph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    });
  }

  for (const edge of doc.edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  const layoutedNodes = doc.nodes.map(node => {
    const nodeWithPosition = graph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width ?? DEFAULT_NODE_WIDTH) / 2,
        y: nodeWithPosition.y - (node.height ?? DEFAULT_NODE_HEIGHT) / 2,
      },
    };
  });

  return { ...doc, nodes: layoutedNodes };
}
```

---

## 9. CREATE `PlantUMLDiagram.tsx`

### File: `client/src/forge/components/PlantUMLDiagram.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Code2, Eye } from 'lucide-react';

interface PlantUMLDiagramProps {
  source: string;
  readOnly?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
  title?: string;
  className?: string;
}

export function PlantUMLDiagram({ source, readOnly = true, onExport, title, className }: PlantUMLDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    async function renderDiagram() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/plantuml/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source }),
        });
        if (!response.ok) throw new Error('Render failed');
        const result = await response.json();
        setSvgContent(result.svg);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setLoading(false);
      }
    }

    if (source) renderDiagram();
  }, [source]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${title ?? 'diagram'}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [svgContent, title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-[18px] border border-slate-200 overflow-hidden bg-white ${className ?? ''}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            PlantUML
          </span>
          {title && <span className="text-xs font-medium text-slate-600">{title}</span>}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowSource(!showSource)}
            className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            title={showSource ? 'Show preview' : 'Show source'}
          >
            {showSource ? <Eye size={12} /> : <Code2 size={12} />}
          </button>
          <button
            onClick={handleDownloadSvg}
            className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            title="Download SVG"
          >
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" style={{ minHeight: 200 }}>
        {loading && (
          <div className="h-40 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
        )}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}
        {!loading && !error && !showSource && (
          <div
            className="flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
        {showSource && (
          <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 overflow-auto max-h-[300px] font-mono">
            {source}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
```

---

## 10. CREATE `DesignContextPanel.tsx`

### File: `client/src/forge/components/DesignContextPanel.tsx`

```typescript
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link2, Brain, Shield } from 'lucide-react';
import { useForge } from '../context';
import { ARTIFACT_CONFIGS } from '../artifactRegistry';
import type { ProjectDesignArtifact, EpicDesignArtifact } from '@shared/types/designArtifacts';

interface DesignContextPanelProps {
  storyId: string;
  epicId: string;
  projectId: string;
}

export function DesignContextPanel({ storyId, epicId, projectId }: DesignContextPanelProps) {
  const { projectDesignArtifacts, epicDesignArtifacts, stories } = useForge();

  const story = stories.find(s => s.id === storyId);

  const upstreamProjectArtifacts = useMemo(
    () => projectDesignArtifacts.filter(a => a.projectId === projectId && a.status === 'approved'),
    [projectDesignArtifacts, projectId]
  );

  const upstreamEpicArtifacts = useMemo(
    () => epicDesignArtifacts.filter(a => a.epicId === epicId && a.status === 'approved'),
    [epicDesignArtifacts, epicId]
  );

  const memoryPatterns = story?.memoryEvents?.slice(0, 3) ?? [];

  return (
    <div className="space-y-5">
      {/* Upstream Artifacts */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">
          Upstream Context (Auto Injected)
        </h4>
        <div className="space-y-2">
          {upstreamProjectArtifacts.map(artifact => (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={12} className="text-gold-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {ARTIFACT_CONFIGS[artifact.typeId as keyof typeof ARTIFACT_CONFIGS]?.label ?? artifact.typeId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                Tier 1 · Project Level · Approved
              </div>
            </motion.div>
          ))}
          {upstreamEpicArtifacts.map(artifact => (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={12} className="text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {ARTIFACT_CONFIGS[artifact.typeId as keyof typeof ARTIFACT_CONFIGS]?.label ?? artifact.typeId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Tier 2 · Epic Level · Approved
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Context Hub Memory */}
      {memoryPatterns.length > 0 && (
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">
            Context Hub Memory
          </h4>
          <div className="space-y-2">
            {memoryPatterns.map((pattern, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={12} className="text-purple-500" />
                  <span className="text-xs font-semibold text-slate-700">{pattern.summary}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Pattern from {pattern.sourcePhase} phase · Confidence: {pattern.confidence}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Proof Chain */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">
          Proof Chain
        </h4>
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-gold-500 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={12} className="text-gold-500" />
            <span className="text-xs font-semibold text-slate-700">Audit Trail</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Immutable record of all generate, approve, and reject actions
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 11. CREATE EXPORT UTILITIES

### 11.1 File: `client/src/forge/export/toDrawio.ts`

```typescript
import type { XYFlowDocument, XYFlowNode, XYFlowEdge } from '@shared/types/designArtifacts';

const NODE_STYLE_MAP: Record<string, string> = {
  c4System: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#1168bd;fontColor=#ffffff;strokeColor=#0b4d8c;',
  c4Container: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#438dd5;fontColor=#ffffff;strokeColor=#2d6eaa;',
  c4Component: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#85bbf0;fontColor=#0b4d8c;strokeColor=#5a9dd6;',
  c4Database: 'shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#438dd5;fontColor=#ffffff;strokeColor=#2d6eaa;size=15;',
  c4Boundary: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=none;strokeColor=#94a3b8;',
  flowStep: 'rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#ffffff;strokeColor=#e2e8f0;',
  flowDecision: 'rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#e2e8f0;',
  flowStartEnd: 'ellipse;whiteSpace=wrap;html=1;fillColor=#22c55e;fontColor=#ffffff;strokeColor=#16a34a;',
  stateNode: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8fafc;strokeColor=#e2e8f0;',
};

export function toDrawioXml(doc: XYFlowDocument): string {
  let cellId = 2;

  const cells = doc.nodes.map(node => {
    const id = cellId++;
    const style = NODE_STYLE_MAP[node.type] ?? NODE_STYLE_MAP.c4Component;
    const width = node.width ?? 180;
    const height = node.height ?? 60;
    const label = node.data.label + (node.data.technology ? `\n[${node.data.technology}]` : '');

    return `      <mxCell id="${id}" value="${escapeXml(label)}" style="${style}" vertex="1" parent="1">
        <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${width}" height="${height}" as="geometry" />
      </mxCell>`;
  });

  const nodeIdMap: Record<string, number> = {};
  let idx = 2;
  doc.nodes.forEach(node => { nodeIdMap[node.id] = idx++; });

  const edgeCells = doc.edges.map(edge => {
    const id = cellId++;
    const sourceId = nodeIdMap[edge.source];
    const targetId = nodeIdMap[edge.target];
    const label = edge.data?.protocol ?? edge.label ?? '';
    return `      <mxCell id="${id}" value="${escapeXml(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;" edge="1" source="${sourceId}" target="${targetId}" parent="1">
        <mxGeometry relative="1" as="geometry" />
      </mxCell>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${cells.join('\n')}
${edgeCells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### 11.2 File: `client/src/forge/export/toPng.ts`

```typescript
import { toPng as htmlToPng } from 'html-to-image';

export async function exportToPng(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await htmlToPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    quality: 0.95,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
```

### 11.3 File: `client/src/forge/export/toZip.ts`

```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toDrawioXml } from './toDrawio';
import { toPng } from 'html-to-image';
import type { XYFlowDocument } from '@shared/types/designArtifacts';

interface ArtifactExportItem {
  name: string;
  content: string;
  renderer: 'xyflow' | 'plantuml' | 'table' | 'markdown';
  renderedSvg?: string;
}

export async function exportDesignPack(artifacts: ArtifactExportItem[], projectName: string): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(`${projectName}_Design_Pack`);
  if (!folder) return;

  for (const artifact of artifacts) {
    const safeName = artifact.name.replace(/[^a-zA-Z0-9]/g, '_');

    // Always include raw source
    if (artifact.renderer === 'xyflow') {
      folder.file(`${safeName}.json`, artifact.content);
      // Draw.io export
      try {
        const doc: XYFlowDocument = JSON.parse(artifact.content);
        folder.file(`${safeName}.drawio`, toDrawioXml(doc));
      } catch {}
    } else if (artifact.renderer === 'plantuml') {
      folder.file(`${safeName}.puml`, artifact.content);
    } else if (artifact.renderer === 'table') {
      folder.file(`${safeName}.json`, artifact.content);
    } else {
      folder.file(`${safeName}.md`, artifact.content);
    }

    // Include rendered SVG if available
    if (artifact.renderedSvg) {
      folder.file(`${safeName}.svg`, artifact.renderedSvg);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectName}_Design_Pack.zip`);
}
```

---

## 12. CREATE `DesignArtifactExport.tsx`

### File: `client/src/forge/components/DesignArtifactExport.tsx`

```typescript
'use client';

import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, FileImage, FileText, FileCode, Package } from 'lucide-react';
import { EXPORT_FORMATS } from '@shared/types/designArtifacts';

interface DesignArtifactExportProps {
  artifactName: string;
  content: string;
  renderer: 'xyflow' | 'plantuml' | 'table' | 'markdown';
  renderedSvg?: string;
  onExport: (format: string) => void;
}

const FORMAT_ICONS: Record<string, typeof Download> = {
  png: FileImage,
  svg: FileImage,
  pdf: FileText,
  drawio: FileCode,
  json: FileCode,
  zip: Package,
};

export function DesignArtifactExport({ artifactName, content, renderer, renderedSvg, onExport }: DesignArtifactExportProps) {
  const [open, setOpen] = useState(false);

  // Filter formats based on renderer
  const availableFormats = EXPORT_FORMATS.filter(f => {
    if (renderer === 'xyflow') return true;
    if (renderer === 'plantuml') return f.type !== 'drawio';
    if (renderer === 'table') return f.type === 'json' || f.type === 'pdf';
    return f.type === 'pdf' || f.type === 'json';
  });

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors">
          <Download size={13} className="text-slate-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50"
          sideOffset={5}
          align="end"
        >
          {availableFormats.map(format => {
            const Icon = FORMAT_ICONS[format.type] ?? Download;
            return (
              <DropdownMenu.Item
                key={format.type}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-slate-50 outline-none"
                onSelect={() => onExport(format.type)}
              >
                <Icon size={14} className="text-slate-400" />
                <span className="flex-1">{format.label}</span>
                <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {format.extension}
                </span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

---

## 13. REFACTOR `ArchitectureScreen.tsx`

### Current state: 383 lines showing 7 architecture layers, service impact map, design artifacts under review.

### New purpose: Project level Tier 1 artifact management surface.

Replace the content of this screen with:

```typescript
// Key structural changes:
// 1. Remove the hardcoded 7-layer architecture section
// 2. Replace with Tier 1 artifact grid (project level)
// 3. Keep GitHubPanel in right column
// 4. Add project level Design Gate status
// 5. Add epic summary showing Tier 2 status per epic

// Layout (preserve existing 2-column pattern):
// Left (flex-1): Tier 1 artifact cards + Tier 2 summary
// Right (w-[360px]): GitHubPanel + Project Gate Status + Epic list
```

The screen should:
1. Read `projectDesignArtifacts` from ForgeContext
2. Display each Tier 1 artifact as a card with: icon, title, status pill, renderer tag
3. Cards with `status: 'approved'` show inline diagram preview (XYFlowDiagram or PlantUMLDiagram at reduced height)
4. Cards with `status: 'not_generated'` show "Generate with AI" button
5. Cards with `status: 'draft'` show Approve/Reject buttons
6. Header has "Export All" dropdown (using `exportDesignPack`)
7. Right panel shows project level gate status and list of epics with their Tier 2 completion percentage

---

## 14. MODIFY `ArtifactDependencyMap.tsx`

### Current state: 337 lines rendering artifact layers with stakeholder filter inside story drawer.

### Changes needed:

1. **Add Tier 1 and Tier 2 sections above existing content.** Before the existing story artifact layers, render:
   - "Project Architecture" section showing Tier 1 artifacts (read only, from `projectDesignArtifacts`)
   - "Epic Architecture" section showing Tier 2 artifacts (read only, from `epicDesignArtifacts`)

2. **Replace diagram renderer.** Find where `MermaidDiagram` is used and replace with:
```typescript
// Routing logic:
const config = ARTIFACT_CONFIGS[typeId];

switch (config.renderer) {
  case 'xyflow':
    return <XYFlowDiagram sourceContent={artifact.content} readOnly title={config.label} />;
  case 'plantuml':
    return <PlantUMLDiagram source={artifact.content} readOnly title={config.label} />;
  case 'table':
    return <TableRenderer data={artifact.content} />;
  case 'markdown':
    return <MarkdownRenderer content={artifact.content} />;
}
```

3. **Add export button per artifact card.** Place `<DesignArtifactExport />` in the top right of each card.

---

## 15. MODIFY `StoryDetailDrawer.tsx`

### 15.1 Update Design Gate check (line 529)

Replace:
```typescript
const designGate = story?.phase === "Design"
  ? checkDesignGate(story.storyDesignArtifacts ?? {})
  : { passed: true, missing: [] };
```

With:
```typescript
const { projectDesignArtifacts, epicDesignArtifacts } = useForge();

const designGate = story?.phase === "Design"
  ? checkDesignGate(
      story.storyDesignArtifacts ?? {},
      projectDesignArtifacts.filter(a => a.projectId === activeProjectId),
      epicDesignArtifacts.filter(a => a.epicId === story.epicId),
    )
  : { passed: true, missing: [], tier1Passed: true, tier2Passed: true, tier3Passed: true, tier1Missing: [], tier2Missing: [], tier3Missing: [], approvedCount: 0, totalRequired: 0 };
```

### 15.2 Add Context Panel to drawer body

The story drawer in expanded mode uses a grid layout. Add a right panel:

```typescript
// In the expanded (dialog) view of the drawer:
<div className="grid grid-cols-[1fr_340px] h-full">
  {/* Left: existing content (artifact map, activity) */}
  <div className="overflow-y-auto p-6">
    {/* existing drawer content */}
  </div>

  {/* Right: Context Panel (NEW) */}
  <div className="border-l border-slate-200 bg-slate-50 overflow-y-auto p-5">
    <DesignContextPanel
      storyId={story.id}
      epicId={story.epicId}
      projectId={activeProjectId}
    />
  </div>
</div>
```

### 15.3 Update Design Gate visual

Replace the simple gate indicator with a richer display showing tier breakdown:

```typescript
// Design Gate section in drawer
<div className="rounded-[14px] border border-slate-200 p-4 mb-5">
  <div className="flex items-center gap-2.5 mb-3">
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
      designGate.passed ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
    }`}>
      {designGate.passed ? <CheckCircle size={14} /> : <Clock size={14} />}
    </div>
    <span className="text-sm font-semibold text-slate-800">Design Gate</span>
    <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-md ${
      designGate.passed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
    }`}>
      {designGate.approvedCount} of {designGate.totalRequired} Approved
    </span>
  </div>
  <div className="flex gap-1.5 items-center">
    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
        style={{ width: `${(designGate.approvedCount / Math.max(designGate.totalRequired, 1)) * 100}%` }}
      />
    </div>
    <span className="text-[11px] font-medium text-slate-500 ml-2">
      {designGate.approvedCount}/{designGate.totalRequired}
    </span>
  </div>
</div>
```

---

## 16. SERVER ENDPOINTS

### 16.1 POST `/api/project/design-artifact`

Create in server route handler. Accepts:
```typescript
{
  projectId: string;
  typeId: string;
  renderer: 'xyflow' | 'plantuml' | 'table' | 'markdown';
  prerequisiteContext: Record<string, string>;
  projectDescription: string;
}
```

Logic:
1. Build AI prompt including prerequisiteContext and project description
2. For `renderer: 'xyflow'`: Instruct AI to return valid XYFlow JSON (nodes + edges). After receiving response, validate JSON, apply dagre layout, store.
3. For `renderer: 'plantuml'`: Instruct AI to return valid PlantUML source. After receiving, render via PlantUML server to validate syntax, store source + rendered SVG.
4. For `renderer: 'table'`: Instruct AI to return JSON array of row objects.
5. For `renderer: 'markdown'`: Instruct AI to return markdown text.
6. Generate proofHash from content.
7. Return `{ id, content, renderedSvg?, proofHash }`.

### 16.2 POST `/api/epic/design-artifact`

Same pattern as project endpoint. Additional context injection: include all approved project level artifacts as context.

### 16.3 POST `/api/plantuml/render`

Proxies PlantUML source to a local Docker container running PlantUML Server:

```typescript
// server/routes/plantuml.ts
export async function renderPlantUML(source: string): Promise<string> {
  const PLANTUML_SERVER = process.env.PLANTUML_SERVER_URL ?? 'http://localhost:8080';
  const encoded = encodePlantUML(source);
  const response = await fetch(`${PLANTUML_SERVER}/svg/${encoded}`);
  if (!response.ok) throw new Error('PlantUML render failed');
  return response.text();
}
```

### 16.4 PlantUML Server Deployment

Docker Compose addition:
```yaml
plantuml:
  image: plantuml/plantuml-server:jetty
  ports:
    - "8080:8080"
  restart: unless-stopped
```

For GCP production: Deploy as Cloud Run service in me-central2.

### 16.5 GET `/api/project/:id/design-pack`

Server side ZIP generation (alternative to client side). Generates ZIP with all approved artifacts in multiple formats.

---

## 17. SEED DATA

### File: `client/src/forge/data/designArtifacts.ts`

Replace contents with seed data for demo purposes:

```typescript
import type { ProjectDesignArtifact, EpicDesignArtifact } from '@shared/types/designArtifacts';

export const seedProjectArtifacts: ProjectDesignArtifact[] = [
  {
    id: 'proj-art-1',
    projectId: 'project-1',
    typeId: 'solution-architecture',
    scope: 'project',
    status: 'approved',
    content: JSON.stringify({
      nodes: [
        { id: '1', type: 'c4System', position: { x: 0, y: 0 }, data: { label: 'Forge Platform', technology: 'Software System' } },
        { id: '2', type: 'c4Container', position: { x: 0, y: 0 }, data: { label: 'Web Application', technology: 'React, TypeScript' } },
        { id: '3', type: 'c4Container', position: { x: 0, y: 0 }, data: { label: 'API Gateway', technology: 'Node.js, Express' } },
        { id: '4', type: 'c4Container', position: { x: 0, y: 0 }, data: { label: 'Auth Service', technology: 'GCP IAM' } },
        { id: '5', type: 'c4Component', position: { x: 0, y: 0 }, data: { label: 'Design Agent', technology: 'BullMQ Worker' } },
        { id: '6', type: 'c4Component', position: { x: 0, y: 0 }, data: { label: 'Context Hub', technology: 'PostgreSQL' } },
        { id: '7', type: 'c4Component', position: { x: 0, y: 0 }, data: { label: 'Proof Chain', technology: 'Immutable Log' } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2', type: 'labeled', data: { protocol: 'HTTPS' } },
        { id: 'e2', source: '1', target: '3', type: 'labeled', data: { protocol: 'REST/gRPC' } },
        { id: 'e3', source: '1', target: '4', type: 'labeled', data: { protocol: 'OAuth 2.0' } },
        { id: 'e4', source: '3', target: '5', type: 'labeled', data: { protocol: 'BullMQ' } },
        { id: 'e5', source: '3', target: '6', type: 'labeled', data: { protocol: 'SQL' } },
        { id: 'e6', source: '5', target: '7', type: 'labeled', data: { protocol: 'Events' } },
      ],
    }),
    generatedAt: '2026-04-28T10:00:00Z',
    approvedAt: '2026-04-29T14:00:00Z',
    approvedBy: 'farrukh@farrukhmunir.com',
    proofHash: 'a7c3e1f2d4b6',
    version: 1,
  },
  {
    id: 'proj-art-2',
    projectId: 'project-1',
    typeId: 'deployment-architecture',
    scope: 'project',
    status: 'approved',
    content: '...', // PlantUML source for deployment diagram
    generatedAt: '2026-04-28T11:00:00Z',
    approvedAt: '2026-04-30T09:00:00Z',
    approvedBy: 'farrukh@farrukhmunir.com',
    proofHash: 'd4f2b8a1c3e7',
    version: 1,
  },
  {
    id: 'proj-art-3',
    projectId: 'project-1',
    typeId: 'security-architecture',
    scope: 'project',
    status: 'draft',
    content: '...', // XYFlow JSON for security architecture
    generatedAt: '2026-05-01T08:00:00Z',
    proofHash: 'f1a2b3c4d5e6',
    version: 1,
  },
];

export const seedEpicArtifacts: EpicDesignArtifact[] = [
  {
    id: 'epic-art-1',
    epicId: 'epic-1',
    projectId: 'project-1',
    typeId: 'component-architecture',
    scope: 'epic',
    status: 'approved',
    content: '...', // XYFlow JSON
    generatedAt: '2026-04-29T10:00:00Z',
    approvedAt: '2026-04-30T11:00:00Z',
    approvedBy: 'farrukh@farrukhmunir.com',
    proofHash: 'b2c3d4e5f6a7',
    version: 1,
  },
];
```

---

## 18. FILES TO DELETE

After all new components are in place:

1. `client/src/forge/components/MermaidDiagram.tsx` (84 lines, replaced by XYFlowDiagram + PlantUMLDiagram)
2. `client/src/forge/components/DesignArtifactCard.tsx` (231 lines, replaced by unified card in ArtifactDependencyMap)
3. `client/src/forge/components/DesignArtifactModal.tsx` (if exists, replaced by inline rendering)
4. Remove `mermaid` from `package.json` (already done in step 0)

---

## 19. TESTING CHECKLIST

After implementation, verify each of these:

- [ ] `pnpm build` succeeds with zero errors
- [ ] `pnpm lint` passes
- [ ] All existing stories on DeliveryFlow kanban still render
- [ ] Architecture screen shows Tier 1 project artifacts
- [ ] Click on "Generate with AI" produces an artifact (mock or real)
- [ ] XYFlow diagrams render with draggable nodes and minimap
- [ ] PlantUML diagrams render as SVG with source toggle
- [ ] Approve button moves artifact to approved state
- [ ] Reject button shows rejection reason input
- [ ] Design Gate progress bar updates when artifacts are approved
- [ ] Design Gate blocks "Advance to Ready Dev" when incomplete
- [ ] Story drawer shows Context Panel in right column
- [ ] Context Panel lists upstream Tier 1 and Tier 2 artifacts
- [ ] Export dropdown offers PNG, SVG, PDF, Draw.io
- [ ] "Export All" produces a ZIP with all approved artifacts
- [ ] No mermaid imports remain: `grep -r "mermaid" client/src/ --include="*.ts" --include="*.tsx"` returns nothing
- [ ] No console errors in browser DevTools

---

## 20. SUMMARY OF ALL NEW FILES

| File | Lines (est) | Purpose |
|------|-------------|---------|
| `shared/types/designArtifacts.ts` | ~90 | Type definitions for entire system |
| `client/src/forge/components/XYFlowDiagram.tsx` | ~100 | Interactive canvas renderer |
| `client/src/forge/components/PlantUMLDiagram.tsx` | ~100 | Server rendered PlantUML |
| `client/src/forge/components/DesignContextPanel.tsx` | ~120 | Upstream artifact viewer |
| `client/src/forge/components/DesignArtifactExport.tsx` | ~70 | Export dropdown per artifact |
| `client/src/forge/components/nodes/index.ts` | ~15 | Node type registry |
| `client/src/forge/components/nodes/C4SystemNode.tsx` | ~30 | C4 system node |
| `client/src/forge/components/nodes/C4ContainerNode.tsx` | ~30 | C4 container node |
| `client/src/forge/components/nodes/C4ComponentNode.tsx` | ~30 | C4 component node |
| `client/src/forge/components/nodes/C4DatabaseNode.tsx` | ~30 | C4 database node |
| `client/src/forge/components/nodes/C4BoundaryNode.tsx` | ~25 | C4 boundary group |
| `client/src/forge/components/nodes/FlowStepNode.tsx` | ~30 | Flow step pill |
| `client/src/forge/components/nodes/FlowDecisionNode.tsx` | ~35 | Flow decision diamond |
| `client/src/forge/components/nodes/FlowStartEndNode.tsx` | ~30 | Flow start/end |
| `client/src/forge/components/nodes/StateNode.tsx` | ~30 | State diagram node |
| `client/src/forge/components/edges/LabeledEdge.tsx` | ~40 | Edge with protocol label |
| `client/src/forge/layout/dagre.ts` | ~50 | Auto layout utility |
| `client/src/forge/export/toDrawio.ts` | ~70 | Deterministic Draw.io export |
| `client/src/forge/export/toPng.ts` | ~20 | PNG export wrapper |
| `client/src/forge/export/toZip.ts` | ~60 | Bulk ZIP builder |
| `server/routes/plantuml.ts` | ~30 | PlantUML render proxy |

**Total new code: ~1,035 lines across 21 files**
**Total modified files: 6 existing files**
**Total deleted files: 2 to 3 legacy files**
**Net line change: approximately +800 lines**

---

## 21. EXECUTION ORDER (FOR CLAUDE CODE)

Execute these phases in order. Each phase must pass the build before proceeding.

1. **Types first.** Create `shared/types/designArtifacts.ts`, export from barrel.
2. **Registry changes.** Modify `artifactRegistry.ts` (add scope, renderer, new function).
3. **Layout utility.** Create `layout/dagre.ts`.
4. **Node components.** Create all files in `nodes/` directory.
5. **Edge component.** Create `edges/LabeledEdge.tsx`.
6. **XYFlowDiagram.** Create the component, import nodes and layout.
7. **PlantUMLDiagram.** Create the component.
8. **Export utilities.** Create `export/toDrawio.ts`, `toPng.ts`, `toZip.ts`.
9. **Export dropdown.** Create `DesignArtifactExport.tsx`.
10. **Context Panel.** Create `DesignContextPanel.tsx`.
11. **Context provider changes.** Modify `context.tsx` (add state, functions, context value).
12. **Architecture screen refactor.** Rewrite `ArchitectureScreen.tsx`.
13. **ArtifactDependencyMap refactor.** Add tiers, replace Mermaid rendering.
14. **StoryDetailDrawer.** Add context panel, update gate check.
15. **Seed data.** Replace `data/designArtifacts.ts`.
16. **Server endpoints.** Add routes.
17. **Delete legacy.** Remove MermaidDiagram, DesignArtifactCard.
18. **Final verification.** Run build, lint, visual check.
