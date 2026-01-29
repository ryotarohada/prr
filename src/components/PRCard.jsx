function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function PRCard({ pr }) {
  const handleClick = () => {
    window.electronAPI.openExternal(pr.url);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 bg-github-bg border border-github-border rounded-md cursor-pointer hover:border-github-blue hover:bg-github-card transition-colors ${
        pr.draft ? 'opacity-70' : ''
      }`}
    >
      <div className="text-sm font-medium mb-2 leading-snug">
        {pr.draft && (
          <span className="inline-block px-1.5 py-0.5 bg-github-muted text-github-bg rounded text-[10px] font-medium uppercase mr-1.5">
            Draft
          </span>
        )}
        {pr.title}
      </div>
      <div className="flex items-center gap-2 text-xs text-github-muted">
        <span className="flex items-center gap-1">
          <img
            src={pr.author.avatarUrl}
            alt={pr.author.login}
            className="w-4 h-4 rounded-full"
          />
          {pr.author.login}
        </span>
        <span className="text-github-blue">{pr.repository}</span>
        <span className="ml-auto">{formatTimeAgo(pr.updatedAt)}</span>
      </div>
    </div>
  );
}

export default PRCard;
