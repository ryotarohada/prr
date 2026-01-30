import * as readline from 'readline';
import { config } from '../lib/config.js';
import { validateToken } from '../lib/github.js';
import { log } from '../lib/display.js';

function createPrompt(): { prompt: (question: string) => Promise<string>; close: () => void } {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    prompt: (question: string): Promise<string> =>
      new Promise((resolve) => rl.question(question, resolve)),
    close: () => rl.close(),
  };
}

export async function configCommand(): Promise<void> {
  log.info('prr Configuration\n');

  const { prompt, close } = createPrompt();

  try {
    // 1. GitHub Token
    log.info('Step 1: GitHub Token');
    log.dim('Create a token at: https://github.com/settings/tokens');
    log.dim('Required scopes: repo, read:user\n');

    const token = await prompt('Enter GitHub token: ');

    if (!token.trim()) {
      log.error('Token is required');
      close();
      process.exit(1);
    }

    // Validate token
    const validation = await validateToken(token.trim());
    if (!validation.valid) {
      log.error(`Invalid token: ${validation.error}`);
      close();
      process.exit(1);
    }
    log.success(`Valid! Authenticated as @${validation.user?.login}\n`);
    config.setToken(token.trim());

    // 2. Repositories
    log.info('Step 2: Add Repositories');
    log.dim('Format: owner/repo (e.g., facebook/react)\n');

    const repos: string[] = [];
    while (true) {
      const repo = await prompt('Add repository (or press Enter to finish): ');
      if (!repo.trim()) break;

      if (!/^[\w.-]+\/[\w.-]+$/.test(repo.trim())) {
        log.error('Invalid format. Use: owner/repo');
        continue;
      }
      repos.push(repo.trim());
      log.success(`Added: ${repo.trim()}`);
    }

    if (repos.length === 0) {
      log.error('At least one repository required');
      close();
      process.exit(1);
    }
    config.setRepositories(repos);

    // 3. Interval
    log.info('\nStep 3: Check Interval');
    const intervalStr = await prompt('Check interval in minutes (default: 5): ');
    const interval = parseInt(intervalStr, 10) || 5;
    config.setInterval(Math.max(1, interval));

    close();

    log.success('\nConfiguration complete!');
    log.info('Run `prr` to start watching for PRs');
  } catch {
    close();
    process.exit(1);
  }
}

export async function setTokenCommand(): Promise<void> {
  const { prompt, close } = createPrompt();

  try {
    const token = await prompt('Enter GitHub token: ');

    if (!token.trim()) {
      log.error('Token is required');
      close();
      process.exit(1);
    }

    const validation = await validateToken(token.trim());
    if (!validation.valid) {
      log.error(`Invalid token: ${validation.error}`);
      close();
      process.exit(1);
    }

    config.setToken(token.trim());
    log.success(`Valid! Authenticated as @${validation.user?.login}`);
    close();
  } catch {
    close();
    process.exit(1);
  }
}

export function addRepoCommand(repo: string | undefined): void {
  if (!repo) {
    log.error('Usage: prr config add-repo <owner/repo>');
    process.exit(1);
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    log.error('Invalid format. Use: owner/repo');
    process.exit(1);
  }

  config.addRepository(repo);
  log.success(`Added: ${repo}`);
}

export function rmRepoCommand(repo: string | undefined): void {
  if (!repo) {
    log.error('Usage: prr config rm-repo <owner/repo>');
    process.exit(1);
  }

  const repos = config.getRepositories();
  if (!repos.includes(repo)) {
    log.error(`Repository not found: ${repo}`);
    process.exit(1);
  }

  config.removeRepository(repo);
  log.success(`Removed: ${repo}`);
}

export function listReposCommand(): void {
  const repos = config.getRepositories();

  if (repos.length === 0) {
    log.dim('No repositories configured');
    return;
  }

  log.info(`Repositories (${repos.length}):`);
  for (const repo of repos) {
    log.info(`  - ${repo}`);
  }
}

export function setIntervalCommand(minutes: string | undefined): void {
  if (!minutes) {
    log.info(`Current interval: ${config.getInterval()} minutes`);
    return;
  }

  const interval = parseInt(minutes, 10);
  if (isNaN(interval) || interval < 1) {
    log.error('Invalid interval. Must be a positive number.');
    process.exit(1);
  }

  config.setInterval(interval);
  log.success(`Check interval set to ${interval} minutes`);
}

export function clearConfigCommand(): void {
  config.clear();
  log.success('Configuration cleared');
}
