# prr

Pull Request Reminder - CLI tool for tracking GitHub PRs awaiting your review.

## Features

- Watch mode: continuously monitors PRs and sends macOS notifications
- View pending review PRs in your terminal
- Desktop notifications for new PRs (click to open PR in browser)
- Reminder notifications for pending PRs
- Simple configuration management

## Installation

```bash
npm install -g @ryotarohada/prr
```

## Setup

```bash
# Interactive setup
prr config
```

You'll need a GitHub Personal Access Token:

- Required scopes: `repo`, `read:user`
- [Create token here](https://github.com/settings/tokens)

## Configuration

Config file: `~/.config/prr/config.yml`

```yaml
token: ghp_xxxxx
repositories:
  - owner/repo
  - org/another-repo
interval: 5
showRepository: true
reminder: true
reminderInterval: 30
```

## Usage

```bash
# Start watch mode (default)
prr

# List PRs once
prr list

# Show current configuration
prr status
```

## Commands

| Command                      | Description           |
| ---------------------------- | --------------------- |
| `prr`                        | Start watch mode      |
| `prr watch`                  | Start watch mode      |
| `prr list`                   | List pending PRs once |
| `prr status`                 | Show current config   |
| `prr config`                 | Interactive setup     |
| `prr config set-token`       | Set GitHub token      |
| `prr config add-repo <repo>` | Add repository        |
| `prr config rm-repo <repo>`  | Remove repository     |
| `prr config repos`           | List repositories     |
| `prr config interval <min>`  | Set check interval    |
| `prr config show-repo <on\|off>` | Toggle repo name display |
| `prr config reminder <on\|off>` | Toggle reminder notifications |
| `prr config reminder-interval <min>` | Set reminder interval |
| `prr config clear`           | Clear configuration   |
| `prr --help`                 | Show help             |

## Development

```bash
# Run in development mode
pnpm dev

# Build
pnpm build
```

## Tech Stack

- TypeScript
- Octokit (GitHub API)
- YAML (configuration)

## License

MIT
