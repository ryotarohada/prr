import { config } from '../lib/config.js';
import { initOctokit, fetchPullRequests } from '../lib/github.js';
import { displayPRs, log } from '../lib/display.js';

export async function listCommand(): Promise<void> {
  if (!config.isConfigured()) {
    log.error('Not configured. Run: prr config');
    process.exit(1);
  }

  const token = config.getToken();
  const repositories = config.getRepositories();

  initOctokit(token);

  log.dim(`Fetching PRs from ${repositories.length} repositories...`);

  try {
    const prs = await fetchPullRequests(repositories);

    if (prs.pending.length > 0) {
      displayPRs(prs.pending, 'Pending Review');
    } else {
      log.success('No pending reviews!');
    }

    if (prs.changesRequested.length > 0) {
      displayPRs(prs.changesRequested, 'Changes Requested');
    }

    if (prs.approved.length > 0) {
      displayPRs(prs.approved, 'Approved');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Error: ${message}`);
    process.exit(1);
  }
}
