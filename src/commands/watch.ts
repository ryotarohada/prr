import { config } from '../lib/config.js';
import { initOctokit, fetchPullRequests } from '../lib/github.js';
import { notifyNewPRs, resetNotificationState } from '../lib/notifier.js';
import { displayPRs, displayTimestamp, log } from '../lib/display.js';

export async function watchCommand(): Promise<void> {
  if (!config.isConfigured()) {
    log.error('Not configured. Run: prr config');
    process.exit(1);
  }

  const token = config.getToken();
  const repositories = config.getRepositories();
  const intervalMinutes = config.getInterval();

  initOctokit(token);
  resetNotificationState();

  log.info(`[prr] Watching for PRs... (checking every ${intervalMinutes} min)`);
  log.info('[prr] Press Ctrl+C to stop\n');

  process.on('SIGINT', () => {
    log.info('\n[prr] Stopping...');
    process.exit(0);
  });

  await checkAndDisplay(repositories);

  setInterval(async () => {
    await checkAndDisplay(repositories);
  }, intervalMinutes * 60 * 1000);
}

async function checkAndDisplay(repositories: string[]): Promise<void> {
  displayTimestamp(`Checking ${repositories.length} repositories...`);

  try {
    const prs = await fetchPullRequests(repositories);

    notifyNewPRs(prs.pending);

    if (prs.pending.length > 0) {
      displayPRs(prs.pending);
    } else {
      displayTimestamp('No pending reviews');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Error: ${message}`);
  }
}
