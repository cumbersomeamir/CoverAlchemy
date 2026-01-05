
import React, { useState, useEffect, useCallback } from 'react';
import { generateBookCover } from './services/geminiService';
import { GenerationParams, GeneratedCover, ModelType } from './types';
import Button from './components/Button';

const LOADING_MESSAGES = [
  "Mixing the perfect colors...",
  "Sketching the layout...",
  "Applying typography...",
  "Polishing the final design...",
  "Almost ready for print..."
];

const App: React.FC = () => {
  const [params, setParams] = useState<GenerationParams>({
    title: '',
    author: '',
    description: '',
    genre: 'Fiction',
    style: 'Cinematic',
    model: 'gemini-2.5-flash-image',
    imageSize: '1K'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCover, setCurrentCover] = useState<GeneratedCover | null>(null);
  const [history, setHistory] = useState<GeneratedCover[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading messages
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!params.title) {
      setError("Please enter a book title");
      return;
    }

    setError(null);

    // If Pro model, check for key selection
    if (params.model === 'gemini-3-pro-image-preview') {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Proceed after key selection (system guidance requirement)
        }
      } catch (e) {
        console.error("AI Studio key error:", e);
      }
    }

    setIsGenerating(true);
    try {
      const imageUrl = await generateBookCover(params);
      const newCover: GeneratedCover = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        timestamp: Date.now(),
        params: { ...params }
      };
      setCurrentCover(newCover);
      setHistory(prev => [newCover, ...prev].slice(0, 5));
    } catch (err: any) {
      if (err.message === 'PRO_KEY_REQUIRED') {
        setError("To use the Pro model, please select a valid API key with billing enabled.");
        await window.aistudio.openSelectKey();
      } else {
        setError("Failed to generate cover. Please try again.");
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\s+/g, '_')}_cover.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col items-center mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
          CoverAlchemy
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Transform your story's essence into professional book cover art using state-of-the-art Gemini visual intelligence.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Form */}
        <section className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl h-fit sticky top-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Book Title *</label>
              <input 
                type="text"
                placeholder="The Chronicles of Aurora"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={params.title}
                onChange={e => setParams(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Author Name (Optional)</label>
              <input 
                type="text"
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={params.author}
                onChange={e => setParams(p => ({ ...p, author: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Genre</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={params.genre}
                  onChange={e => setParams(p => ({ ...p, genre: e.target.value }))}
                >
                  <option>Fantasy</option>
                  <option>Sci-Fi</option>
                  <option>Mystery</option>
                  <option>Romance</option>
                  <option>Thriller</option>
                  <option>Historical</option>
                  <option>Non-Fiction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Style</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={params.style}
                  onChange={e => setParams(p => ({ ...p, style: e.target.value }))}
                >
                  <option>Cinematic</option>
                  <option>Minimalist</option>
                  <option>Oil Painting</option>
                  <option>Digital Art</option>
                  <option>Gothic</option>
                  <option>Pastel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Description & Atmosphere</label>
              <textarea 
                rows={3}
                placeholder="A lonely astronaut standing on a purple desert planet looking at three moons..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                value={params.description}
                onChange={e => setParams(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Engine Quality</span>
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button 
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${params.model === 'gemini-2.5-flash-image' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    onClick={() => setParams(p => ({ ...p, model: 'gemini-2.5-flash-image' }))}
                  >
                    FLASH
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${params.model === 'gemini-3-pro-image-preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    onClick={() => setParams(p => ({ ...p, model: 'gemini-3-pro-image-preview' }))}
                  >
                    PRO (2K/4K)
                  </button>
                </div>
              </div>

              {params.model === 'gemini-3-pro-image-preview' && (
                <div className="flex items-center justify-between mb-4 animate-fadeIn">
                  <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Output Size</span>
                  <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                    {['1K', '2K', '4K'].map((size) => (
                      <button 
                        key={size}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${params.imageSize === size ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        onClick={() => setParams(p => ({ ...p, imageSize: size as any }))}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleGenerate} 
              isLoading={isGenerating}
            >
              {isGenerating ? LOADING_MESSAGES[loadingMsgIdx] : "Generate Book Cover"}
            </Button>
          </div>
        </section>

        {/* Output Section */}
        <section className="flex flex-col items-center space-y-8">
          <div className={`relative w-full aspect-[3/4] max-w-md bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl transition-all duration-700 ${isGenerating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            {!currentCover && !isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-600">
                <svg className="w-20 h-20 mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xl font-serif mb-2">Your masterpiece awaits</p>
                <p className="text-sm">Configure your book details and let the AI bring your vision to life.</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-medium animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</p>
              </div>
            )}

            {currentCover && (
              <img 
                src={currentCover.url} 
                alt="Generated Book Cover" 
                className={`w-full h-full object-cover transition-all duration-1000 ${isGenerating ? 'blur-md' : 'blur-0'}`}
              />
            )}
          </div>

          {currentCover && !isGenerating && (
            <div className="flex gap-4 w-full max-w-md">
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => downloadImage(currentCover.url, currentCover.params.title)}
              >
                Download Cover
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={handleGenerate}
              >
                Regenerate
              </Button>
            </div>
          )}

          {/* History / Previous Generations */}
          {history.length > 0 && (
            <div className="w-full max-w-md">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Recent Iterations</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {history.map((cover) => (
                  <button 
                    key={cover.id}
                    onClick={() => setCurrentCover(cover)}
                    className={`flex-shrink-0 w-24 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${currentCover?.id === cover.id ? 'border-indigo-500 scale-105' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <img src={cover.url} alt="History thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-900 w-full text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CoverAlchemy Studio. Powered by Google Gemini.</p>
        <div className="mt-2 flex justify-center gap-6">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Billing Documentation</a>
          <span className="text-slate-800">|</span>
          <span className="text-slate-600">Pro features require paid API project</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
