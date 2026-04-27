# @forge/workflow

Arkitekt Forge Workflow Engine — Parameterised state machine with 22 Kanban states, transition validation, gate execution, and BullMQ queues.

## Architecture

- **22 States** across 6 phases (Plan, Design, Develop, Test, Ship, Operate)
- **Transition Rules** define allowed state-to-state movements, approval requirements, and auto-transition behavior
- **Gate Executor** runs blocking checks before state transitions
- **BullMQ Queues** handle async transitions and gate execution
- **Templates** define preset workflows (Standard SDLC, Lightweight Agile, Enterprise Governed, Compliance Heavy)

## States

```
Plan:       Pending -> Brief -> Ready Design
Design:     Designing -> Design Review -> Ready Dev
Develop:    Coding -> Testing -> Code Review -> Revisions -> Ready CI
Test:       CI Running -> CI Pass | CI Fail
Ship:       Shipped -> Released -> Done
Operate:    Monitoring -> Incident Detected -> Investigating -> Remediating -> Resolved
Special:    Blocked (from any), Cancelled (from any)
```

## API

### transitionStory(req: TransitionRequest): Promise<TransitionResult>
Main entry point. Validates transition, runs gates, records to state_transitions table, updates story phase.

### validateTransition(from, to): { valid, reason, rule }
Checks if a transition is allowed by the rules.

### registerGate(name, fn)
Registers a gate check function for use by the gate executor.

## Templates

| Template | Phases | States | Gates | Min Tier |
|----------|--------|--------|-------|----------|
| standard_sdlc | 6 | 22 | single | forge_team |
| lightweight_agile | 3 | 9 | single | forge_team |
| enterprise_governed | 7 | 24 | dual | forge_enterprise |
| compliance_heavy | 8 | 30 | triple | forge_enterprise |
