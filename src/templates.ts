export const DOCKERFILE = `FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \\
  git \\
  curl \\
  jq \\
  && rm -rf /var/lib/apt/lists/*

# Enable corepack (pnpm, yarn)
RUN corepack enable

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \\
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \\
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \\
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \\
  && apt-get update && apt-get install -y gh \\
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user for Claude to run as
RUN useradd -m -s /bin/bash agent
USER agent

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Add Claude to PATH
ENV PATH="/home/agent/.local/bin:$PATH"

# Create repos directory
RUN mkdir -p /home/agent/repos

WORKDIR /home/agent
ENTRYPOINT ["sleep", "infinity"]
`;

export const SKELETON_PROMPT =
  `# Context

<!-- Use !` +
  "`" +
  `command` +
  "`" +
  ` to pull in dynamic context. Commands run inside the sandbox. -->
<!-- Example: !` +
  "`" +
  `git log --oneline -10` +
  "`" +
  ` or !` +
  "`" +
  `gh issue list --json number,title` +
  "`" +
  ` -->

# Task

<!-- Describe what the agent should do. -->

# Done

<!-- When the task is complete, output <promise>COMPLETE</promise> to signal early termination. -->
`;
