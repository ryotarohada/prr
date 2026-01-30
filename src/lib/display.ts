import type { PullRequest } from '../types/index.js';

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const box = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  leftT: '├',
  rightT: '┤',
};

export const log = {
  info: (msg: string): void => { console.log(msg); },
  success: (msg: string): void => { console.log(`${colors.green}✓${colors.reset} ${msg}`); },
  error: (msg: string): void => { console.log(`${colors.red}✗${colors.reset} ${msg}`); },
  dim: (msg: string): void => { console.log(`${colors.dim}${msg}${colors.reset}`); },
  warn: (msg: string): void => { console.log(`${colors.yellow}!${colors.reset} ${msg}`); },
};

export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

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

function getWidth(): number {
  return Math.min(process.stdout.columns || 80, 100);
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

function drawBox(title: string, lines: string[]): void {
  const width = getWidth();
  const innerWidth = width - 2;

  // Top border with title
  const titleText = ` ${title} `;
  const remainingWidth = innerWidth - titleText.length;
  const leftPad = Math.floor(remainingWidth / 2);
  const rightPad = remainingWidth - leftPad;

  console.log(
    `${colors.magenta}${box.topLeft}${box.horizontal.repeat(leftPad)}${colors.reset}${colors.bold}${titleText}${colors.reset}${colors.magenta}${box.horizontal.repeat(rightPad)}${box.topRight}${colors.reset}`
  );

  // Content
  for (const line of lines) {
    const visible = visibleLength(line);
    const padding = innerWidth - visible - 2;
    console.log(`${colors.magenta}${box.vertical}${colors.reset} ${line}${' '.repeat(Math.max(0, padding))} ${colors.magenta}${box.vertical}${colors.reset}`);
  }

  // Bottom border
  console.log(`${colors.magenta}${box.bottomLeft}${box.horizontal.repeat(innerWidth)}${box.bottomRight}${colors.reset}`);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function displayPRs(prs: PullRequest[], title = 'Pending Review'): void {
  const width = getWidth();
  const innerWidth = width - 4;

  console.log();

  const lines: string[] = [];

  for (const pr of prs) {
    const draft = pr.draft ? `${colors.dim}[D]${colors.reset} ` : '';
    const timeAgo = formatTimeAgo(pr.updatedAt);
    const meta = `${colors.cyan}${pr.repository}${colors.reset} ${colors.yellow}@${pr.author.login}${colors.reset} ${colors.dim}${timeAgo}${colors.reset}`;
    const metaLen = pr.repository.length + pr.author.login.length + timeAgo.length + 3;

    const prefix = `#${pr.number} `;
    const prefixLen = prefix.length + (pr.draft ? 4 : 0);
    const maxTitleLen = innerWidth - prefixLen - metaLen - 3;
    const truncatedTitle = truncate(pr.title, Math.max(20, maxTitleLen));

    lines.push(`${colors.cyan}#${pr.number}${colors.reset} ${draft}${truncatedTitle}  ${meta}`);
  }

  drawBox(`${title} (${prs.length})`, lines);
}

export function displayTimestamp(message: string): void {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  log.dim(`[${timestamp}] ${message}`);
}

export function showHelp(): void {
  const width = getWidth();
  const innerWidth = width - 2;

  console.log();
  console.log(`${colors.magenta}${box.topLeft}${box.horizontal.repeat(innerWidth)}${box.topRight}${colors.reset}`);
  console.log(`${colors.magenta}${box.vertical}${colors.reset}${colors.bold}  prr${colors.reset} - Pull Request Reminder${' '.repeat(innerWidth - 29)}${colors.magenta}${box.vertical}${colors.reset}`);
  console.log(`${colors.magenta}${box.leftT}${box.horizontal.repeat(innerWidth)}${box.rightT}${colors.reset}`);

  const sections = [
    {
      title: 'Usage',
      items: [
        ['prr', 'Start watch mode (default)'],
        ['prr watch', 'Start watch mode'],
        ['prr list', 'List pending PRs once'],
        ['prr status', 'Show current configuration'],
      ],
    },
    {
      title: 'Configuration',
      items: [
        ['prr config', 'Interactive setup'],
        ['prr config set-token', 'Set GitHub token'],
        ['prr config add-repo', 'Add repository'],
        ['prr config rm-repo', 'Remove repository'],
        ['prr config repos', 'List repositories'],
        ['prr config interval', 'Set check interval'],
        ['prr config clear', 'Clear configuration'],
      ],
    },
    {
      title: 'Options',
      items: [
        ['-h, --help', 'Show this help'],
        ['-v, --version', 'Show version'],
      ],
    },
  ];

  for (let s = 0; s < sections.length; s++) {
    const section = sections[s];
    console.log(`${colors.magenta}${box.vertical}${colors.reset}  ${colors.bold}${section.title}${colors.reset}${' '.repeat(innerWidth - section.title.length - 3)}${colors.magenta}${box.vertical}${colors.reset}`);

    for (const [cmd, desc] of section.items) {
      const line = `    ${colors.cyan}${cmd.padEnd(22)}${colors.reset}${colors.dim}${desc}${colors.reset}`;
      const padding = innerWidth - 4 - 22 - desc.length - 1;
      console.log(`${colors.magenta}${box.vertical}${colors.reset}${line}${' '.repeat(Math.max(0, padding))}${colors.magenta}${box.vertical}${colors.reset}`);
    }

    if (s < sections.length - 1) {
      console.log(`${colors.magenta}${box.vertical}${colors.reset}${' '.repeat(innerWidth)}${colors.magenta}${box.vertical}${colors.reset}`);
    }
  }

  console.log(`${colors.magenta}${box.bottomLeft}${box.horizontal.repeat(innerWidth)}${box.bottomRight}${colors.reset}`);
  console.log();
}

export function showVersion(): void {
  console.log(`${colors.bold}prr${colors.reset} v0.2.2`);
}
