import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { getGamepassDetails, parseGamepassId, GamepassData } from './services/robloxService';
import GamepassPreview from './components/GamepassPreview';
import './App.css';

import robuxSvg from './assets/robux.svg';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gamepassData, setGamepassData] = useState<GamepassData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState({ download: false, copy: false });
  
  const previewRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseGamepassId(url);
    if (!id) {
      setError('Invalid URL. Please enter a valid Roblox Gamepass link.');
      return;
    }

    setLoading(true);
    setError(null);
    setGamepassData(null);
    setLogs([]);
    addLog('System initialized.');

    try {
      const data = await getGamepassDetails(id, addLog);
      setGamepassData(data);
    } catch (err: any) {
      setError(`Fetch failed: ${err.message}.`);
      addLog(`FATAL ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    const formatted = text.replace(/^@/, '');
    navigator.clipboard.writeText(formatted);
    addLog(`Copied ${key}: ${formatted}`);

    setCopyState({ [key]: true });
    setTimeout(() => setCopyState({}), 2000);
  };

  const handleDownloadImage = async () => {
    if (!previewRef.current || !gamepassData) return;
    setProcessing(prev => ({ ...prev, download: true }));
    addLog('Generating 1080p PNG for export...');

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `rpig-owned-${gamepassData.id}.png`;
      link.href = dataUrl;
      link.click();
      addLog('Download started successfully.');
    } catch (err: any) {
      addLog(`EXPORT ERROR: ${err.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, download: false }));
    }
  };

  const handleCopyImage = async () => {
    if (!previewRef.current) return;
    setProcessing(prev => ({ ...prev, copy: true }));
    addLog('Preparing image for clipboard...');

    try {
      const blob = await toBlob(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      if (blob) {
        const data = [new ClipboardItem({ 'image/png': blob })];
        await navigator.clipboard.write(data);
        addLog('Image copied to clipboard!');
        setCopyState({ image: true });
        setTimeout(() => setCopyState({}), 2000);
      }
    } catch (err: any) {
      addLog(`CLIPBOARD ERROR: ${err.message}`);
      alert('Your browser might not support direct image copying. Please use Download instead.');
    } finally {
      setProcessing(prev => ({ ...prev, copy: false }));
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span>Roblox Gamepass Image Generator</span>
        </div>
      </header>

      <main className="content">
        <section className="search-section">
          <form onSubmit={handleFetch} className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Paste your Roblox Gamepass link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Fetch Data'}
            </button>
          </form>
          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </section>

        <div className="main-grid">
          <div className="views-section">
            {gamepassData ? (
              <div className="results-container">
                <div className="data-cards">
                  <div className="data-card clickable" onClick={() => handleCopyText(gamepassData.placeId, 'PlaceId')}>
                    <div className="card-top">
                      <span className="label">Place ID</span>
                      {copyState.PlaceId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </div>
                    <span className="value">{gamepassData.placeId}</span>
                  </div>
                  <div className="data-card clickable" onClick={() => handleCopyText(gamepassData.username, 'Owner')}>
                    <div className="card-top">
                      <span className="label">Owner</span>
                      {copyState.Owner ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </div>
                    <span className="value">@{gamepassData.username}</span>
                  </div>
                  <div className="data-card clickable" onClick={() => handleCopyText(gamepassData.price.toString(), 'Price')}>
                    <div className="card-top">
                      <span className="label">Price</span>
                      {copyState.Price ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </div>
                    <div className="value-group">
                      <img src={robuxSvg} alt="Robux" style={{ width: '18px', height: '18px' }} />
                      <span className="value">{gamepassData.price}</span>
                    </div>
                  </div>
                </div>

                <div className="previews-grid single">
                  <div className="preview-container dark">
                    <div className="preview-header">
                      <h3>Generated Preview (Owned Version)</h3>
                      <div className="button-group">
                        <button onClick={handleCopyImage} className={`action-btn ${copyState.image ? 'success' : ''}`} disabled={processing.copy}>
                          {processing.copy ? <Loader2 className="animate-spin" size={18} /> : (copyState.image ? <Check size={18} /> : <Copy size={18} />)}
                          {processing.copy ? 'Processing...' : (copyState.image ? 'Copied!' : 'Copy Image')}
                        </button>
                        <button onClick={handleDownloadImage} className="download-btn" disabled={processing.download}>
                          {processing.download ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                          {processing.download ? 'Generating...' : 'Download 1080p'}
                        </button>
                      </div>
                    </div>
                    <div className="preview-canvas-wrapper flat">
                      <div className="scale-container">
                        <GamepassPreview data={gamepassData} containerRef={previewRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading && (
              <div className="onboarding">
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
