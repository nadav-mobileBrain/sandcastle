# Ubiquitous Language

## Core concepts

| Term                            | Definition                                                                                                                                                                                                                       | Aliases to avoid                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Sandcastle**                  | The TypeScript CLI tool that orchestrates AI coding agents inside isolated environments                                                                                                                                          | "the tool", "the CLI", "RALPH"                                                          |
| **Sandbox**                     | An isolated environment where an agent executes code. Created and managed by a **sandbox provider**                                                                                                                              | "container" (too specific), "Docker sandbox" (ambiguous with Claude's built-in feature) |
| **Sandbox provider**            | A pluggable implementation that creates and manages a **sandbox**. Injected into `run()` via the `sandbox` option, mirroring how an **agent provider** is injected via `agent`. Either a **bind-mount** or **isolated** provider | "backend", "runtime", "sandbox factory"                                                 |
| **Bind-mount sandbox provider** | A **sandbox provider** where Sandcastle creates a **worktree** on the **host** and the provider mounts it into the environment. The host filesystem is shared — no sync needed. Docker and Podman are bind-mount providers       | "local provider", "mount provider"                                                      |
| **Isolated sandbox provider**   | A **sandbox provider** where the environment has its own filesystem. The provider handles syncing code in and extracting commits out via `copyIn`, `copyOut`, and `extractCommits`                                               | "remote provider", "sync provider"                                                      |
| **Sandbox handle**              | The object returned by a **sandbox provider**'s `create()` method. Exposes `exec`, `execStreaming`, and `close`. **Isolated** handles additionally expose `copyIn`, `copyOut`, and `extractCommits`                              | "sandbox instance", "sandbox connection"                                                |
| **Bundle/patch sync**           | A reusable utility for **isolated sandbox providers** that syncs repos via `git bundle` and extracts commits via `git format-patch` / `git am`. Not part of the core contract — providers opt into it                            | "sync service", "repo sync"                                                             |
| **Host**                        | The developer's machine where Sandcastle runs and the real git repo lives                                                                                                                                                        | "local" (ambiguous — the sandbox also has a local filesystem)                           |
| **Agent**                       | The AI coding tool invoked inside the sandbox (e.g. Claude Code, Codex)                                                                                                                                                          | "RALPH", "the bot", "Claude" (too specific — agent is swappable)                        |
| **Agent provider**              | A pluggable implementation that builds commands and parses output for a specific **agent**. Injected into `run()` via the `agent` option                                                                                         | "agent adapter", "agent driver"                                                         |

## Environment

| Term             | Definition                                                                                                               | Aliases to avoid                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| **Env resolver** | The module that loads environment variables from `.env` files and `process.env`, returning a generic key-value map       | "token resolver" (too specific to auth tokens) |
| **Env manifest** | The agent provider's declaration of which environment variables it requires or supports, used to scaffold `.env.example` | "env example", "env template", "env schema"    |

## Execution

| Term                             | Definition                                                                                                                           | Aliases to avoid                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Iteration**                    | A single invocation of the agent inside the sandbox, producing at most one commit against one task                                   | "run" (ambiguous with the JS `run()` function), "cycle", "loop"                          |
| **Task**                         | A GitHub issue that the agent selects and works on during an iteration                                                               | "job", "work item", "ticket"                                                             |
| **Completion signal**            | The `<promise>COMPLETE</promise>` marker in the agent's output indicating all actionable tasks are finished                          | "done flag", "exit signal"                                                               |
| **Orchestrator**                 | The module that drives the iteration loop: invoke agent, check for commits, check completion signal, repeat                          | "runner", "loop", "wrapper script"                                                       |
| **Prompt**                       | The instruction text passed to the agent at the start of each iteration — may contain **prompt arguments** and **shell expressions** | "system prompt" (too specific), "instructions" (too vague), "message"                    |
| **Prompt argument**              | A named key-value pair passed via `promptArgs` in `run()` that substitutes a `{{KEY}}` placeholder in a **prompt**                   | "prompt variable" (ambiguous with env vars), "template variable", "parameter"            |
| **Prompt argument substitution** | The preprocessing step that replaces all `{{KEY}}` placeholders in a **prompt** with values from the **prompt arguments** map        | "template expansion", "interpolation", "variable substitution"                           |
| **Prompt expansion**             | The preprocessing step that finds and evaluates all **shell expressions** in a **prompt** before passing it to the agent             | "prompt preprocessing" (too generic), "command expansion"                                |
| **Shell expression**             | A `` !`command` `` marker in a **prompt** that evaluates a shell command inside the sandbox and is replaced with its stdout          | "command" (overloaded — collides with hook commands), "inline command", "prompt command" |
| **Built-in prompt argument**     | A **prompt argument** that Sandcastle injects automatically — not provided by the user via `promptArgs`                              | "system variable", "auto argument", "default prompt argument"                            |
| **Source branch**                | The branch the agent works on inside the **worktree** — either a temp branch or an explicitly provided `branch`                      | "working branch", "agent branch"                                                         |
| **Target branch**                | The **host**'s active branch at `run()` time — the branch Sandcastle merges into when using a temp branch                            | "base branch", "destination branch", "merge target"                                      |

## Project structure

| Term                 | Definition                                                                                                         | Aliases to avoid                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| **Config directory** | The `.sandcastle/` directory in a host repo containing sandbox configuration: Dockerfile, prompt, and env settings | ".sandcastle folder", "sandcastle dir" |
| **Init**             | The CLI command that scaffolds the **config directory** in a host repo                                             | "create", "bootstrap", "new"           |
| **Build-image**      | A provider-namespaced CLI command that rebuilds the image. E.g. `sandcastle docker build-image`                    | "setup-sandbox" (old name)             |
| **Remove-image**     | A provider-namespaced CLI command that removes the image. E.g. `sandcastle docker remove-image`                    | "cleanup-sandbox" (old name)           |

## Output

| Term                 | Definition                                                                                                            | Aliases to avoid                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Log-to-file mode** | The display mode where Sandcastle writes iteration progress and agent output to a **run log** instead of the terminal | "file mode", "file logging", "quiet mode"                                     |
| **Run log**          | A log file written to `.sandcastle/logs/` during a run session, recording iteration progress and agent output         | "log file" (too generic), "output file"                                       |
| **Terminal mode**    | The display mode where Sandcastle renders an interactive UI in the terminal using spinners and styled status messages | "stdout mode", "interactive mode", "CLI mode" (ambiguous with the CLI itself) |

## Architecture

| Term                | Definition                                                                                                                                                                                   | Aliases to avoid       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Sandbox service** | The internal Effect service interface exposing `exec`, `copyIn`, and `copyOut` operations against a sandbox. Wraps the **sandbox handle** for use inside Sandcastle's Effect-based internals | "adapter", "transport" |
| **Worktree**        | A git worktree created in `.sandcastle/worktrees/` on the **host**. For **bind-mount sandbox providers**, this is mounted into the sandbox as the agent's working directory — no sync needed | "branch copy", "clone" |

## Relationships

- **Sandcastle** orchestrates an **agent** inside a **sandbox**
- A **sandbox** is created by a **sandbox provider**, which is injected into `run()` via the `sandbox` option — this is required, there is no default
- A **sandbox provider** is either a **bind-mount sandbox provider** or an **isolated sandbox provider**
- A **bind-mount sandbox provider** receives a **worktree** path from Sandcastle. Sandcastle creates the worktree and handles commit extraction directly from the host filesystem
- An **isolated sandbox provider** receives the repo path and branch name. It handles syncing code in and extracting commits out — optionally using the **bundle/patch sync** utility. **Isolated sandbox providers are defined in the type system but not yet implemented.** A previous bundle/patch sync implementation is available in git history if needed
- The **sandbox handle** returned by a provider's `create()` is wrapped internally into the **sandbox service** for use in Sandcastle's Effect-based internals
- **Sandbox providers** are imported from subpaths (e.g. `sandcastle/sandboxes/docker`) — the main `sandcastle` entry point does not re-export any provider
- Each **iteration** may produce one or more commits; iterations repeat until the **completion signal** fires or the max count is reached
- **Init** creates the **config directory** on the **host**
- **Build-image** and **remove-image** are namespaced under their provider in the CLI (e.g. `sandcastle docker build-image`)
- The **env resolver** loads env vars from: **config directory** `.env` > `process.env` — only keys declared in the **config directory** `.env` are resolved from `process.env`; repo root `.env` is not part of the resolution chain
- Each **agent provider** declares an **env manifest**
- The **agent provider** is selected via the `agent` field in config or `--agent` CLI flag
- At launch, Sandcastle resolves env vars via the **env resolver** and passes the full env map into the **sandbox**
- **Init** uses the **agent provider**'s **env manifest** to scaffold `.env.example` and its Dockerfile template to scaffold the Dockerfile
- **Prompt argument substitution** runs once after prompt resolution, replacing `{{KEY}}` placeholders with values from **prompt arguments** — this happens on the **host**, before the **sandbox** exists
- **Prompt expansion** runs before each **iteration**, evaluating all **shell expressions** inside the **sandbox**
- **Prompt argument substitution** runs before **prompt expansion**, so **prompt arguments** can inject values into **shell expressions**
- A `{{KEY}}` placeholder with no matching **prompt argument** is an error; unused **prompt arguments** produce a warning
- A **prompt** may contain zero or more **prompt arguments** and/or **shell expressions**; each substitution step is skipped if there are no matches
- Sandcastle injects **built-in prompt arguments** `{{SOURCE_BRANCH}}` and `{{TARGET_BRANCH}}` automatically — these are available in any **prompt** without the user passing them via `promptArgs`
- If a user passes `SOURCE_BRANCH` or `TARGET_BRANCH` in `promptArgs`, **prompt argument substitution** fails with an error — **built-in prompt arguments** cannot be overridden
- **Target branch** defaults to the **host**'s current branch at `run()` time (via `git rev-parse --abbrev-ref HEAD`)
- **Source branch** is either the explicitly provided `branch` option or a Sandcastle-generated temp branch
- **Log-to-file mode** is the default for programmatic use via `run()`; **terminal mode** is used when passing `logging: { type: 'stdout' }` to `run()`
- In **log-to-file mode**, Sandcastle writes a **run log** to `.sandcastle/logs/` and prints a `tail -f` command to the console so the developer can follow along
- In **terminal mode**, Sandcastle renders spinners, styled status messages, and summaries directly in the terminal

## Example dialogue

> **Dev:** "What if I want to add support for OpenCode instead of Claude Code?"

> **Domain expert:** "Create a new **agent provider**. It declares its own **env manifest** — maybe it needs `OPEN_CODE_API_KEY` instead of `ANTHROPIC_API_KEY`. And it provides its own Dockerfile template that installs the right binary."

> **Dev:** "How does Sandcastle know which **agent provider** to use?"

> **Domain expert:** "The `agent` option passed to `run()`, or the `--agent` CLI flag. The **env resolver** loads all env vars generically and passes them straight through to the **sandbox** — the **agent** handles missing credentials on its own."

> **Dev:** "I want to reuse the same **prompt** file for multiple issues in parallel. How do I pass the issue number in?"

> **Domain expert:** "Use **prompt arguments**. Put `{{ISSUE_NUMBER}}` in the **prompt** file, then pass `promptArgs: { ISSUE_NUMBER: 42 }` to `run()`. **Prompt argument substitution** replaces it before anything else runs."

> **Dev:** "What if I also have a **shell expression** that uses the issue number — like `` !`gh issue view {{ISSUE_NUMBER}}` ``?"

> **Domain expert:** "That works. **Prompt argument substitution** runs first on the **host**, so `{{ISSUE_NUMBER}}` becomes `42` everywhere — including inside **shell expressions**. Then **prompt expansion** evaluates the **shell expression** inside the **sandbox**."

> **Dev:** "What happens if I typo the key — like `{{ISSUE_NUBMER}}`?"

> **Domain expert:** "**Prompt argument substitution** fails with an error. Every `{{KEY}}` in the **prompt** must have a matching **prompt argument**. The reverse is just a warning — unused **prompt arguments** don't block execution."

> **Dev:** "So the **agent** never sees `{{...}}` or `` !`...` `` syntax?"

> **Domain expert:** "Correct. By the time the **prompt** reaches the **agent**, both substitution steps have run and replaced everything with concrete values."

> **Dev:** "My reviewer agent diffs against `main`, but I'm working from a feature branch. The diff is huge."

> **Domain expert:** "Use the **built-in prompt argument** `{{TARGET_BRANCH}}` in your **prompt**. It resolves to the **host**'s active branch at `run()` time — so if you kick off Sandcastle from `feature/auth`, the reviewer diffs against `feature/auth`, not `main`."

> **Dev:** "Can I override `{{TARGET_BRANCH}}` in `promptArgs`?"

> **Domain expert:** "No — **built-in prompt arguments** can't be overridden. If you pass `TARGET_BRANCH` in `promptArgs`, **prompt argument substitution** fails with an error. Use a different key name if you need a custom value."

> **Dev:** "What if I want to use Podman instead of Docker?"

> **Domain expert:** "Import a different **sandbox provider**. Instead of `import { docker } from 'sandcastle/sandboxes/docker'`, use `import { podman } from 'sandcastle/sandboxes/podman'`. Both are **bind-mount sandbox providers** — Sandcastle creates the **worktree** and the provider mounts it. The `sandbox` option in `run()` is required, so you always choose explicitly."

> **Dev:** "What about a cloud VM that can't bind-mount my local filesystem?"

> **Domain expert:** "That would be an **isolated sandbox provider**. It receives the repo path and branch name, syncs code in however it wants — maybe using the **bundle/patch sync** utility — and exposes `extractCommits` so Sandcastle can pull commits back to the **host**. The core orchestrator doesn't care how it works, it just needs a **sandbox handle** with `exec` and `execStreaming`."

> **Dev:** "Can I write my own provider?"

> **Domain expert:** "Yes. Implement a function that returns a `SandboxProvider`. If your environment can mount a host directory, use the bind-mount factory — Sandcastle handles worktrees and commit extraction for you. If not, use the isolated factory and implement `copyIn`, `copyOut`, and `extractCommits` on the **sandbox handle**."

## Flagged ambiguities

- **"Provider"** — Overloaded: both **agent provider** and **sandbox provider** exist. Always qualify — say "agent provider" or "sandbox provider", never just "provider" in isolation.
- **"Docker sandbox"** — In this project, **sandbox** refers to our isolated environment concept. It is NOT Claude Code's built-in `docker sandbox` CLI feature. Use **sandbox** for ours; spell out "Claude's Docker sandbox CLI" for the built-in feature.
- **"Container"** vs **"Sandbox"** — "Container" is a Docker/Podman primitive; **sandbox** is our abstraction over it. Use **sandbox** when talking about the concept, "container" only when discussing a specific provider's implementation details.
- **"Local"** vs **"Host"** — Both could mean the developer's machine, but "local" is ambiguous (the **worktree** is also on a local filesystem). Use **host** to mean the developer's machine. Reserve "local" for generic contexts.
- **"Run"** — Can mean the JS `run()` function or a single **iteration**. Use **iteration** for one agent invocation; use "run session" for a call to `run()` that drives multiple iterations.
- **"Token"** vs **"Env var"** — The old `TokenResolver` name implied it only handled auth tokens. The **env resolver** handles all environment variables generically. Use "env var" for the general concept; "token" only when referring specifically to an auth credential value.
- **"Command"** — Heavily overloaded: hook commands, shell commands, CLI commands, **shell expressions**. Use **shell expression** for the `` !`...` `` syntax in **prompts**; use "hook" for lifecycle hooks; use "CLI command" for `sandcastle init`, `sandcastle build-image`, etc.
- **"Variable"** vs **"Argument"** — Env vars and **prompt arguments** are both key-value pairs, but they serve different purposes. **Prompt arguments** are host-side values substituted into `{{KEY}}` placeholders. Env vars are passed into the **sandbox** environment. Don't call prompt arguments "variables" or "template variables".
- **"File mode"** vs **"Log-to-file mode"** — Use **log-to-file mode** to be explicit about what's happening. "File mode" is too terse and could be confused with other file operations. Similarly, avoid "stdout mode" for **terminal mode** — stdout is an implementation detail, not the user-facing concept.
- **"Base branch"** vs **"Target branch"** — "Base branch" is common in GitHub PR terminology but ambiguous in Sandcastle (base of what?). Use **target branch** — it's where commits land when using a temp branch, and it's the natural diff base for reviewers.
- **"Built-in"** vs **"Default"** prompt arguments — "Default" implies overridable. **Built-in prompt arguments** are injected by Sandcastle and cannot be overridden via `promptArgs`. Use "built-in" to signal this.
