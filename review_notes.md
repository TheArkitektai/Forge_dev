# Arkitekt Forge: Review Notes

## v12 Architecture Upgrade

### Major Changes

1. **Six Phase SDLC**: Added Operate as the 6th phase (Plan, Design, Develop, Test, Ship, Operate). This completes the full delivery lifecycle from planning through production operations.

2. **Code Execution Loop (Layer 9)**: Added autonomous code generation, testing, and iteration with human approval gates. Agents can write code in sandboxes, run tests, fix failures, and generate explainability reports, but humans always approve before merge.

3. **IDE Integration**: Added awareness of VS Code, JetBrains, Neovim, and Cursor connections. Context injection, inline governance, and memory sidebar capabilities are tracked per IDE.

4. **Bidirectional Connectors**: Upgraded connectors from read only to bidirectional with governance. Actions like creating PRs, merging, restarting pods, and scaling services require approval gates.

5. **Agent Explainability**: Every execution run produces an explainability report documenting design decisions, test coverage, governance checks, and confidence scores.

6. **Context Budget Management**: Token allocation across design artifacts, codebase understanding, related patterns, and governance rules is visible, configurable, and enforceable.

### Evolution of Principles

**Zero Autonomous Action → Supervised Autonomous Execution**

The original "Zero Autonomous Action" principle has evolved. v12 recognizes that agents can safely generate and test code in isolated sandboxes. The new principle is: autonomous where it accelerates, governed where it matters. Humans remain in control of all merge decisions.

### UI Implications

- 9th screen added: Operate
- 9th architecture layer added: Code Execution Loop
- New widgets: execution loop status, context budget gauge, operate incidents, IDE connections, explainability score
- New components: ExecutionLoopPanel, ExplainabilityModal, ContextBudgetGauge, IDEStatusBar
- Config Studio expanded with IDE Integrations tab and bidirectional connector action configuration
