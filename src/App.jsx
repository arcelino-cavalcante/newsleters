import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Menu, X, ArrowRight, Calendar, ChevronRight,
  Sun, Moon, Maximize2, Minimize2,
  Clock, BookOpen, Settings, Filter, LogOut, UploadCloud,
  Search, Share2, Copy, Link2, MessageCircle
} from 'lucide-react';
import { useModal } from './components/ModalProvider';
import { categoryService } from './services/categoryService';
import { settingsService } from './services/settingsService';
import { adService } from './services/adService';
import ModernEditor from './components/ModernEditor';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AdBlock from './components/AdBlock';
import { postService } from './services/postService';

const AdminRoute = ({ user, children }) => {
  if (user === undefined) return null; // Wait for auth state to initialize
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Stoic Quotes for daily rotation
const STOIC_QUOTES = [
  { text: "A felicidade da sua vida depende da qualidade dos seus pensamentos.", author: "Marco Aurélio" },
  { text: "Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que são difíceis.", author: "Sêneca" },
  { text: "Primeiro diga a si mesmo o que você seria; então faça o que tem que fazer.", author: "Epicteto" },
  { text: "A alma se torna tingida pela cor de seus pensamentos.", author: "Marco Aurélio" },
  { text: "É preciso toda uma vida para aprender a viver.", author: "Sêneca" },
  { text: "O homem que conquistou a si mesmo é muito maior do que aquele que conquistou mil batalhas.", author: "Buda" },
  { text: "Que a força me seja dada para suportar o que não pode ser mudado e a coragem para mudar o que pode ser.", author: "Sêneca" },
  { text: "Temos o poder sobre nossa mente, não sobre eventos externos. Perceba isso e encontrará força.", author: "Marco Aurélio" },
  { text: "A riqueza não consiste em ter grandes posses, mas em ter poucas necessidades.", author: "Epicteto" },
  { text: "O sofrimento é uma parte da natureza; mas a miséria é uma escolha.", author: "Marco Aurélio" },
];

const getDailyQuote = () => STOIC_QUOTES[Math.floor((Date.now() / 86400000)) % STOIC_QUOTES.length];

const App = () => {
  const { toast } = useModal();
  const [dbPosts, setDbPosts] = useState([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [siteConfig, setSiteConfig] = useState({
    siteTitle: "O CAMINHO DO HOMEM",
    siteSubtitle: "FILOSOFIA APLICADA"
  });
  const [user, setUser] = useState(undefined);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [readingPost, setReadingPost] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('serif');
  const [progress, setProgress] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [allPosts, setAllPosts] = useState([]);

  // Monitor Auth State
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setUser({ username: localStorage.getItem('github_owner') });
    } else {
      setUser(null);
    }
  }, []);

  // Fetch posts and categories from Firebase on load
  useEffect(() => {
    const fetchData = async () => {
      // If we're not in the admin area, fetch paginated data
      const isPublicArea = !window.location.pathname.startsWith('/admin');
      
      if (isPublicArea) {
        const { posts, lastVisibleDate } = await postService.getPostsPaginated(6, 'Todos', null);
        setDbPosts(posts);
        setLastVisibleDoc(lastVisibleDate);
        setHasMorePosts(posts.length === 6);
      } else {
         const remotePosts = await postService.getAllPosts();
         setDbPosts(remotePosts);
      }

      const remoteCategories = await categoryService.getAllCategories();
      const visibleCategories = remoteCategories
        .filter(c => c.visible)
        .map(c => c.name)
        .sort();
      setCategories(['Todos', ...visibleCategories]);

      const settings = await settingsService.getGeneralSettings();
      if (settings) setSiteConfig(settings);

      const remoteAds = await adService.getAllAds();
      setAds(remoteAds.filter(ad => ad.active));

      // Pre-fetch all posts for search functionality
      if (isPublicArea) {
        const all = await postService.getAllPosts();
        setAllPosts(all);
      }
    };
    fetchData();
  }, []); 

  // Effect for changing categories
  useEffect(() => {
    const fetchCategoryPosts = async () => {
      const isPublicArea = !window.location.pathname.startsWith('/admin');
      if (isPublicArea && currentCategory !== 'Todos') {
        const { posts, lastVisibleDate } = await postService.getPostsPaginated(6, currentCategory, null);
        setDbPosts(posts);
        setLastVisibleDoc(lastVisibleDate);
        setHasMorePosts(posts.length === 6);
      } else if (isPublicArea && currentCategory === 'Todos') {
         // Reload all paginated
         const { posts, lastVisibleDate } = await postService.getPostsPaginated(6, 'Todos', null);
         setDbPosts(posts);
         setLastVisibleDoc(lastVisibleDate);
         setHasMorePosts(posts.length === 6);
      }
    };
    
    // Only fetch if it's an actual user interaction after mount
    // Mount fetch is handled by the first useEffect
    if (categories.length > 1) { 
       fetchCategoryPosts();
    }
  }, [currentCategory]);

  const handleLoadMore = async () => {
    if (!hasMorePosts) return;
    setIsLoadingMore(true);
    
    const { posts, lastVisibleDate } = await postService.getPostsPaginated(6, currentCategory, lastVisibleDoc);
    
    setDbPosts(prev => [...prev, ...posts]);
    setLastVisibleDoc(lastVisibleDate);
    
    // If we fetched less than 6, there are no more posts
    if (posts.length < 6) {
      setHasMorePosts(false);
    }
    
    setIsLoadingMore(false);
  };

  const filteredPosts = dbPosts; // Client side filtering is no longer needed for public area since backend does it, except for Admin where it loads all.
  
  const displayPosts = window.location.pathname.startsWith('/admin') 
    ? (currentCategory === 'Todos' ? dbPosts : dbPosts.filter(post => post.category === currentCategory)) 
    : (searchTerm 
        ? allPosts.filter(post => 
            (currentCategory === 'Todos' || post.category === currentCategory) &&
            (post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : dbPosts);

  const headerAds = ads.filter(a => a.placement === 'header');
  const postTopAds = ads.filter(a => a.placement === 'post_top');
  const postBottomAds = ads.filter(a => a.placement === 'post_bottom');
  const footerAds = ads.filter(a => a.placement === 'footer');

  useEffect(() => {
    const updateProgress = () => {
      if (!readingPost) return;
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0) {
        setProgress((scrolled / height) * 100);
      }
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, [readingPost]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const themeClasses = isDarkMode
    ? "bg-neutral-950 text-neutral-200 selection:bg-white selection:text-black"
    : "bg-white text-neutral-900 selection:bg-black selection:text-white";

  const borderClass = isDarkMode ? "border-neutral-800" : "border-black";
  const mutedText = isDarkMode ? "text-neutral-500" : "text-neutral-400";
  const activeCategoryClass = isDarkMode ? "text-white underline decoration-1 underline-offset-4" : "text-black underline decoration-1 underline-offset-4";

  // Helper to extract headers for TOC
  const getTableOfContents = (content) => {
    return content
      .map((line, index) => {
        if (typeof line !== 'string') return null;
        if (line.startsWith('### ')) return { level: 3, text: line.replace('### ', ''), id: `section-${index}` };
        if (line.startsWith('## ')) return { level: 2, text: line.replace('## ', ''), id: `section-${index}` };
        return null;
      })
      .filter(Boolean);
  };

  const isDocs = readingPost?.category === 'Documentação';
  const tableOfContents = isDocs ? getTableOfContents(readingPost.content) : [];

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = readingPost?.title;
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      toast('Link copiado para a área de transferência!', 'success');
      return;
    }
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`);
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
    }
  };

  const relatedPosts = allPosts.filter(p => p.category === readingPost?.category && p.id !== readingPost?.id).slice(0, 2);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses} ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}>
      {headerAds.map(ad => <AdBlock key={ad.id} code={ad.code} />)}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          user ? <Navigate to="/admin" replace /> : <Login onLoginSuccess={setUser} />
        } />
        
        <Route path="/admin/*" element={
          <AdminRoute user={user}>
            <AdminDashboard user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </AdminRoute>
        } />

        {/* Public Routes */}
        <Route path="/" element={
          <>
            {/* Reading Progress Bar */}
            {readingPost && (
              <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
                <div
                  className={`h-full transition-all duration-150 ${isDarkMode ? 'bg-white' : 'bg-black'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Navigation */}
            <nav className={`border-b ${borderClass} sticky top-0 z-50 backdrop-blur-md transition-transform duration-500 ${isDarkMode ? 'bg-neutral-950/90' : 'bg-white/90'} ${isFocusMode && readingPost ? '-translate-y-full' : 'translate-y-0'}`}>
              <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                <h1
                  className="text-xl font-black tracking-tighter uppercase cursor-pointer"
                  onClick={() => { setReadingPost(null); setIsFocusMode(false); }}
                >
                  MENS<span className={isDarkMode ? "text-neutral-700" : "text-neutral-300"}>LOG</span>
                </h1>

                <div className="flex items-center space-x-1 md:space-x-4">
                  {!readingPost && (
                    <>
                      <button onClick={() => setShowSearch(!showSearch)} className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-neutral-200 dark:bg-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}>
                        <Search size={16} />
                      </button>
                      <button onClick={() => setShowAbout(true)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
                        <BookOpen size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={toggleTheme} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  {readingPost && (
                    <>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-neutral-200 dark:bg-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => { setIsFocusMode(!isFocusMode); setShowSettings(false); }}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                      >
                        {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Category Bar (Only visible on Home) */}
              {!readingPost && !showSearch && (
                <div className={`px-4 md:px-6 overflow-x-auto no-scrollbar border-t ${borderClass}`}>
                  <div className="max-w-4xl mx-auto flex space-x-4 md:space-x-6 py-3 min-w-max">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCurrentCategory(cat)}
                        className={`text-[10px] uppercase tracking-widest font-bold hover:scale-105 active:scale-95 transition-all py-1 px-1 ${currentCategory === cat ? activeCategoryClass : mutedText}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Bar */}
              {showSearch && !readingPost && (
                <div className={`px-4 md:px-6 py-3 border-t ${borderClass} animate-in fade-in slide-in-from-top-2 bg-neutral-100 dark:bg-neutral-900`}>
                  <div className="max-w-4xl mx-auto relative flex items-center">
                    <Search className="absolute left-3 text-neutral-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar artigos por título ou resumo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm focus:outline-none placeholder:text-neutral-500`}
                      autoFocus
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {/* Settings Panel */}
            {showSettings && readingPost && (
              <>
                {/* Backdrop for mobile */}
                <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setShowSettings(false)} />
                <div className={`fixed inset-x-0 bottom-0 md:bottom-auto md:inset-x-auto md:top-20 md:right-6 z-50 p-6 border-t md:border ${borderClass} ${isDarkMode ? 'bg-neutral-900 shadow-white/5' : 'bg-white shadow-xl'} animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-200 w-full md:w-64 rounded-t-2xl md:rounded-xl max-h-[70vh] md:max-h-none overflow-y-auto`}>
                  {/* Mobile drag handle */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full md:hidden" />
                  <div className="space-y-6 text-xs font-sans font-bold uppercase tracking-widest pt-2 md:pt-0">
                    <div>
                      <p className={`mb-3 ${mutedText}`}>Fonte</p>
                      <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded">
                        <button onClick={() => setFontFamily('serif')} className={`flex-1 py-2.5 md:py-1.5 rounded transition-all ${fontFamily === 'serif' ? (isDarkMode ? 'bg-neutral-700 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'}`}>Serif</button>
                        <button onClick={() => setFontFamily('sans')} className={`flex-1 py-2.5 md:py-1.5 rounded transition-all ${fontFamily === 'sans' ? (isDarkMode ? 'bg-neutral-700 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'}`}>Sans</button>
                      </div>
                    </div>
                    <div>
                      <p className={`mb-3 ${mutedText}`}>Tamanho ({fontSize}px)</p>
                      <div className="flex items-center justify-between gap-4 px-2">
                        <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="text-sm p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded">A-</button>
                        <input
                          type="range" min="16" max="32" value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                        />
                        <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="text-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded">A+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 transition-all duration-700 ${isFocusMode ? 'pt-16 md:pt-24' : 'pt-8 md:pt-12'}`}>
              {!readingPost ? (
                /* Post List */
                <div className="animate-in fade-in duration-700 max-w-2xl mx-auto">
                  <header className="mb-12 md:mb-20 pt-6 md:pt-10">
                    <p className={`text-[10px] uppercase tracking-[0.4em] font-bold ${mutedText} mb-3 md:mb-4`}>
                      {currentCategory === 'Todos' ? siteConfig.siteSubtitle : 'EXPLORAR'}
                    </p>
                    <h2 className={`text-3xl sm:text-5xl md:text-7xl font-black leading-none tracking-tighter ${currentCategory === 'Todos' ? 'mb-8 md:mb-12' : ''}`}>
                      {currentCategory === 'Todos' ? siteConfig.siteTitle : currentCategory.toUpperCase() + "."}
                    </h2>
                    
                    {/* Stoic Quote of the Day */}
                    {currentCategory === 'Todos' && !searchTerm && (
                      <div className="max-w-xl border-l-4 border-neutral-900 dark:border-white pl-4 py-1 animate-in fade-in duration-1000">
                        <p className={`italic text-lg md:text-xl font-serif ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-2`}>
                          "{getDailyQuote().text}"
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                          — {getDailyQuote().author}
                        </p>
                      </div>
                    )}
                  </header>

                  <div className="space-y-12 md:space-y-20">
                    {displayPosts.length > 0 ? displayPosts.map(post => (
                      <article key={post.id} className="group cursor-pointer" onClick={() => { setReadingPost(post); window.scrollTo(0, 0); }}>
                        <div className={`flex items-center gap-3 md:gap-4 mb-2 md:mb-3 text-[10px] font-sans font-bold uppercase tracking-widest ${mutedText}`}>
                          <span>{post.category}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 md:mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">
                          {post.title}
                        </h3>
                        <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {post.excerpt}
                        </p>
                        <div className={`mt-3 md:mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Ler Artigo <ArrowRight size={12} />
                        </div>
                      </article>
                    )) : (
                      <div className={`py-20 text-center ${mutedText}`}>
                        <p>Nenhum artigo encontrado nesta categoria.</p>
                      </div>
                    )}
                  </div>

                  {hasMorePosts && displayPosts.length > 0 && !searchTerm && (
                    <div className="mt-12 md:mt-20 text-center">
                      <button 
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className={`w-full md:w-auto px-8 py-3.5 md:py-3 border ${borderClass} text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.98] transition-all ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoadingMore ? 'Carregando...' : 'Carregar Mais'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Reader View */
                <div className={`animate-in fade-in duration-500 ${isDocs ? 'grid lg:grid-cols-[240px_1fr] gap-12 items-start' : 'max-w-2xl mx-auto'}`}>

                  {/* Sidebar TOC for Docs */}
                  {isDocs && !isFocusMode && (
                    <aside className="hidden lg:block sticky top-32 space-y-8">
                      <div>
                        <p className={`mb-4 text-[10px] uppercase tracking-widest font-bold ${mutedText}`}>Nesta página</p>
                        <ul className="space-y-3">
                          {tableOfContents.map((header, i) => (
                            <li key={i} className={header.level === 3 ? 'pl-4 border-l-2 border-neutral-200 dark:border-neutral-800' : ''}>
                              <a
                                href={`#${header.id}`}
                                className={`text-xs font-medium hover:underline opacity-60 hover:opacity-100 transition-opacity ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}
                              >
                                {header.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => { setReadingPost(null); setIsFocusMode(false); setShowSettings(false); }}
                        className={`flex items-center font-sans text-[10px] uppercase tracking-widest font-bold ${mutedText} hover:text-current transition-colors`}
                      >
                        <ChevronRight size={14} className="rotate-180 mr-1" /> Voltar
                      </button>
                    </aside>
                  )}

                  <div className={!isDocs ? '' : 'min-w-0'}>
                    {!isFocusMode && !isDocs && (
                      <button
                        onClick={() => { setReadingPost(null); setIsFocusMode(false); setShowSettings(false); }}
                        className={`mb-12 flex items-center font-sans text-[10px] uppercase tracking-widest font-bold ${mutedText} hover:text-current transition-colors`}
                      >
                        <ChevronRight size={14} className="rotate-180 mr-1" /> Voltar
                      </button>
                    )}

                    <article>
                      <header className="mb-10 md:mb-16">
                        <div className={`font-sans text-[10px] uppercase tracking-[0.2em] font-bold mb-3 md:mb-4 ${mutedText}`}>
                          {readingPost.category} • {readingPost.date} • {readingPost.readTime}
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-6 md:mb-8">
                          {readingPost.title}
                        </h2>
                        <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
                      </header>

                      {postTopAds.map(ad => <AdBlock key={ad.id} code={ad.code} />)}

                      <div
                        className={`max-w-prose mx-auto transition-all duration-300 leading-[1.8] space-y-8`}
                        style={{
                          fontSize: `${fontSize}px`,
                          color: isDarkMode ? '#e5e5e5' : '#171717'
                        }}
                      >
                        {readingPost.content.map((paragraph, index) => {
                          // Header (H2)
                          if (paragraph.startsWith('## ')) {
                            const headerText = paragraph.replace('## ', '');
                            return (
                              <h2
                                key={index}
                                id={`section-${index}`}
                                className="text-2xl font-bold mt-12 mb-6 tracking-tight scroll-mt-32"
                              >
                                {headerText}
                              </h2>
                            );
                          }

                          // Subheader (H3)
                          if (paragraph.startsWith('### ')) {
                            const headerText = paragraph.replace('### ', '');
                            return (
                              <h3
                                key={index}
                                id={`section-${index}`}
                                className="text-xl font-bold mt-8 mb-4 tracking-tight scroll-mt-32 text-neutral-800 dark:text-neutral-200"
                              >
                                {headerText}
                              </h3>
                            );
                          }

                          // Code Block Rendering
                          if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
                            const match = paragraph.match(/^```.*\n([\s\S]*)\n```$/);
                            const codeContent = match ? match[1] : paragraph.replace(/```/g, '').trim();
                            
                            return (
                              <div key={index} className="relative group my-8">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(codeContent);
                                    toast('Código copiado!', 'success');
                                  }}
                                  className="absolute top-3 right-3 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                                  title="Copiar código"
                                >
                                  <Copy size={14} />
                                </button>
                                <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-xl overflow-x-auto font-mono text-sm shadow-lg border border-neutral-800">
                                  <code>{codeContent}</code>
                                </pre>
                              </div>
                            );
                          }

                          // Image Rendering ![Alt](URL)
                          const imgMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
                          if (imgMatch) {
                            return (
                              <figure key={index} className="my-8">
                                <img
                                  src={imgMatch[2]}
                                  alt={imgMatch[1]}
                                  className="w-full rounded-xl shadow-lg"
                                  loading="lazy"
                                />
                                {imgMatch[1] && <figcaption className={`text-center text-xs mt-2 ${mutedText}`}>{imgMatch[1]}</figcaption>}
                              </figure>
                            );
                          }

                          // File Download Rendering [Text](URL)
                          const linkMatch = paragraph.match(/^\[(.*?)\]\((.*?)\)$/);
                          if (linkMatch) {
                            return (
                              <div key={index} className="my-6">
                                <a
                                  href={linkMatch[2]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-3 px-6 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:opacity-80 transition-opacity group"
                                >
                                  <div className="bg-white dark:bg-neutral-700 p-2 rounded-lg">
                                    <UploadCloud className="text-black dark:text-white" size={20} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Download</div>
                                    <div className="font-bold text-sm text-black dark:text-white group-hover:underline">{linkMatch[1]}</div>
                                  </div>
                                </a>
                              </div>
                            );
                          }

                          // Blockquote Rendering > text
                          if (paragraph.startsWith('> ')) {
                            return (
                                <blockquote key={index} className="border-l-4 border-neutral-900 dark:border-white pl-4 md:pl-6 py-1 italic font-serif text-xl md:text-2xl my-8 text-neutral-600 dark:text-neutral-400">
                                  {paragraph.replace('> ', '')}
                                </blockquote>
                            );
                          }

                          // List Rendering - item
                          if (paragraph.startsWith('- ')) {
                            return (
                                <ul key={index} className="list-disc pl-6 mb-6">
                                  <li className="pl-2">{paragraph.replace('- ', '')}</li>
                                </ul>
                            );
                          }

                          return (
                            <p key={index} className="mb-6 last:mb-0">
                              {paragraph}
                            </p>
                          );
                        })}


                      </div>

                      {postBottomAds.map(ad => <AdBlock key={ad.id} code={ad.code} />)}
                    </article>

                    <footer className={`mt-16 md:mt-32 pt-10 md:pt-16 border-t ${borderClass} flex flex-col items-center gap-8 md:gap-12 text-center`}>
                      <div className="space-y-4">
                        <BookOpen size={20} className="mx-auto opacity-20" />
                        {footerAds.map(ad => <AdBlock key={ad.id} code={ad.code} />)}
                      </div>

                      {/* Share Buttons */}
                      <div className="w-full max-w-sm">
                        <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedText} mb-4`}>Compartilhar Conhecimento</p>
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleShare('whatsapp')} className="p-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full transition-colors" title="WhatsApp">
                            <MessageCircle size={20} />
                          </button>
                          <button onClick={() => handleShare('x')} className="p-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white rounded-full transition-colors" title="X / Twitter">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.936H5.059z"></path></svg>
                          </button>
                          <button onClick={() => handleShare('copy')} className="p-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white rounded-full transition-colors" title="Copiar Link">
                            <Link2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Related Posts */}
                      {relatedPosts.length > 0 && (
                        <div className="w-full text-left mt-4">
                          <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border-b ${borderClass} pb-2 ${mutedText}`}>Leia Também</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedPosts.map(post => (
                              <div key={post.id} onClick={() => { setReadingPost(post); window.scrollTo(0,0); }} className="cursor-pointer group p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                <h4 className="font-bold text-sm mb-2 group-hover:underline line-clamp-2">{post.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-60">
                                  <Clock size={12} /> {post.readTime}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => { setReadingPost(null); window.scrollTo(0, 0); }}
                        className={`w-full md:w-auto px-10 py-4 border ${borderClass} text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.98] transition-all mt-4`}
                      >
                        Concluir Leitura
                      </button>
                    </footer>
                  </div>
                </div>
              )}
            </main>

            {/* Floating Info / Footer */}
            {!readingPost && (
              <footer className={`py-8 md:py-12 text-center border-t ${borderClass} mt-12 md:mt-20 px-4`}>
                {footerAds.map(ad => <AdBlock key={ad.id} code={ad.code} />)}
                <p className={`text-[10px] uppercase tracking-widest font-bold ${mutedText}`}>
                  © 2026 MensLog • Estoicismo Moderno
                </p>
              </footer>
            )}

            {/* Floating Exit Focus Mode Button */}
            {isFocusMode && readingPost && (
              <button
                onClick={() => setIsFocusMode(false)}
                className={`fixed bottom-8 right-8 p-3 rounded-full border ${borderClass} ${isDarkMode ? 'bg-neutral-900/50 text-white' : 'bg-white/50 text-black'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 opacity-30 hover:opacity-100 active:scale-95 z-[70]`}
                title="Sair do Modo Foco"
              >
                <Minimize2 size={20} />
              </button>
            )}

            {/* About Modal */}
            {showAbout && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
                <div className={`relative ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-lg border ${borderClass} animate-in zoom-in-95 fade-in duration-200 overflow-hidden`}>
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase">Menslog</h2>
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${mutedText}`}>O Caminho do Homem</p>
                      </div>
                      <button onClick={() => setShowAbout(false)} className="p-2 -mr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-4 text-sm leading-relaxed mb-8">
                      <p>
                        O <strong>Menslog</strong> é um espaço dedicado ao desenvolvimento pessoal, estoicismo e disciplina para o homem contemporâneo.
                      </p>
                      <p>
                        Acreditamos que a força mental, a clareza de propósito e o foco naquilo que podemos controlar são os pilares para uma vida bem vivida, independente das circunstâncias externas.
                      </p>
                      <p>
                        Nosso objetivo é compilar o conhecimento prático e filosófico que ajuda homens a construírem resiliência, liderança e valores inabaláveis.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAbout(false)}
                      className={`w-full py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} rounded-lg`}
                    >
                      Continuar Lendo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
