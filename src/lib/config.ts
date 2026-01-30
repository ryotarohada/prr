import Conf from 'conf';
import type { Config } from '../types/index.js';

const schema = {
  githubToken: { type: 'string' as const, default: '' },
  repositories: { type: 'array' as const, default: [] as string[], items: { type: 'string' as const } },
  autoRefreshInterval: { type: 'number' as const, default: 5 },
  reminderEnabled: { type: 'boolean' as const, default: true },
};

const store = new Conf<Config>({
  projectName: 'prr',
  schema,
});

export const config = {
  getToken: (): string => store.get('githubToken'),
  setToken: (token: string): void => { store.set('githubToken', token); },

  getRepositories: (): string[] => store.get('repositories'),
  setRepositories: (repos: string[]): void => { store.set('repositories', repos); },
  addRepository: (repo: string): void => {
    const repos = store.get('repositories');
    if (!repos.includes(repo)) {
      repos.push(repo);
      store.set('repositories', repos);
    }
  },
  removeRepository: (repo: string): void => {
    const repos = store.get('repositories').filter((r) => r !== repo);
    store.set('repositories', repos);
  },

  getInterval: (): number => store.get('autoRefreshInterval'),
  setInterval: (minutes: number): void => { store.set('autoRefreshInterval', Math.max(1, minutes)); },

  isConfigured: (): boolean => {
    const token = store.get('githubToken');
    const repos = store.get('repositories');
    return Boolean(token && repos.length > 0);
  },

  getAll: (): Config => ({
    githubToken: store.get('githubToken'),
    repositories: store.get('repositories'),
    autoRefreshInterval: store.get('autoRefreshInterval'),
    reminderEnabled: store.get('reminderEnabled'),
  }),

  clear: (): void => { store.clear(); },
};
