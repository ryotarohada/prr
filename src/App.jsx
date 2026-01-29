import { useState, useEffect } from 'react';
import Header from './components/Header';
import PRCard from './components/PRCard';
import SettingsModal from './components/SettingsModal';

function App() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchPRs = async () => {
    setLoading(true);
    setError(null);

    const result = await window.electronAPI.fetchPullRequests();

    if (result.error) {
      if (result.error.includes('not configured')) {
        setNeedsSetup(true);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }

    setPrs(result.data.pending);
    setNeedsSetup(false);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const settings = await window.electronAPI.getSettings();
      if (!settings.githubToken || settings.repositories.length === 0) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }
      await fetchPRs();
    };

    init();

    window.electronAPI.onRefreshData(() => {
      init();
    });
  }, []);

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => {
    setShowSettings(false);
    fetchPRs();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header onRefresh={fetchPRs} onSettings={openSettings} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-github-border border-t-github-blue rounded-full animate-spin" />
        </div>
        <SettingsModal isOpen={showSettings} onClose={closeSettings} />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="flex flex-col h-screen">
        <Header onRefresh={fetchPRs} onSettings={openSettings} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-github-muted">No configuration found.</p>
          <button
            onClick={openSettings}
            className="px-4 py-2 bg-github-green text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Setup
          </button>
        </div>
        <SettingsModal isOpen={showSettings} onClose={closeSettings} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header onRefresh={fetchPRs} onSettings={openSettings} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-github-red">{error}</p>
          <button
            onClick={fetchPRs}
            className="px-4 py-2 bg-github-card border border-github-border text-github-text rounded-md text-sm hover:bg-github-border"
          >
            Retry
          </button>
        </div>
        <SettingsModal isOpen={showSettings} onClose={closeSettings} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header onRefresh={fetchPRs} onSettings={openSettings} />
      <main className="flex-1 p-3 overflow-hidden">
        <div className="h-full bg-github-card border border-github-border rounded-lg flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-github-border">
            <h2 className="text-sm font-semibold">Pending Review</h2>
            <span className="px-2 py-0.5 bg-github-yellow text-github-bg rounded-full text-xs font-medium">
              {prs.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {prs.map((pr) => (
              <PRCard key={pr.id} pr={pr} />
            ))}
            {prs.length === 0 && (
              <p className="text-center text-github-muted text-sm py-8">
                No pending reviews
              </p>
            )}
          </div>
        </div>
      </main>
      <SettingsModal isOpen={showSettings} onClose={closeSettings} />
    </div>
  );
}

export default App;
