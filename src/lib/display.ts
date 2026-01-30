import type { PullRequest } from '../types/index.js';

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

export const log = {
  info: (msg: string): void => { console.log(msg); },
  success: (msg: string): void => { console.log(`${colors.green}✓${colors.reset} ${msg}`); },
  error: (msg: string): void => { console.log(`${colors.red}✗${colors.reset} ${msg}`); },
  dim: (msg: string): void => { console.log(`${colors.dim}${msg}${colors.reset}`); },
  warn: (msg: string): void => { console.log(`${colors.yellow}!${colors.reset} ${msg}`); },
};

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function displayPRs(prs: PullRequest[], title = 'Pending Review'): void {
  const width = Math.min(process.stdout.columns || 60, 70);

  console.log();
  console.log(`${colors.bold}${title} (${prs.length})${colors.reset}`);
  console.log('─'.repeat(width));

  for (const pr of prs) {
    const draft = pr.draft ? `${colors.dim}[DRAFT]${colors.reset} ` : '';
    const timeAgo = formatTimeAgo(pr.updatedAt);

    console.log(`${colors.cyan}#${pr.number}${colors.reset} ${draft}${pr.title}`);
    console.log(`    ${colors.blue}${pr.repository}${colors.reset} · ${colors.dim}@${pr.author.login} · ${timeAgo}${colors.reset}`);
    console.log();
  }

  console.log('─'.repeat(width));
}

export function displayTimestamp(message: string): void {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  log.dim(`[${timestamp}] ${message}`);
}

export function showHelp(): void {
  console.log(`
${colors.bold}prr${colors.reset} - Pull Request Reminder

${colors.bold}Usage:${colors.reset}
  prr                          Start watch mode (default)
  prr watch                    Start watch mode
  prr list                     List pending PRs once
  prr status                   Show current configuration

${colors.bold}Configuration:${colors.reset}
  prr config                   Interactive setup
  prr config set-token         Set GitHub token
  prr config add-repo <repo>   Add repository (owner/repo)
  prr config rm-repo <repo>    Remove repository
  prr config repos             List configured repositories
  prr config interval <min>    Set check interval (minutes)
  prr config clear             Clear all configuration

${colors.bold}Options:${colors.reset}
  -h, --help                   Show this help
  -v, --version                Show version
`);
}

export function showVersion(): void {
  console.log('prr v1.0.0');
}
