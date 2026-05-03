export type ProjectArtifactStatus =
  | 'not_generated'
  | 'generating'
  | 'draft'
  | 'approved'
  | 'rejected';

export type ArtifactScope = 'project' | 'epic' | 'story';
export type ArtifactRenderer = 'xyflow' | 'plantuml' | 'table' | 'markdown';

export interface XYFlowDocument {
  nodes: XYFlowNode[];
  edges: XYFlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface XYFlowNode {
  id: string;
  type: 'c4System' | 'c4Container' | 'c4Component' | 'c4Database' | 'c4Boundary'
      | 'flowStep' | 'flowDecision' | 'flowStartEnd' | 'stateNode';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    technology?: string;
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
  data?: { protocol?: string; description?: string };
}

export interface ProjectDesignArtifact {
  id: string;
  projectId: string;
  typeId: string;
  scope: 'project';
  status: ProjectArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  proofHash?: string;
  version: number;
}

export interface EpicDesignArtifact {
  id: string;
  epicId: string;
  projectId: string;
  typeId: string;
  scope: 'epic';
  status: ProjectArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  proofHash?: string;
  version: number;
}

export type DesignExportType = 'png' | 'svg' | 'drawio' | 'json' | 'zip';
