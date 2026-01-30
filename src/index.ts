#!/usr/bin/env node

import { watchCommand } from './commands/watch.js';
import { listCommand } from './commands/list.js';
import { statusCommand } from './commands/status.js';
import {
  configCommand,
  setTokenCommand,
  addRepoCommand,
  rmRepoCommand,
  listReposCommand,
  setIntervalCommand,
  setShowRepoCommand,
  setReminderCommand,
  setReminderIntervalCommand,
  clearConfigCommand,
} from './commands/config.js';
import { showHelp, showVersion, log } from './lib/display.js';

const args = process.argv.slice(2);
const command = args[0] || 'watch';

async function main(): Promise<void> {
  switch (command) {
    case 'watch':
      await watchCommand();
      break;

    case 'list':
      await listCommand();
      break;

    case 'config': {
      const subCommand = args[1];
      switch (subCommand) {
        case 'set-token':
          await setTokenCommand();
          break;
        case 'add-repo':
          addRepoCommand(args[2]);
          break;
        case 'rm-repo':
          rmRepoCommand(args[2]);
          break;
        case 'repos':
          listReposCommand();
          break;
        case 'interval':
          setIntervalCommand(args[2]);
          break;
        case 'show-repo':
          setShowRepoCommand(args[2]);
          break;
        case 'reminder':
          setReminderCommand(args[2]);
          break;
        case 'reminder-interval':
          setReminderIntervalCommand(args[2]);
          break;
        case 'clear':
          clearConfigCommand();
          break;
        default:
          await configCommand();
      }
      break;
    }

    case 'status':
      await statusCommand();
      break;

    case '--help':
    case '-h':
      showHelp();
      break;

    case '--version':
    case '-v':
      showVersion();
      break;

    default:
      log.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : 'Unknown error';
  log.error(`Error: ${message}`);
  process.exit(1);
});
