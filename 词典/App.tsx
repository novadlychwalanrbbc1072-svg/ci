import React, { useState, useEffect, useRef } from 'react';
import { lookupWord } from './services/geminiService.ts';
import { WordDefinition, SearchStatus, FavoriteItem } from './types.ts';
import { WordCard } from './components/WordCard.tsx';
import { FavoritesSidebar } from './components/FavoritesSidebar.tsx';
import { SearchIcon, BookOpenIcon, DownloadIcon, XMarkIcon } from './components/Icons.tsx';

function App() {
  // State
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [currentWord, setCurrentWord] = useState<WordDefinition | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  // Refs for auto-scroll
  const resultRef = useRef<HTMLDivElement>(null);

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hanyun_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Automatically show the banner when installation is available
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem('hanyun_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setStatus('loading');
    setErrorMessage('');
    setCurrentWord(null);

    try {
      const data = await lookupWord(query);
      setCurrentWord(data);
      setStatus('success');
      // Scroll to result on mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('无法找到该词语或网络连接失败。请稍后重试。');
    }
  };

  const toggleFavorite = () => {
    if (!currentWord) return;
    
    const exists = favorites.find(f => f.word === currentWord.word);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.word !== currentWord.word));
    } else {
      const newFav: FavoriteItem = { ...currentWord, savedAt: Date.now() };
      setFavorites(prev => [newFav, ...prev]);
    }
  };

  const selectFavorite = (item: FavoriteItem) => {
    setCurrentWord(item);
    setStatus('success');
    setIsSidebarOpen(false);
    setQuery(item.word);
  };

  const removeFavorite = (word: string) => {
    setFavorites(prev => prev.filter(f => f.word !== word));
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const isCurrentFavorite = currentWord ? favorites.some(f => f.word === currentWord.word) : false;

  return (
    <div className="min-h-screen font-sans text-ink-900 pb-20 safe-pb relative">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-paper/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-seal-red text-white p-1 rounded-sm shadow-sm">
                <span className="font-calligraphy text-2xl leading-none">韵</span>
            </div>
            <span className="text-xl font-serif font-bold tracking-tight hidden sm:block">汉韵词典</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600 font-medium text-sm"
            >
              <BookOpenIcon className="w-5 h-5" />
              <span className="hidden sm:inline">生词本 ({favorites.length})</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Search Section */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col items-center justify-center px-4 ${status === 'idle' ? 'min-h-[80vh]' : 'py-12'}`}>
        
        {status === 'idle' && (
          <div className="text-center mb-12 animate-fade-in">
             <h1 className="text-5xl sm:text-7xl font-serif font-bold text-ink-900 mb-4 tracking-tight">
               探寻<span className="text-seal-red">古今</span>
             </h1>
             <p className="text-stone-500 text-lg sm:text-xl font-serif">
               Explore the depth of Chinese words, from ancient roots to modern usage.
             </p>
          </div>
        )}

        <div className="w-full max-w-2xl relative z-20">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon className="w-6 h-6 text-stone-400 group-focus-within:text-seal-red transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="请输入字、词、成语... (Type a word)"
              className="w-full pl-14 pr-4 py-4 text-xl bg-white border-2 border-stone-200 rounded-2xl shadow-sm focus:border-seal-red focus:ring-4 focus:ring-seal-red/10 outline-none transition-all placeholder:text-stone-300"
            />
            <button 
              type="submit"
              disabled={status === 'loading' || !query.trim()}
              className="absolute right-3 top-2.5 bottom-2.5 px-6 bg-ink-900 text-white rounded-xl font-medium hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? '查找中...' : '搜索'}
            </button>
          </form>
          
          {/* Quick Suggestions (Only when idle) */}
          {status === 'idle' && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-stone-500">
               <span>尝试搜索 Try:</span>
               {['浩瀚', '知行合一', '缘木求鱼', 'Dictionary', 'Computer'].map(w => (
                 <button 
                   key={w} 
                   onClick={() => { setQuery(w); handleSearch(); }}
                   className="hover:text-seal-red underline underline-offset-4 decoration-stone-300 hover:decoration-seal-red transition-all"
                 >
                   {w}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={resultRef} className="max-w-5xl mx-auto px-4 flex justify-center pb-20">
        
        {status === 'loading' && (
          <div className="w-full max-w-2xl bg-white rounded-xl p-8 shadow-sm border border-stone-100 flex flex-col items-center justify-center space-y-6 animate-pulse">
             <div className="h-20 w-32 bg-stone-200 rounded-lg"></div>
             <div className="h-6 w-48 bg-stone-200 rounded"></div>
             <div className="w-full h-px bg-stone-100 my-4"></div>
             <div className="space-y-3 w-full">
               <div className="h-4 bg-stone-200 rounded w-full"></div>
               <div className="h-4 bg-stone-200 rounded w-5/6"></div>
               <div className="h-4 bg-stone-200 rounded w-4/6"></div>
             </div>
             <p className="text-stone-400 text-sm animate-bounce mt-4">AI 正在翻阅典籍... (AI is searching...)</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center p-8 bg-red-50 text-red-800 rounded-xl border border-red-100 max-w-lg">
            <p className="font-bold text-lg mb-2">出错了 Error</p>
            <p>{errorMessage}</p>
            <button onClick={() => handleSearch()} className="mt-4 text-sm font-semibold hover:underline">重试 Try Again</button>
          </div>
        )}

        {status === 'success' && currentWord && (
          <WordCard 
            data={currentWord} 
            isFavorite={isCurrentFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>

      {/* Install Banner (Bottom Sheet style) */}
      {installPrompt && showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-seal-red rounded-lg flex items-center justify-center shrink-0">
                 <span className="font-calligraphy text-2xl text-white">韵</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-ink-900">安装 汉韵词典 APP</span>
                <span className="text-xs text-stone-500">体验更流畅，支持离线访问</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleInstallClick}
                className="bg-ink-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink-800 whitespace-nowrap"
              >
                安装
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <FavoritesSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        favorites={favorites}
        onSelect={selectFavorite}
        onRemove={removeFavorite}
      />
      
    </div>
  );
}

export default App;