import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scaffold } from "./InitService.js";
import { DOCKERFILE, SKELETON_PROMPT } from "./templates.js";

const makeDir = () => mkdtemp(join(tmpdir(), "init-service-"));

describe("InitService scaffold", () => {
  it("creates .sandcastle/ with Dockerfile, prompt.md, .env.example, .gitignore", async () => {
    const dir = await makeDir();
    await scaffold(dir);

    const configDir = join(dir, ".sandcastle");

    const dockerfile = await readFile(join(configDir, "Dockerfile"), "utf-8");
    expect(dockerfile).toBe(DOCKERFILE);

    const prompt = await readFile(join(configDir, "prompt.md"), "utf-8");
    expect(prompt).toBe(SKELETON_PROMPT);

    const envExample = await readFile(join(configDir, ".env.example"), "utf-8");
    expect(envExample).toContain("CLAUDE_CODE_OAUTH_TOKEN=");
    expect(envExample).toContain("GH_TOKEN=");

    const gitignore = await readFile(join(configDir, ".gitignore"), "utf-8");
    expect(gitignore).toContain(".env");
  });

  it("errors if .sandcastle/ already exists", async () => {
    const dir = await makeDir();
    await mkdir(join(dir, ".sandcastle"));

    await expect(scaffold(dir)).rejects.toThrow(
      ".sandcastle/ directory already exists",
    );
  });

  it("includes patches/ in .gitignore", async () => {
    const dir = await makeDir();
    await scaffold(dir);

    const gitignore = await readFile(
      join(dir, ".sandcastle", ".gitignore"),
      "utf-8",
    );
    expect(gitignore).toContain("patches/");
  });

  it("skeleton prompt contains section headers and hints", async () => {
    const dir = await makeDir();
    await scaffold(dir);

    const prompt = await readFile(
      join(dir, ".sandcastle", "prompt.md"),
      "utf-8",
    );

    // Should have section headers (minimal skeleton)
    expect(prompt).toContain("# ");

    // Should hint at !`command` syntax
    expect(prompt).toContain("!`");

    // Should hint at <promise>COMPLETE</promise> convention
    expect(prompt).toContain("<promise>COMPLETE</promise>");
  });

  it("does not create config.json", async () => {
    const dir = await makeDir();
    await scaffold(dir);

    await expect(
      readFile(join(dir, ".sandcastle", "config.json"), "utf-8"),
    ).rejects.toThrow();
  });
});
