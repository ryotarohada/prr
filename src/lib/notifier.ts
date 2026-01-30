import notifier from 'node-notifier';
import type { PullRequest } from '../types/index.js';
import { config } from './config.js';
import { state } from './state.js';

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

function shouldRemind(prId: number): boolean {
  if (!config.getReminder()) return false;

  const lastNotified = state.getLastNotifiedAt(prId);
  if (!lastNotified) return false;

  const intervalMs = config.getReminderInterval() * 60 * 1000;
  const elapsed = Date.now() - lastNotified.getTime();

  return elapsed >= intervalMs;
}

export function notifyNewPRs(pendingPRs: PullRequest[]): void {
  const now = new Date();

  // Cleanup stale entries (merged/closed PRs)
  state.cleanupStaleEntries(pendingPRs.map((pr) => pr.id));

  // First check: just count and add to known, record state
  if (isFirstCheck) {
    for (const pr of pendingPRs) {
      knownPRIds.add(pr.id);
      if (!state.getLastNotifiedAt(pr.id)) {
        state.setLastNotifiedAt(pr.id, now);
      }
    }
    isFirstCheck = false;

    if (pendingPRs.length > 0) {
      showNotification('prr', `${pendingPRs.length} PR(s) waiting for review`, 'Pending Reviews');
    }
    return;
  }

  for (const pr of pendingPRs) {
    if (!knownPRIds.has(pr.id)) {
      // New PR
      showNotification('prr', pr.title, `${pr.repository} #${pr.number}`, pr.url);
      knownPRIds.add(pr.id);
      state.setLastNotifiedAt(pr.id, now);
    } else if (shouldRemind(pr.id)) {
      // Reminder for existing PR
      showNotification('prr', `[Reminder] ${pr.title}`, `${pr.repository} #${pr.number}`, pr.url);
      state.setLastNotifiedAt(pr.id, now);
    }
  }
}

export function resetNotificationState(): void {
  knownPRIds.clear();
  // Restore known PRs from persistent state
  for (const prId of state.getAllNotifiedPrIds()) {
    knownPRIds.add(prId);
  }
  isFirstCheck = true;
}
