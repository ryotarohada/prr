import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function SettingsModal({ isOpen, onClose }) {
  const [token, setToken] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [repoInput, setRepoInput] = useState('');
  const [tokenStatus, setTokenStatus] = useState(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const settings = await window.electronAPI.getSettings();
    setToken(settings.githubToken || '');
    setRepositories(settings.repositories || []);
    if (settings.githubToken) {
      validateToken(settings.githubToken);
    }
  };

  const validateToken = async (t) => {
    if (!t) {
      setTokenStatus(null);
      return;
    }
    setTokenStatus({ type: 'validating', message: 'Validating...' });
    const result = await window.electronAPI.validateToken(t);
    if (result.valid) {
      setTokenStatus({ type: 'valid', message: `Valid: ${result.user.login}` });
    } else {
      setTokenStatus({ type: 'invalid', message: 'Invalid token' });
    }
  };

  const addRepository = () => {
    const repo = repoInput.trim();
    if (!repo) return;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      alert('Format: owner/repository');
      return;
    }
    if (!repositories.includes(repo)) {
      setRepositories([...repositories, repo]);
    }
    setRepoInput('');
  };

  const removeRepository = (repo) => {
    setRepositories(repositories.filter((r) => r !== repo));
  };

  const handleSave = async () => {
    await window.electronAPI.saveSettings({
      githubToken: token,
      repositories,
    });
    await window.electronAPI.refreshMainWindow();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-github-card border border-github-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-github-border">
          <h2 className="text-base font-semibold">Settings</h2>
          <button onClick={onClose} className="text-github-muted hover:text-github-text">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">GitHub Token</label>
            <div className="flex gap-2">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onBlur={() => validateToken(token)}
                placeholder="ghp_xxxx"
                className="flex-1 px-3 py-2 bg-github-bg border border-github-border rounded-md text-sm focus:outline-none focus:border-github-blue"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-2 bg-github-bg border border-github-border rounded-md text-xs"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-github-muted mt-1">Scopes: repo, read:user</p>
            {tokenStatus && (
              <p className={`text-xs mt-1 ${
                tokenStatus.type === 'valid' ? 'text-github-green' :
                tokenStatus.type === 'invalid' ? 'text-github-red' : 'text-github-muted'
              }`}>
                {tokenStatus.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Repositories</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRepository()}
                placeholder="owner/repo"
                className="flex-1 px-3 py-2 bg-github-bg border border-github-border rounded-md text-sm focus:outline-none focus:border-github-blue"
              />
              <button
                onClick={addRepository}
                className="px-3 py-2 bg-github-bg border border-github-border rounded-md text-sm hover:bg-github-border"
              >
                Add
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {repositories.map((repo) => (
                <li key={repo} className="flex items-center justify-between px-3 py-2 bg-github-bg border border-github-border rounded-md">
                  <span className="text-sm text-github-blue">{repo}</span>
                  <button
                    onClick={() => removeRepository(repo)}
                    className="text-xs text-github-red hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-github-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-github-bg border border-github-border rounded-md text-sm hover:bg-github-border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-github-green text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
