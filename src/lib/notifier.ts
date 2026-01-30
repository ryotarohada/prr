import notifier from 'node-notifier';
import type { PullRequest } from '../types/index.js';

function showNotification(title: string, message: string, subtitle?: string, url?: string): void {
  notifier.notify(
    {
      title,
      message,
      subtitle,
      sound: true,
      open: url,
    },
    () => {
      // Silently ignore callback errors
    }
  );
}

const knownPRIds = new Set<number>();
let isFirstCheck = true;

export function notifyNewPRs(pendingPRs: PullRequest[]): void {
  const newPRs = pendingPRs.filter((pr) => !knownPRIds.has(pr.id));

  // Notify for each new PR
  for (const pr of newPRs) {
    showNotification('prr', pr.title, `${pr.repository} #${pr.number}`, pr.url);
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
