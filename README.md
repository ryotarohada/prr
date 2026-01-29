# prr - Pull Request Reminder

A macOS app to monitor GitHub PRs where you are assigned as a reviewer.

![prr Icon](app-bg-icon.png)

## Features

- View pending review PRs at a glance
- Desktop notifications for new PRs
- Periodic reminders for pending reviews
- Click PR card to open in GitHub

## Installation

Download the DMG file from [Releases](https://github.com/ryotarohada/prr/releases).

## Setup

1. Launch the app
2. Open Settings and enter your GitHub Personal Access Token
   - Required scopes: `repo`, `read:user`
   - [Create token here](https://github.com/settings/tokens)
3. Add repositories to watch (`owner/repo` format)
4. Save

## Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm start

# Build for macOS
pnpm dist:mac
```

## Tech Stack

- Electron
- React
- Tailwind CSS
- Octokit (GitHub API)

## License

ISC
