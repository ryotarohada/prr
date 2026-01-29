const { Octokit } = require('@octokit/rest');

let octokit = null;
let currentUser = null;

const initOctokit = (token) => {
  octokit = new Octokit({ auth: token });
  currentUser = null;
};

const getCurrentUser = async () => {
  if (!octokit) throw new Error('GitHub token not configured');
  if (currentUser) return currentUser;

  const { data } = await octokit.users.getAuthenticated();
  currentUser = data;
  return currentUser;
};

const getReviewState = (reviews, currentUserLogin) => {
  const userReviews = reviews
    .filter((r) => r.user.login === currentUserLogin)
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

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
};

const fetchPullRequests = async (repositories) => {
  if (!octokit) throw new Error('GitHub token not configured');

  const user = await getCurrentUser();
  const allPRs = [];

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
        // requested_reviewersに自分がいる場合のみ対象
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
            login: pr.user.login,
            avatarUrl: pr.user.avatar_url,
          },
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          draft: pr.draft,
          reviewState,
        });
      }
    } catch (error) {
      console.error(`Error fetching PRs from ${repo}:`, error.message);
    }
  }

  return {
    pending: allPRs.filter((pr) => pr.reviewState === 'PENDING'),
    changesRequested: allPRs.filter((pr) => pr.reviewState === 'CHANGES_REQUESTED'),
    approved: allPRs.filter((pr) => pr.reviewState === 'APPROVED'),
  };
};

const validateToken = async (token) => {
  try {
    const testOctokit = new Octokit({ auth: token });
    const { data } = await testOctokit.users.getAuthenticated();
    return { valid: true, user: data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  initOctokit,
  getCurrentUser,
  fetchPullRequests,
  validateToken,
};
