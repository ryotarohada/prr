import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface NotifiedPR {
  lastNotifiedAt: string;
}

interface StateData {
  notifiedPRs: Record<number, NotifiedPR>;
}

const STATE_PATH = join(homedir(), '.config', 'prr', 'state.yml');

const defaultState: StateData = {
  notifiedPRs: {},
};

function readState(): StateData {
  if (!existsSync(STATE_PATH)) {
    return { ...defaultState, notifiedPRs: {} };
  }

  try {
    const content = readFileSync(STATE_PATH, 'utf-8');
    const data = parse(content) as Partial<StateData>;
    return {
      notifiedPRs: data.notifiedPRs ?? {},
    };
  } catch {
    return { ...defaultState, notifiedPRs: {} };
  }
}

function writeState(data: StateData): void {
  const content = stringify(data);
  writeFileSync(STATE_PATH, content, 'utf-8');
}

export const state = {
  getAllNotifiedPrIds: (): number[] => {
    const data = readState();
    return Object.keys(data.notifiedPRs).map(Number);
  },

  getLastNotifiedAt: (prId: number): Date | null => {
    const data = readState();
    const pr = data.notifiedPRs[prId];
    if (!pr) return null;
    return new Date(pr.lastNotifiedAt);
  },

  setLastNotifiedAt: (prId: number, timestamp: Date): void => {
    const data = readState();
    data.notifiedPRs[prId] = {
      lastNotifiedAt: timestamp.toISOString(),
    };
    writeState(data);
  },

  cleanupStaleEntries: (currentPrIds: number[]): void => {
    const data = readState();
    const currentSet = new Set(currentPrIds);
    const cleaned: Record<number, NotifiedPR> = {};

    for (const [id, pr] of Object.entries(data.notifiedPRs)) {
      const numId = Number(id);
      if (currentSet.has(numId)) {
        cleaned[numId] = pr;
      }
    }

    data.notifiedPRs = cleaned;
    writeState(data);
  },

  clear: (): void => {
    writeState({ ...defaultState, notifiedPRs: {} });
  },
};
