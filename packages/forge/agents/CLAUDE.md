# @forge/agents

Arkitekt Forge Agent Orchestration — Model router, execution service, concurrency control, and context budget management.

## Model Router

Selects the optimal LLM model per task type:
- **classify** → Haiku (cheapest, fastest)
- **reason, code, test** → Sonnet (balanced)
- **architect** → Opus (highest quality)

## Execution Service

`executeAgent(req: ExecutionRequest): Promise<ExecutionResult>`

1. Pre-flight metering check (< 5ms)
2. Model selection
3. Execution start recording
4. LLM call (placeholder in MVP)
5. Completion recording
6. Token usage event emission

## Concurrency Limiter

Enforces max concurrent agents per subscription tier.

## Context Budget Manager

Allocates token budget across 4 categories:
- Design artifact: 40%
- Codebase understanding: 25%
- Related patterns: 20%
- Governance rules: 15%
