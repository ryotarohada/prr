import { RefreshCw, Settings } from 'lucide-react';

function Header({ onRefresh, onSettings }) {
  return (
    <header className="flex items-center gap-2 px-4 py-3 bg-github-card border-b border-github-border">
      <h1 className="text-lg font-semibold text-github-blue">prr</h1>
      <div className="flex-1" />
      <button
        onClick={onRefresh}
        className="p-1.5 text-github-muted hover:text-github-text"
        title="Refresh"
      >
        <RefreshCw size={16} />
      </button>
      <button
        onClick={onSettings}
        className="p-1.5 text-github-muted hover:text-github-text"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </header>
  );
}

export default Header;
