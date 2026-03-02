'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { SLIDES_DECK, TOTAL_SLIDES, getSlide, getSlideState } from '@/data/slidesDeck';
import { QRCodeSVG } from 'qrcode.react';
import {
    MonitorPlay,
    BarChart3,
    Users,
    MessageSquare,
    MousePointerClick,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    StickyNote,
    QrCode,
    Home,
    Projector,
    Zap
} from 'lucide-react';
import { Database } from '@/types/supabase';
import { LivePollResults } from '@/components/admin/LivePollResults';
import { BrokenTelephoneBoard } from '@/components/admin/BrokenTelephoneBoard';
import { QABoard } from '@/components/admin/QABoard';
import { ParticipantsList } from '@/components/admin/ParticipantsList';
import { IceBreakerDashboard } from '@/components/admin/IceBreakerDashboard';
import { RagVisualizer } from '@/components/admin/RagVisualizer';
import { AgentSimulator } from '@/components/admin/AgentSimulator';

type SessionState = Database['public']['Tables']['sessions']['Row']['current_state'];

export default function AdminDashboard({ params }: { params: Promise<{ session_id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { session, loading, error, updateSessionState } = useSession(resolvedParams.session_id);

    const [activeTab, setActiveTab] = useState<'control' | 'qa' | 'users'>('control');
    const [showNotes, setShowNotes] = useState(true);

    const handleNextSlide = async () => {
        if (!session) return;
        const nextIndex = Math.min(session.current_slide_index + 1, TOTAL_SLIDES - 1);
        const newState = getSlideState(nextIndex) as SessionState;

        await updateSessionState({
            current_slide_index: nextIndex,
            current_state: newState
        });
    };

    const handlePrevSlide = async () => {
        if (!session) return;
        const prevIndex = Math.max(session.current_slide_index - 1, 0);
        const newState = getSlideState(prevIndex) as SessionState;

        await updateSessionState({
            current_slide_index: prevIndex,
            current_state: newState
        });
    };

    const forceState = async (state: SessionState) => {
        await updateSessionState({ current_state: state });
    };

    if (loading) return <div className="text-white p-10 font-bold animate-pulse">Acessando Dashboard...</div>;
    if (error || !session) return <div className="text-red-500 p-10 font-bold">Erro de permissão ou Sessão inexistente.</div>;

    const currentSlide = getSlide(session.current_slide_index);

    // URL para QR Code (Apontando para a nova rota /join que criaremos)
    const joinUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/join?room=${session.id}&pin=${session.pin}`
        : '';

    const isLobby = session.current_slide_index === 0 && session.current_state === 'SLIDE_CONTENT';

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-300">

            {/* SIDEBAR */}
            <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-xl shadow-slate-900/50 shrink-0">

                {/* Header Sidebar */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                        <MonitorPlay className="w-6 h-6" />
                        <h2 className="font-bold tracking-widest uppercase">Admin Station</h2>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-4">
                        <span className="text-slate-500 font-medium">SALA ATIVA</span>
                        <span className="font-mono bg-indigo-500/10 text-indigo-300 py-1 px-3 rounded-md border border-indigo-500/20 shadow-inner">
                            {session.pin}
                        </span>
                    </div>
                </div>

                {/* Status Broadcast */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                            <Home className="w-4 h-4" /> Home
                        </button>
                        <button
                            onClick={() => window.open(`/admin/${session.id}/presentation`, '_blank')}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-900/20"
                        >
                            <Projector className="w-4 h-4" /> Telão
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-400">Transmissão WebSocket</span>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center shadow-inner">
                        <span className="text-xs uppercase tracking-widest text-slate-500 mb-1 block">Estado Atual</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                            {session.current_state}
                        </span>
                    </div>

                    {/* Fase da aula */}
                    {currentSlide.phase && (
                        <div className="mt-3 text-center">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500">Fase: </span>
                            <span className="text-xs text-indigo-400 font-semibold">{currentSlide.phase}</span>
                        </div>
                    )}
                </div>

                {/* Master Navigation (Slides) */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <span className="text-xs uppercase tracking-widest text-slate-500 mb-4 block font-bold">Navegação da Aula</span>

                    <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-2xl p-2 mb-6 shadow-inner">
                        <button
                            onClick={handlePrevSlide}
                            disabled={session.current_slide_index === 0}
                            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-semibold mb-1">Slide Atual</span>
                            <span className="text-3xl font-bold text-white font-mono">{session.current_slide_index}</span>
                            <span className="text-xs text-slate-500">de {TOTAL_SLIDES - 1}</span>
                        </div>
                        <button
                            onClick={handleNextSlide}
                            disabled={session.current_slide_index >= TOTAL_SLIDES - 1}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 rounded-xl text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Presenter Notes Toggle */}
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors border text-sm font-medium mb-2 ${showNotes ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 'hover:bg-slate-800 border-transparent hover:border-slate-700 text-slate-400'}`}
                    >
                        <StickyNote className="w-4 h-4" />
                        <span>{showNotes ? 'Notas Visíveis' : 'Mostrar Notas'}</span>
                    </button>

                    {/* Notas do apresentador */}
                    {showNotes && currentSlide.notes && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 text-amber-200/80 text-xs leading-relaxed">
                            <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-bold block mb-2">📝 Notas</span>
                            {currentSlide.notes}
                        </div>
                    )}

                    {/* Overrides Manuais */}
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-widest text-slate-500 mb-2 block font-bold mt-4">Gatilhos Manuais</span>

                        <button onClick={() => forceState('SLIDE_CONTENT')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 text-sm font-medium">
                            <MonitorPlay className="w-4 h-4 text-slate-400" />
                            <span>Voltar p/ Slide Passivo</span>
                        </button>

                        <button onClick={() => forceState('POLL_ACTIVE')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-blue-900/30 text-blue-400 transition-colors border border-transparent hover:border-blue-900/50 text-sm font-medium">
                            <BarChart3 className="w-4 h-4" />
                            <span>Ativar Quiz / Enquete</span>
                        </button>

                        <button onClick={() => forceState('BROKEN_TELEPHONE')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-orange-900/30 text-orange-400 transition-colors border border-transparent hover:border-orange-900/50 text-sm font-medium">
                            <Zap className="w-4 h-4" />
                            <span>Telefone sem Fio</span>
                        </button>

                        <button onClick={() => forceState('AI_PROMPT_BUILDER')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-purple-900/30 text-purple-400 transition-colors border border-transparent hover:border-purple-900/50 text-sm font-medium">
                            <MousePointerClick className="w-4 h-4" />
                            <span>Construtor de Prompt IA</span>
                        </button>

                        <button onClick={() => forceState('RAG_VISUALIZER')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-cyan-900/30 text-cyan-400 transition-colors border border-transparent hover:border-cyan-900/50 text-sm font-medium">
                            <span className="w-4 h-4 text-center leading-none">📚</span>
                            <span>Visualizador RAG</span>
                        </button>

                        <button onClick={() => forceState('AGENT_SIMULATOR')} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-rose-900/30 text-rose-400 transition-colors border border-transparent hover:border-rose-900/50 text-sm font-medium">
                            <span className="w-4 h-4 text-center leading-none">🤖</span>
                            <span>Simulador de Agente</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN VIEW */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button onClick={() => setActiveTab('control')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'control' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}>
                            <MonitorPlay className="w-4 h-4" /> Telão
                        </button>
                        <button onClick={() => setActiveTab('qa')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'qa' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}>
                            <MessageSquare className="w-4 h-4" /> Q&A
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}>
                            <Users className="w-4 h-4" /> Alunos
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500 font-mono">{currentSlide.icon} {currentSlide.title}</span>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-slate-950">
                    {/* Glowing Orbs behind the content to make Glassmorphism pop! */}
                    <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

                    <div className="relative z-10 max-w-6xl mx-auto min-h-full flex flex-col py-8 w-full">

                        {/* SLIDE_CONTENT */}
                        {activeTab === 'control' && session.current_state === 'SLIDE_CONTENT' && (
                            isLobby ? (
                                // DESIGN ESPECÍFICO PARA O LOBBY (Slide 0)
                                <div className="my-auto flex items-center justify-between gap-12 bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/30 rounded-[3rem] p-16 shadow-[0_0_80px_rgba(99,102,241,0.15)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
                                    <div className="flex-1 relative z-10">
                                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-black tracking-widest uppercase mb-10 shadow-inner">
                                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                            AULA AO VIVO
                                        </div>
                                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 mb-8 leading-[1.15] tracking-tight drop-shadow-sm">
                                            {currentSlide.title}
                                        </h1>
                                        <p className="text-3xl text-slate-300 mb-14 font-medium leading-relaxed max-w-2xl">
                                            {currentSlide.content}
                                        </p>

                                        <div className="bg-slate-950/80 border border-slate-700/50 rounded-[2rem] p-8 inline-block shadow-2xl backdrop-blur-md">
                                            <p className="text-slate-400 text-sm uppercase tracking-widest font-black flex items-center gap-3 mb-4">
                                                <QrCode className="w-5 h-5 text-indigo-400" /> Ou acesse pelo link:
                                            </p>
                                            <div className="flex items-center gap-6">
                                                <span className="text-2xl text-white font-medium">pixacademy.netlify.app</span>
                                                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-mono text-3xl font-black tracking-widest shadow-lg shadow-indigo-500/40 border border-indigo-400/30">
                                                    {session.pin}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-center relative z-10">
                                        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] ring-8 ring-white/5 mb-8 transform hover:scale-105 transition-transform duration-500">
                                            <QRCodeSVG
                                                value={joinUrl}
                                                size={340}
                                                bgColor="#ffffff"
                                                fgColor="#0f172a"
                                                level="Q"
                                                marginSize={1}
                                            />
                                        </div>
                                        <p className="text-indigo-300 font-bold text-lg flex items-center gap-3 uppercase tracking-widest">
                                            <span className="animate-bounce text-2xl">↑</span> Aponte a câmera
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // DESIGN NORMAL DOS SLIDES (PREMIUM 2 COLUNAS)
                                <div className={`my-auto w-full rounded-[3.5rem] backdrop-blur-2xl border p-12 lg:p-16 shadow-2xl relative overflow-hidden transition-all duration-700
                                    ${currentSlide.phase === 'Introdução' ? 'bg-indigo-950/30 border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/10' :
                                        currentSlide.phase === 'Módulo 1' ? 'bg-violet-950/30 border-violet-500/20 shadow-[0_0_80px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/10' :
                                            currentSlide.phase === 'Módulo 2' ? 'bg-purple-950/30 border-purple-500/20 shadow-[0_0_80px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/10' :
                                                currentSlide.phase === 'Fechamento' ? 'bg-emerald-950/30 border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10' :
                                                    'bg-slate-900/40 border-slate-500/20 shadow-[0_0_80px_rgba(71,85,105,0.15)] ring-1 ring-white/5'
                                    }
                                `}>
                                    {/* Glass reflection */}
                                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent pointer-events-none translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"></div>

                                    <div className="relative z-10 w-full flex flex-col lg:flex-row gap-16 lg:gap-24 items-center justify-between animate-in fade-in zoom-in-[0.98] duration-1000">

                                        {/* Coluna Esquerda: Título e Conteúdo Principal */}
                                        <div className={`flex-1 flex flex-col ${!currentSlide.bullets ? 'items-center text-center max-w-4xl mx-auto' : 'items-start text-left shrink-0 max-w-xl'}`}>
                                            <div className={`w-32 h-32 bg-slate-900/50 border border-white/10 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner backdrop-blur-md relative overflow-hidden group`}>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <span className="text-7xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-500">{currentSlide.icon}</span>
                                            </div>

                                            <h2 className="text-5xl lg:text-[4rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 mb-8 leading-[1.1] tracking-tight drop-shadow-sm">
                                                {currentSlide.title}
                                            </h2>

                                            <p className={`text-2xl text-slate-300 leading-relaxed font-medium ${!currentSlide.bullets ? 'text-center' : ''}`}>
                                                {currentSlide.content}
                                            </p>
                                        </div>

                                        {/* Coluna Direita: Bullets em cards flutuantes */}
                                        {currentSlide.bullets && (
                                            <div className="flex-1 w-full space-y-5">
                                                {currentSlide.bullets.map((bullet, i) => (
                                                    <div key={i} className="flex items-center gap-6 text-slate-200 text-xl bg-slate-950/60 hover:bg-slate-900/90 backdrop-blur-2xl p-7 rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 group">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                                                            ${currentSlide.phase === 'Introdução' ? 'bg-indigo-500/20 text-indigo-400' :
                                                                currentSlide.phase === 'Módulo 1' ? 'bg-violet-500/20 text-violet-400' :
                                                                    currentSlide.phase === 'Módulo 2' ? 'bg-purple-500/20 text-purple-400' :
                                                                        currentSlide.phase === 'Fechamento' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                            'bg-blue-500/20 text-blue-400'
                                                            }
                                                        `}>
                                                            <span className="font-black text-2xl drop-shadow-md transition-transform group-hover:rotate-12">✦</span>
                                                        </div>
                                                        <span className="leading-snug font-semibold">{bullet}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}

                        {/* POLL_ACTIVE: Ice-breaker (slide 1) ou quiz normal */}
                        {activeTab === 'control' && session.current_state === 'POLL_ACTIVE' && session.current_slide_index === 1 && (
                            <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 shadow-2xl min-h-[600px]">
                                <IceBreakerDashboard sessionId={session.id} />
                            </div>
                        )}
                        {activeTab === 'control' && session.current_state === 'POLL_ACTIVE' && session.current_slide_index !== 1 && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl min-h-[600px]">
                                <LivePollResults sessionId={session.id} slideIndex={session.current_slide_index} />
                            </div>
                        )}

                        {/* BROKEN_TELEPHONE */}
                        {activeTab === 'control' && session.current_state === 'BROKEN_TELEPHONE' && (
                            <div className="bg-slate-900 border border-orange-500/20 rounded-3xl p-8 shadow-2xl shadow-orange-900/10">
                                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-4">
                                    <Zap className="text-orange-500 w-8 h-8" />
                                    Telefone sem Fio
                                </h2>
                                <p className="text-slate-400 mb-8 border-b border-slate-800 pb-6">
                                    Exibindo os piores prompts cadastrados pela audiência ao vivo.
                                </p>
                                <BrokenTelephoneBoard sessionId={session.id} />
                            </div>
                        )}

                        {/* AI_PROMPT_BUILDER (Admin view) */}
                        {activeTab === 'control' && session.current_state === 'AI_PROMPT_BUILDER' && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center rounded-3xl bg-gradient-to-br from-purple-950/50 to-slate-900/50 backdrop-blur-md border border-purple-500/20 p-12">
                                <span className="text-6xl mb-8">🤖</span>
                                <h2 className="text-4xl font-bold text-white mb-4">Construtor de Prompt com IA</h2>
                                <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-6">
                                    Os alunos estão preenchendo o formulário de 3 passos no celular. O Gemini gerará um prompt personalizado para cada um.
                                </p>
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 max-w-md">
                                    <p className="text-purple-300 text-sm">Acompanhe as respostas ao vivo no painel de Q&A ou aguarde a conclusão.</p>
                                </div>
                            </div>
                        )}

                        {/* RAG_VISUALIZER (Admin view) */}
                        {activeTab === 'control' && session.current_state === 'RAG_VISUALIZER' && (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 my-auto">
                                <RagVisualizer />
                            </div>
                        )}

                        {/* AGENT_SIMULATOR (Admin view) */}
                        {activeTab === 'control' && session.current_state === 'AGENT_SIMULATOR' && (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 my-auto">
                                <AgentSimulator />
                            </div>
                        )}

                        {/* END_SESSION (Admin view) */}
                        {activeTab === 'control' && session.current_state === 'END_SESSION' && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center rounded-3xl bg-gradient-to-br from-emerald-950/50 to-slate-900/50 backdrop-blur-md border border-emerald-500/20 p-12">
                                <span className="text-6xl mb-8">🎓</span>
                                <h2 className="text-4xl font-bold text-white mb-4">Sessão Encerrada!</h2>
                                <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                                    Os alunos estão gerando e baixando o dossiê PDF nos celulares.
                                </p>
                            </div>
                        )}

                        {/* Q&A Tab */}
                        {activeTab === 'qa' && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                                    <MessageSquare className="text-indigo-500 w-8 h-8" />
                                    Perguntas da Plateia (Q&A)
                                </h2>
                                <QABoard sessionId={session.id} />
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                                    <Users className="text-indigo-500 w-8 h-8" />
                                    Alunos Conectados
                                </h2>
                                <ParticipantsList sessionId={session.id} />
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
