const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const store = require('./src/store');
const github = require('./src/github');
const notifier = require('./src/notifier');

let mainWindow = null;

// ============================================================
// Window Management
// ============================================================

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 600,
    title: 'Pull Request Reminder',
    icon: path.join(__dirname, 'app-bg-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

// ============================================================
// IPC Handlers
// ============================================================

function setupIpcHandlers() {
  ipcMain.handle('get-settings', () => store.getSettings());

  ipcMain.handle('save-settings', async (event, settings) => {
    store.saveSettings(settings);
    if (settings.githubToken) {
      github.initOctokit(settings.githubToken);
    }
    return { success: true };
  });

  ipcMain.handle('validate-token', async (event, token) => {
    return github.validateToken(token);
  });

  ipcMain.handle('fetch-pull-requests', async () => {
    const token = store.getToken();
    if (!token) return { error: 'GitHub token not configured' };

    const repositories = store.getRepositories();
    if (repositories.length === 0) return { error: 'No repositories configured' };

    try {
      github.initOctokit(token);
      const prs = await github.fetchPullRequests(repositories);
      return { success: true, data: prs };
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('open-external', (event, url) => shell.openExternal(url));
  ipcMain.handle('refresh-main-window', () => {
    mainWindow?.webContents.send('refresh-data');
  });
}

// ============================================================
// App Lifecycle
// ============================================================

app.setName('prr');

app.whenReady().then(() => {
  // macOSのDockアイコンを設定
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'app-bg-icon.png'));
  }

  createMainWindow();
  setupIpcHandlers();

  const token = store.getToken();
  if (token) {
    github.initOctokit(token);
  }

  notifier.startPeriodicCheck(() => {
    mainWindow?.webContents.send('refresh-data');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
