import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { parse, stringify } from 'yaml';

interface ConfigData {
  token: string;
  repositories: string[];
  interval: number;
  showRepository: boolean;
  reminder: boolean;
  reminderInterval: number;
}

const CONFIG_DIR = join(homedir(), '.config', 'prr');
const CONFIG_PATH = join(CONFIG_DIR, 'config.yml');

const defaultConfig: ConfigData = {
  token: '',
  repositories: [],
  interval: 5,
  showRepository: true,
  reminder: true,
  reminderInterval: 30,
};

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readConfig(): ConfigData {
  if (!existsSync(CONFIG_PATH)) {
    return { ...defaultConfig };
  }

  try {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    const data = parse(content) as Partial<ConfigData>;
    return {
      token: data.token ?? defaultConfig.token,
      repositories: data.repositories ?? defaultConfig.repositories,
      interval: data.interval ?? defaultConfig.interval,
      showRepository: data.showRepository ?? defaultConfig.showRepository,
      reminder: data.reminder ?? defaultConfig.reminder,
      reminderInterval: data.reminderInterval ?? defaultConfig.reminderInterval,
    };
  } catch {
    return { ...defaultConfig };
  }
}

function writeConfig(data: ConfigData): void {
  ensureConfigDir();
  const content = stringify(data);
  writeFileSync(CONFIG_PATH, content, 'utf-8');
}

export const config = {
  getPath: (): string => CONFIG_PATH,

  getToken: (): string => readConfig().token,
  setToken: (token: string): void => {
    const data = readConfig();
    data.token = token;
    writeConfig(data);
  },

  getRepositories: (): string[] => readConfig().repositories,
  setRepositories: (repos: string[]): void => {
    const data = readConfig();
    data.repositories = repos;
    writeConfig(data);
  },
  addRepository: (repo: string): void => {
    const data = readConfig();
    if (!data.repositories.includes(repo)) {
      data.repositories.push(repo);
      writeConfig(data);
    }
  },
  removeRepository: (repo: string): void => {
    const data = readConfig();
    data.repositories = data.repositories.filter((r) => r !== repo);
    writeConfig(data);
  },

  getInterval: (): number => readConfig().interval,
  setInterval: (minutes: number): void => {
    const data = readConfig();
    data.interval = Math.max(1, minutes);
    writeConfig(data);
  },

  getShowRepository: (): boolean => readConfig().showRepository,
  setShowRepository: (show: boolean): void => {
    const data = readConfig();
    data.showRepository = show;
    writeConfig(data);
  },

  getReminder: (): boolean => readConfig().reminder,
  setReminder: (enabled: boolean): void => {
    const data = readConfig();
    data.reminder = enabled;
    writeConfig(data);
  },

  getReminderInterval: (): number => readConfig().reminderInterval,
  setReminderInterval: (minutes: number): void => {
    const data = readConfig();
    data.reminderInterval = Math.max(1, minutes);
    writeConfig(data);
  },

  isConfigured: (): boolean => {
    const data = readConfig();
    return Boolean(data.token && data.repositories.length > 0);
  },

  getAll: (): ConfigData => readConfig(),

  clear: (): void => {
    writeConfig({ ...defaultConfig });
  },
};
