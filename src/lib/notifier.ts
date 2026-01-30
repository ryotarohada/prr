import { execSync } from 'child_process';
import type { PullRequest } from '../types/index.js';

function escapeAppleScript(str: string): string {
  return str.replace(/["\\]/g, '\\$&').replace(/'/g, "'\"'\"'");
}

function showNotification(title: string, body: string, subtitle?: string): void {
  // macOS notification center via osascript
  let script = `display notification "${escapeAppleScript(body)}" with title "${escapeAppleScript(title)}"`;

  if (subtitle) {
    script += ` subtitle "${escapeAppleScript(subtitle)}"`;
  }

  script += ' sound name "default"';

  try {
    execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
  } catch {
    // Silently fail if notifications don't work
  }
}

const knownPRIds = new Set<number>();
let isFirstCheck = true;

export function notifyNewPRs(pendingPRs: PullRequest[]): void {
  const newPRs = pendingPRs.filter((pr) => !knownPRIds.has(pr.id));

  // Notify for each new PR
  for (const pr of newPRs) {
    showNotification('prr', pr.title, `${pr.repository} #${pr.number}`);
    knownPRIds.add(pr.id);
  }

  // First check: just count and add to known
  if (isFirstCheck) {
    for (const pr of pendingPRs) {
      knownPRIds.add(pr.id);
    }
    isFirstCheck = false;

    if (pendingPRs.length > 0) {
      showNotification('prr', `${pendingPRs.length} PR(s) waiting for review`, 'Pending Reviews');
    }
  }
}

export function resetNotificationState(): void {
  knownPRIds.clear();
  isFirstCheck = true;
}
