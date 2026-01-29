const Store = require("electron-store");

const store = new Store({
  encryptionKey: "prr-encryption-key",
  schema: {
    githubToken: {
      type: "string",
      default: "",
    },
    repositories: {
      type: "array",
      default: [],
      items: {
        type: "string",
      },
    },
    autoRefreshInterval: {
      type: "number",
      default: 1,
    },
    reminderEnabled: {
      type: "boolean",
      default: true,
    },
  },
});

module.exports = {
  getToken: () => store.get("githubToken"),
  setToken: (token) => store.set("githubToken", token),

  getRepositories: () => store.get("repositories"),
  setRepositories: (repos) => store.set("repositories", repos),
  addRepository: (repo) => {
    const repos = store.get("repositories");
    if (!repos.includes(repo)) {
      repos.push(repo);
      store.set("repositories", repos);
    }
  },
  removeRepository: (repo) => {
    const repos = store.get("repositories").filter((r) => r !== repo);
    store.set("repositories", repos);
  },

  getAutoRefreshInterval: () => store.get("autoRefreshInterval"),
  setAutoRefreshInterval: (minutes) =>
    store.set("autoRefreshInterval", minutes),

  getReminderEnabled: () => store.get("reminderEnabled"),
  setReminderEnabled: (enabled) => store.set("reminderEnabled", enabled),

  getSettings: () => ({
    githubToken: store.get("githubToken"),
    repositories: store.get("repositories"),
    autoRefreshInterval: store.get("autoRefreshInterval"),
    reminderEnabled: store.get("reminderEnabled"),
  }),

  saveSettings: (settings) => {
    if (settings.githubToken !== undefined) {
      store.set("githubToken", settings.githubToken);
    }
    if (settings.repositories !== undefined) {
      store.set("repositories", settings.repositories);
    }
    if (settings.autoRefreshInterval !== undefined) {
      store.set("autoRefreshInterval", settings.autoRefreshInterval);
    }
    if (settings.reminderEnabled !== undefined) {
      store.set("reminderEnabled", settings.reminderEnabled);
    }
  },
};
