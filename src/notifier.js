const { Notification, shell } = require('electron');
const store = require('./store');
const github = require('./github');

let knownPRIds = new Set();
let checkInterval = null;
let isFirstCheck = true;
let onRefreshCallback = null;

function showNotification(title, body, url) {
  if (!Notification.isSupported()) {
    console.log('[prr] Notifications not supported');
    return;
  }

  console.log(`[prr] Showing notification: ${title}`);

  const notification = new Notification({
    title,
    body,
    silent: false,
    sound: 'default',
    urgency: 'critical',
  });

  if (url) {
    notification.on('click', () => {
      shell.openExternal(url);
    });
  }

  notification.show();
}

async function checkForNewPRs() {
  const token = store.getToken();
  const repositories = store.getRepositories();

  console.log('[prr] Checking for PRs...');

  if (!token || repositories.length === 0) {
    console.log('[prr] No token or repositories configured');
    return;
  }

  try {
    github.initOctokit(token);
    const prs = await github.fetchPullRequests(repositories);
    const pendingPRs = prs.pending;

    console.log(`[prr] Found ${pendingPRs.length} pending PRs`);

    const newPRs = pendingPRs.filter((pr) => !knownPRIds.has(pr.id));

    newPRs.forEach((pr) => {
      console.log(`[prr] New PR: ${pr.title}`);
      showNotification('New PR for Review', `${pr.repository}: ${pr.title}`, pr.url);
      knownPRIds.add(pr.id);
    });

    if (isFirstCheck) {
      pendingPRs.forEach((pr) => knownPRIds.add(pr.id));
      isFirstCheck = false;

      if (pendingPRs.length > 0) {
        console.log('[prr] First check - sending reminder');
        showNotification('Pending Reviews', `You have ${pendingPRs.length} PR(s) waiting for review`);
      }
    }

    if (onRefreshCallback) {
      onRefreshCallback();
    }
  } catch (error) {
    console.error('[prr] Error checking PRs:', error);
  }
}

function startPeriodicCheck(refreshCallback) {
  onRefreshCallback = refreshCallback;

  if (checkInterval) {
    clearInterval(checkInterval);
  }

  const interval = (store.getAutoRefreshInterval?.() || 5) * 60 * 1000;
  checkInterval = setInterval(checkForNewPRs, interval);

  checkForNewPRs();
}

module.exports = {
  startPeriodicCheck,
};
