'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { TOTAL_SLIDES, getSlide, getSlideState } from '@/data/slidesDeck';
import {
    ChevronLeft,
    ChevronRight,
    MonitorPlay,
    BarChart3,
    Zap,
    MousePointerClick,
    BookOpen,
    Bot,
    LogOut,
    Loader2,
    MessageSquare,
    Users,
} from 'lucide-react';
import { Database } from '@/types/supabase';
import { QABoard } from '@/components/admin/QABoard';
import { ParticipantsList } from '@/components/admin/ParticipantsList';

type SessionState = Database['public']['Tables']['sessions']['Row']['current_state'];

export default function AdminMobilePage({ params }: { params: Promise<{ session_id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { session, loading, error, updateSessionState } = useSession(resolvedParams.session_id);

    const [activeTab, setActiveTab] = useState<'control' | 'qa' | 'users'>('control');
    const [isNavigating, setIsNavigating] = useState(false);

    const handleNextSlide = async () => {
        if (!session || isNavigating) return;
        setIsNavigating(true);
        const nextIndex = Math.min(session.current_slide_index + 1, TOTAL_SLIDES - 1);
        await updateSessionState({
            current_slide_index: nextIndex,
            current_state: getSlideState(nextIndex) as SessionState,
        });
        setIsNavigating(false);
    };

    const handlePrevSlide = async () => {
        if (!session || isNavigating) return;
        setIsNavigating(true);
        const prevIndex = Math.max(session.current_slide_index - 1, 0);
        await updateSessionState({
            current_slide_index: prevIndex,
            current_state: getSlideState(prevIndex) as SessionState,
        });
        setIsNavigating(false);
    };

    const forceState = async (state: SessionState) => {
        if (!session || isNavigating) return;
        setIsNavigating(true);
        await updateSessionState({ current_state: state });
        setIsNavigating(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                <p className="font-medium animate-pulse tracking-widest uppercase text-sm">Carregando painel...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-6 text-center">
                <p className="mb-4">Sessão não encontrada ou acesso negado.</p>
                <button onClick={() => router.push('/')} className="px-6 py-2 bg-slate-800 rounded-xl text-white">
                    Voltar
                </button>
            </div>
        );
    }

    const currentSlide = getSlide(session.current_slide_index);
    const isFirst = session.current_slide_index === 0;
    const isLast = session.current_slide_index >= TOTAL_SLIDES - 1;

    const stateBadgeColor: Record<SessionState, string> = {
        SLIDE_CONTENT: 'bg-slate-700 text-slate-200',
        POLL_ACTIVE: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        BROKEN_TELEPHONE: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        AI_PROMPT_BUILDER: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        RAG_VISUALIZER: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        AGENT_SIMULATOR: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        END_SESSION: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-indigo-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/10 blur-[80px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <div>
                    <span className="text-indigo-400 font-black tracking-tight text-xl">PIXNI</span>
                    <span className="text-white font-light text-xl"> Admin</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-mono bg-indigo-500/10 text-indigo-300 py-1 px-3 rounded-lg border border-indigo-500/20 text-sm font-bold shadow-inner">
                        {session.pin}
                    </span>
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                        aria-label="Sair"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Bottom nav */}
            <nav className="fixed bottom-0 left-0 w-full z-30 bg-slate-950/95 backdrop-blur-md border-t border-white/5 flex">
                {[
                    { id: 'control', label: 'Controle', icon: MonitorPlay },
                    { id: 'qa', label: 'Q&A', icon: MessageSquare },
                    { id: 'users', label: 'Alunos', icon: Users },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id as any)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors
                            ${activeTab === id ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </button>
                ))}
            </nav>

            {/* Main content */}
            <main className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-4 max-w-lg mx-auto w-full">

                {/* Horizontal Slide Quick Navigation */}
                {activeTab === 'control' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x">
                        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => {
                            const slide = getSlide(i);
                            const isActive = session.current_slide_index === i;
                            return (
                                <button
                                    key={i}
                                    onClick={async () => {
                                        if (isNavigating) return;
                                        setIsNavigating(true);
                                        await updateSessionState({
                                            current_slide_index: i,
                                            current_state: getSlideState(i) as SessionState,
                                        });
                                        setIsNavigating(false);
                                    }}
                                    className={`snap-center flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-xl border transition-all
                                        ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                >
                                    <span className="text-[10px] font-black leading-none mb-0.5">{i}</span>
                                    <span className="text-xs leading-none">{slide.icon}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* === CONTROL TAB === */}
                {activeTab === 'control' && (
                    <>
                        {/* Current slide info */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/8 rounded-3xl p-5 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Slide Atual</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${stateBadgeColor[session.current_state]}`}>
                                    {session.current_state.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-1">
                                <span className="text-5xl font-black text-white font-mono leading-none">
                                    {session.current_slide_index}
                                </span>
                                <div>
                                    <p className="text-2xl font-black leading-tight text-white">{currentSlide.icon}</p>
                                    <p className="text-slate-400 text-xs">{currentSlide.phase}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm font-semibold leading-snug mt-1">{currentSlide.title}</p>
                            <p className="text-xs text-slate-500 mt-1">de {TOTAL_SLIDES - 1} slides</p>
                        </div>

                        {/* Notes */}
                        {currentSlide.notes && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-amber-200/80 text-sm leading-relaxed">
                                <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-bold block mb-1.5">📝 Notas do Apresentador</span>
                                {currentSlide.notes}
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handlePrevSlide}
                                disabled={isFirst || isNavigating}
                                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 shadow-lg text-lg"
                            >
                                {isNavigating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronLeft className="w-6 h-6" />}
                                Anterior
                            </button>
                            <button
                                onClick={handleNextSlide}
                                disabled={isLast || isNavigating}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 border border-indigo-400/20 text-lg"
                            >
                                Próximo
                                {isNavigating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Quick trigger buttons */}
                        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-4 shadow-inner">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Gatilhos Rápidos</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => forceState('SLIDE_CONTENT')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-white/5 disabled:opacity-40">
                                    <MonitorPlay className="w-4 h-4 text-slate-400 shrink-0" /> Slide Passivo
                                </button>
                                <button onClick={() => forceState('POLL_ACTIVE')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-blue-500/20 disabled:opacity-40">
                                    <BarChart3 className="w-4 h-4 shrink-0" /> Ativar Quiz
                                </button>
                                <button onClick={() => forceState('BROKEN_TELEPHONE')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-orange-500/20 disabled:opacity-40">
                                    <Zap className="w-4 h-4 shrink-0" /> Tel. sem Fio
                                </button>
                                <button onClick={() => forceState('AI_PROMPT_BUILDER')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-purple-500/20 disabled:opacity-40">
                                    <MousePointerClick className="w-4 h-4 shrink-0" /> Prompt Builder
                                </button>
                                <button onClick={() => forceState('RAG_VISUALIZER')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-cyan-500/20 disabled:opacity-40">
                                    <BookOpen className="w-4 h-4 shrink-0" /> Vis. RAG
                                </button>
                                <button onClick={() => forceState('AGENT_SIMULATOR')} disabled={isNavigating}
                                    className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 p-3 rounded-xl transition-all active:scale-95 text-xs font-semibold border border-rose-500/20 disabled:opacity-40">
                                    <Bot className="w-4 h-4 shrink-0" /> Sim. Agente
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* === Q&A TAB === */}
                {activeTab === 'qa' && (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-xl">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-400" /> Perguntas da Plateia
                        </h2>
                        <QABoard sessionId={session.id} />
                    </div>
                )}

                {/* === USERS TAB === */}
                {activeTab === 'users' && (
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" /> Alunos
                            </h2>
                            <button
                                onClick={async () => {
                                    if (!confirm('Reenviar e-mails pendentes agora?')) return;
                                    try {
                                        const res = await fetch('/api/admin/resend-pending', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ sessionId: session.id })
                                        });
                                        const data = await res.json();
                                        if (res.ok && data.details) {
                                            alert(`Resumo enviado para ${data.details.filter((r: any) => r.status === 'success').length} alunos!`);
                                        } else {
                                            alert('Erro: ' + (data.error || 'Falha ao processar'));
                                        }
                                    } catch (err: any) {
                                        alert('Erro de rede: ' + err.message);
                                    }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                            >
                                Reenviar Dossiês
                            </button>
                        </div>
                        <ParticipantsList sessionId={session.id} />
                    </div>
                )}

            </main>
        </div>
    );
}
