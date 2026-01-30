export interface Author {
  login: string;
  avatarUrl: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  repository: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  draft: boolean;
  reviewState: ReviewState;
}

export type ReviewState = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

export interface PRGroups {
  pending: PullRequest[];
  changesRequested: PullRequest[];
  approved: PullRequest[];
}

export interface Config {
  githubToken: string;
  repositories: string[];
  autoRefreshInterval: number;
  reminderEnabled: boolean;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: { login: string };
  error?: string;
}
