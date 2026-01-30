import { config } from '../lib/config.js';
import { validateToken } from '../lib/github.js';
import { log } from '../lib/display.js';

export async function statusCommand(): Promise<void> {
  const token = config.getToken();
  const repositories = config.getRepositories();
  const interval = config.getInterval();

  console.log();

  if (!token) {
    log.error('Configuration: Not configured');
    log.info('Run `prr config` to set up');
    return;
  }

  const validation = await validateToken(token);

  if (validation.valid) {
    log.success(`Configuration: Valid`);
    log.info(`User: @${validation.user?.login}`);
  } else {
    log.error(`Configuration: Invalid token`);
    log.dim(`Error: ${validation.error}`);
  }

  console.log();
  log.info(`Repositories: ${repositories.length}`);
  for (const repo of repositories) {
    log.dim(`  - ${repo}`);
  }

  console.log();
  log.info(`Check interval: ${interval} minutes`);
  console.log();
}
