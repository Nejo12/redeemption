import { execFileSync } from "node:child_process";

/**
 * @param {string} command
 * @param {string[]} args
 * @param {import("node:child_process").ExecFileSyncOptions} [options]
 */
export function runCommand(command, args, options = {}) {
  const output = execFileSync(command, args, {
    encoding: "utf8",
    ...options,
  });

  if (typeof output !== "string") {
    return "";
  }

  return output.trim();
}

export function parseRepoFromGitRemote() {
  const remote = runCommand("git", ["config", "--get", "remote.origin.url"]);

  const sshMatch = remote.match(/github\.com:(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return sshMatch[1];
  }

  const httpsMatch = remote.match(/github\.com\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return httpsMatch[1];
  }

  throw new Error(`Unable to determine GitHub repository from remote.origin.url: ${remote}`);
}

export function ensureGitHubCli() {
  try {
    execFileSync("gh", ["--version"], { stdio: "ignore" });
  } catch {
    console.error(
      "GitHub CLI is required to apply GitHub seed data. Install `gh` and authenticate first.",
    );
    process.exit(1);
  }
}

/**
 * @param {string} repo
 */
export function listRepoLabels(repo) {
  return JSON.parse(
    runCommand("gh", [
      "label",
      "list",
      "--repo",
      repo,
      "--limit",
      "1000",
      "--json",
      "name,color,description",
    ]),
  );
}

/**
 * @param {string} repo
 */
export function listRepoMilestones(repo) {
  return JSON.parse(runCommand("gh", ["api", `repos/${repo}/milestones?state=all&per_page=100`]));
}
