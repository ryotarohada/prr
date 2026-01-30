import { Octokit } from '@octokit/rest';
import type { PullRequest, PRGroups, ReviewState, TokenValidationResult } from '../types/index.js';

let octokit: Octokit | null = null;
let currentUser: { login: string } | null = null;

export function initOctokit(token: string): void {
  octokit = new Octokit({ auth: token });
  currentUser = null;
}

export async function getCurrentUser(): Promise<{ login: string }> {
  if (!octokit) throw new Error('GitHub token not configured');
  if (currentUser) return currentUser;

  const { data } = await octokit.users.getAuthenticated();
  currentUser = data;
  return currentUser;
}

function getReviewState(
  reviews: Array<{ user: { login: string } | null; state: string; submitted_at?: string }>,
  currentUserLogin: string
): ReviewState {
  const userReviews = reviews
    .filter((r) => r.user?.login === currentUserLogin)
    .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());

  if (userReviews.length === 0) return 'PENDING';

  const latestReview = userReviews[0];
  switch (latestReview.state) {
    case 'APPROVED':
      return 'APPROVED';
    case 'CHANGES_REQUESTED':
      return 'CHANGES_REQUESTED';
    default:
      return 'PENDING';
  }
}

export async function fetchPullRequests(repositories: string[]): Promise<PRGroups> {
  if (!octokit) throw new Error('GitHub token not configured');

  const user = await getCurrentUser();
  const allPRs: PullRequest[] = [];

  for (const repo of repositories) {
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) continue;

    try {
      const { data: pulls } = await octokit.pulls.list({
        owner,
        repo: repoName,
        state: 'open',
        per_page: 100,
      });

      for (const pr of pulls) {
        const isRequestedReviewer = pr.requested_reviewers?.some(
          (r) => r.login === user.login
        );

        if (!isRequestedReviewer) continue;

        const { data: reviews } = await octokit.pulls.listReviews({
          owner,
          repo: repoName,
          pull_number: pr.number,
        });

        const reviewState = getReviewState(reviews, user.login);

        allPRs.push({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          repository: repo,
          author: {
            login: pr.user?.login || 'unknown',
            avatarUrl: pr.user?.avatar_url || '',
          },
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          draft: pr.draft || false,
          reviewState,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching PRs from ${repo}: ${message}`);
    }
  }

  return {
    pending: allPRs.filter((pr) => pr.reviewState === 'PENDING'),
    changesRequested: allPRs.filter((pr) => pr.reviewState === 'CHANGES_REQUESTED'),
    approved: allPRs.filter((pr) => pr.reviewState === 'APPROVED'),
  };
}

export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    const testOctokit = new Octokit({ auth: token });
    const { data } = await testOctokit.users.getAuthenticated();
    return { valid: true, user: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: message };
  }
}
