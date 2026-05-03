import type { NodeTypes } from "@xyflow/react";
import { C4SystemNode } from "./C4SystemNode";
import { C4ContainerNode } from "./C4ContainerNode";
import { C4ComponentNode } from "./C4ComponentNode";
import { C4DatabaseNode } from "./C4DatabaseNode";
import { C4BoundaryNode } from "./C4BoundaryNode";
import { FlowStepNode } from "./FlowStepNode";
import { FlowDecisionNode } from "./FlowDecisionNode";
import { FlowStartEndNode } from "./FlowStartEndNode";
import { StateNode } from "./StateNode";

export const customNodeTypes: NodeTypes = {
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
