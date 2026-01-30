import { config } from '../lib/config.js';
import { initOctokit, fetchPullRequests } from '../lib/github.js';
import { notifyNewPRs, resetNotificationState } from '../lib/notifier.js';
import { displayPRs, displayTimestamp, log, clearScreen } from '../lib/display.js';

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

  process.on('SIGINT', () => {
    console.log('\n');
    log.info('[prr] Stopped');
    process.exit(0);
  });

  clearScreen();
  log.dim('[prr] Fetching PRs...');

  await checkAndDisplay(repositories);

  setInterval(async () => {
    await checkAndDisplay(repositories);
  }, intervalMinutes * 60 * 1000);
}

async function checkAndDisplay(repositories: string[]): Promise<void> {
  try {
    const prs = await fetchPullRequests(repositories);

    notifyNewPRs(prs.pending);

    clearScreen();
    log.dim(`[prr] Watching... (Ctrl+C to stop)\n`);

    if (prs.pending.length > 0) {
      displayPRs(prs.pending, 'Pending Review', { showRepository: config.getShowRepository() });
    } else {
      log.success('No pending reviews!');
    }

    displayTimestamp(`Last checked • ${repositories.length} repos`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Error: ${message}`);
  }
}
