const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  validateToken: (token) => ipcRenderer.invoke('validate-token', token),
  fetchPullRequests: () => ipcRenderer.invoke('fetch-pull-requests'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  refreshMainWindow: () => ipcRenderer.invoke('refresh-main-window'),
  onRefreshData: (callback) => ipcRenderer.on('refresh-data', callback),
});
