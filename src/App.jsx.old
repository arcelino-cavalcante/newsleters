import React, { useState, useEffect } from 'react';
import {
    Menu, X, ArrowRight, Calendar, ChevronRight,
    Sun, Moon, Maximize2, Minimize2,
    Clock, BookOpen, Settings
} from 'lucide-react';

const App = () => {
    const [currentCategory, setCurrentCategory] = useState('Todos');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [readingPost, setReadingPost] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState(20);
    const [fontFamily, setFontFamily] = useState('serif');
    const [progress, setProgress] = useState(0);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const posts = [
        {
            id: 1,
            date: '29 Jan, 2026',
            category: 'Disciplina',
            readTime: '4 min',
            title: 'A Arquitetura do Silêncio: Como a solidão molda o caráter',
            excerpt: 'No mundo moderno, fugimos do silêncio como se fosse um inimigo. No entanto, é no vazio que as verdades mais cruas emergem.',
            content: [
                "O silêncio não é apenas a ausência de som, é a presença de si mesmo. Para o homem que busca excelência, dominar a capacidade de estar sozinho sem distrações digitais é o primeiro passo para a verdadeira autonomia.",
                "Muitas vezes preenchemos nossos dias com ruído — podcasts, notificações, música — porque temos medo do que o silêncio pode nos dizer. No entanto, os grandes estoicos já pregavam que a cidadela interior só é construída quando paramos de reagir ao mundo externo.",
                "A solidão produtiva não é isolamento social, mas sim a capacidade de processar pensamentos sem a influência imediata de terceiros. Quando você desliga o celular e senta-se em uma sala vazia por 20 minutos, a sua mente começa a 'limpar os filtros'. As primeiras camadas são ansiedades triviais, mas abaixo delas residem as suas ambições mais puras.",
                "Neste artigo, exploramos três exercícios práticos para implementar o silêncio produtivo na sua rotina matinal: a escrita matinal sem pauta, a caminhada sem dispositivos e a meditação de observação de impulsos."
            ]
        },
        {
            id: 2,
            date: '28 Jan, 2026',
            category: 'Filosofia',
            readTime: '3 min',
            title: 'O Mito da Motivação vs. A Realidade do Sistema',
            excerpt: 'Esperar pelo "sentimento certo" para agir é o erro que mantém a maioria dos homens na mediocridade.',
            content: [
                "A motivação é um sentimento fugaz e não confiável. Se você só treina quando está motivado, você não é um atleta, é um entusiasta. O sistema, por outro lado, é o que te carrega quando a vontade falha.",
                "Grandes homens não esperam o sol nascer para sentir vontade de trabalhar; eles trabalham porque é 06:00 e o cronograma exige. O compromisso com o processo é o que separa o amador do profissional.",
                "Construa regras inegociáveis. Se a regra é ler 20 páginas por dia, não importa se você está cansado ou inspirado. O sistema ignora seus sentimentos temporários em favor do seu objetivo de longo prazo."
            ]
        }
    ];

    useEffect(() => {
        const updateProgress = () => {
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

    const themeClasses = isDarkMode
        ? "bg-neutral-950 text-neutral-200 selection:bg-white selection:text-black"
        : "bg-white text-neutral-900 selection:bg-black selection:text-white";

    const borderClass = isDarkMode ? "border-neutral-800" : "border-black";
    const mutedText = isDarkMode ? "text-neutral-500" : "text-neutral-400";

    return (
        <div className={`min-h-screen transition-colors duration-500 ${themeClasses} ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}>

            {/* Barra de Progresso Minimalista */}
            {readingPost && (
                <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
                    <div
                        className={`h-full transition-all duration-150 ${isDarkMode ? 'bg-white' : 'bg-black'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Navegação */}
            <nav className={`border-b ${borderClass} sticky top-0 z-50 backdrop-blur-md transition-transform duration-500 ${isDarkMode ? 'bg-neutral-950/90' : 'bg-white/90'} ${isFocusMode && readingPost ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1
                        className="text-xl font-black tracking-tighter uppercase cursor-pointer"
                        onClick={() => { setReadingPost(null); setIsFocusMode(false); }}
                    >
                        MENS<span className={isDarkMode ? "text-neutral-700" : "text-neutral-300"}>LOG</span>
                    </h1>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={toggleTheme} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        {readingPost && (
                            <>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-neutral-200 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                >
                                    <Settings size={16} />
                                </button>
                                <button
                                    onClick={() => setIsFocusMode(!isFocusMode)}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                >
                                    {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Painel de Controle Kindle-style */}
            {showSettings && readingPost && (
                <div className={`fixed top-20 right-6 z-50 p-6 border ${borderClass} ${isDarkMode ? 'bg-neutral-900 shadow-white/5' : 'bg-white shadow-xl'} animate-in fade-in zoom-in-95 duration-200 w-64`}>
                    <div className="space-y-6 text-xs font-sans font-bold uppercase tracking-widest">
                        <div>
                            <p className={`mb-3 ${mutedText}`}>Fonte</p>
                            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded">
                                <button onClick={() => setFontFamily('serif')} className={`flex-1 py-1.5 rounded ${fontFamily === 'serif' ? (isDarkMode ? 'bg-neutral-700' : 'bg-white') : ''}`}>Serif</button>
                                <button onClick={() => setFontFamily('sans')} className={`flex-1 py-1.5 rounded ${fontFamily === 'sans' ? (isDarkMode ? 'bg-neutral-700' : 'bg-white') : ''}`}>Sans</button>
                            </div>
                        </div>
                        <div>
                            <p className={`mb-3 ${mutedText}`}>Tamanho</p>
                            <div className="flex items-center justify-between gap-4 px-2">
                                <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="text-sm">A</button>
                                <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="text-xl">A</button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(false)}
                            className={`w-full py-2 border ${borderClass} mt-2 hover:invert transition-all`}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            <main className={`max-w-2xl mx-auto px-6 py-12 transition-all duration-700 ${isFocusMode ? 'pt-24' : 'pt-12'}`}>
                {!readingPost ? (
                    /* Lista de Artigos */
                    <div className="animate-in fade-in duration-700">
                        <header className="mb-20">
                            <p className={`text-[10px] uppercase tracking-[0.4em] font-bold ${mutedText} mb-4`}>Filosofia Aplicada</p>
                            <h2 className="text-6xl md:text-7xl font-black leading-none tracking-tighter">O CAMINHO<br />DO HOMEM.</h2>
                        </header>

                        <div className="space-y-20">
                            {posts.map(post => (
                                <article key={post.id} className="group cursor-pointer" onClick={() => { setReadingPost(post); window.scrollTo(0, 0); }}>
                                    <div className={`flex items-center gap-4 mb-3 text-[10px] font-sans font-bold uppercase tracking-widest ${mutedText}`}>
                                        <span>{post.category}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">
                                        {post.title}
                                    </h3>
                                    <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                        {post.excerpt}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Visualização do Artigo (Formatado) */
                    <div className="animate-in fade-in duration-500">
                        {!isFocusMode && (
                            <button
                                onClick={() => { setReadingPost(null); setIsFocusMode(false); setShowSettings(false); }}
                                className={`mb-12 flex items-center font-sans text-[10px] uppercase tracking-widest font-bold ${mutedText} hover:text-current`}
                            >
                                <ChevronRight size={14} className="rotate-180 mr-1" /> Lista de Artigos
                            </button>
                        )}

                        <article>
                            <header className="mb-16">
                                <div className={`font-sans text-[10px] uppercase tracking-[0.2em] font-bold mb-4 ${mutedText}`}>
                                    {readingPost.category} • {readingPost.date} • {readingPost.readTime}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-8">
                                    {readingPost.title}
                                </h2>
                                <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
                            </header>

                            {/* Corpo do Texto Otimizado */}
                            <div
                                className={`max-w-prose mx-auto transition-all duration-300 leading-[1.6] space-y-10`}
                                style={{
                                    fontSize: `${fontSize}px`,
                                    color: isDarkMode ? '#e5e5e5' : '#171717'
                                }}
                            >
                                {readingPost.content.map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className={index === 0 ? "text-xl md:text-2xl font-medium leading-relaxed italic opacity-80 border-l-4 border-current pl-6 mb-12 py-1" : ""}
                                        style={index === 0 ? { fontSize: `${fontSize + 2}px` } : {}}
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </article>

                        <footer className={`mt-32 pt-16 border-t ${borderClass} flex flex-col items-center gap-12 text-center`}>
                            <div className="space-y-4">
                                <BookOpen size={20} className="mx-auto opacity-20" />
                                <p className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold ${mutedText}`}>
                                    Fim do Artigo • MensLog Archive
                                </p>
                            </div>

                            <button
                                onClick={() => { setReadingPost(null); window.scrollTo(0, 0); }}
                                className={`px-10 py-4 border ${borderClass} text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all`}
                            >
                                Concluir Leitura
                            </button>
                        </footer>
                    </div>
                )}
            </main>

            {/* Botão Flutuante de Saída do Modo Foco */}
            {isFocusMode && readingPost && (
                <button
                    onClick={() => setIsFocusMode(false)}
                    className={`fixed bottom-8 right-8 p-4 rounded-full border ${borderClass} ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} shadow-2xl transition-transform active:scale-95`}
                >
                    <Minimize2 size={18} />
                </button>
            )}
        </div>
    );
};

export default App;