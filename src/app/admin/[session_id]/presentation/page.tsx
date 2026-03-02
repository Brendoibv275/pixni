'use client';

import { use } from 'react';
import { useSession } from '@/hooks/useSession';
import { getSlide } from '@/data/slidesDeck';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, MonitorPlay, Loader2, Zap } from 'lucide-react';
import { Database } from '@/types/supabase';
import { LivePollResults } from '@/components/admin/LivePollResults';
import { BrokenTelephoneBoard } from '@/components/admin/BrokenTelephoneBoard';
import { IceBreakerDashboard } from '@/components/admin/IceBreakerDashboard';
import { RagVisualizer } from '@/components/admin/RagVisualizer';
import { AgentSimulator } from '@/components/admin/AgentSimulator';

type SessionState = Database['public']['Tables']['sessions']['Row']['current_state'];

// Uma versão refatorada e limpa do AdminDashboard apenas com a renderização principal (sem sidebar)
export default function PresentationView({ params }: { params: Promise<{ session_id: string }> }) {
    const resolvedParams = use(params);
    const { session, loading, error } = useSession(resolvedParams.session_id);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400">
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <p className="text-2xl font-bold animate-pulse tracking-widest uppercase">Carregando Tela de Projeção...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 text-2xl font-bold">
                Erro ao conectar com a sessão do telão.
            </div>
        );
    }

    const currentSlide = getSlide(session.current_slide_index);

    const joinUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/join?room=${session.id}&pin=${session.pin}`
        : '';

    const isLobby = session.current_slide_index === 0 && session.current_state === 'SLIDE_CONTENT';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-300">
            {/* Minimalist Top Bar just to show it's live */}
            <header className="absolute top-0 left-0 right-0 h-16 z-50 px-8 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                    <MonitorPlay className="w-5 h-5 text-indigo-500" />
                    <span className="text-white font-bold tracking-widest uppercase">PIXNI <span className="text-indigo-400 font-light">I.Academy</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">AULA AO VIVO</span>
                    </div>
                </div>
            </header>

            {/* Content Area - Modificado com mais padding de segurança para o Projetor */}
            <div className="flex-1 overflow-y-auto p-20 lg:p-32 2xl:p-48 relative bg-slate-950 pt-28">
                {/* Glowing Orbs behind the content to make Glassmorphism pop! */}
                <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[180px] pointer-events-none mix-blend-screen"></div>

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl 2xl:max-w-7xl mx-auto min-h-full flex flex-col py-8 w-full">
                    {/* SLIDE_CONTENT */}
                    {session.current_state === 'SLIDE_CONTENT' && (
                        isLobby ? (
                            // DESIGN ESPECÍFICO PARA O LOBBY (Slide 0)
                            <div className="my-auto flex items-center justify-between gap-16 bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/30 rounded-[4rem] p-24 shadow-[0_0_100px_rgba(99,102,241,0.15)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
                                <div className="flex-1 relative z-10">
                                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 mb-10 leading-[1.1] tracking-tight drop-shadow-md">
                                        {currentSlide.title}
                                    </h1>
                                    <p className="text-4xl text-slate-300 mb-16 font-medium leading-relaxed max-w-3xl">
                                        {currentSlide.content}
                                    </p>

                                    <div className="bg-slate-950/80 border border-slate-700/50 rounded-[2.5rem] p-10 mt-8 inline-block shadow-2xl backdrop-blur-md">
                                        <p className="text-slate-400 text-lg uppercase tracking-widest font-black flex items-center gap-4 mb-6">
                                            <QrCode className="w-8 h-8 text-indigo-400" /> Ou acesse no navegador:
                                        </p>
                                        <div className="flex items-center gap-8">
                                            <span className="text-4xl text-white font-medium">pixni.app/join</span>
                                            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-xl font-mono text-5xl font-black tracking-widest shadow-lg shadow-indigo-500/40 border border-indigo-400/30">
                                                {session.pin}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 flex flex-col items-center relative z-10">
                                    <div className="bg-white p-10 rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.15)] ring-8 ring-white/10 mb-10">
                                        <QRCodeSVG
                                            value={joinUrl}
                                            size={440}
                                            bgColor="#ffffff"
                                            fgColor="#0f172a"
                                            level="Q"
                                            marginSize={2}
                                        />
                                    </div>
                                    <p className="text-indigo-300 font-bold text-2xl flex items-center gap-4 uppercase tracking-widest">
                                        <span className="animate-bounce text-3xl">↑</span> Aponte a Câmera
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // DESIGN NORMAL DOS SLIDES (PREMIUM 2 COLUNAS) - Ligeiramente mairo que AdminView
                            <div className={`my-auto w-full rounded-[4rem] backdrop-blur-2xl border p-16 lg:p-24 shadow-2xl relative overflow-hidden transition-all duration-700
                                ${currentSlide.phase === 'Introdução' ? 'bg-indigo-950/30 border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/10' :
                                    currentSlide.phase === 'Módulo 1' ? 'bg-violet-950/30 border-violet-500/20 shadow-[0_0_100px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/10' :
                                        currentSlide.phase === 'Módulo 2' ? 'bg-purple-950/30 border-purple-500/20 shadow-[0_0_100px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/10' :
                                            currentSlide.phase === 'Fechamento' ? 'bg-emerald-950/30 border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/10' :
                                                'bg-slate-900/40 border-slate-500/20 shadow-[0_0_100px_rgba(71,85,105,0.2)] ring-1 ring-white/5'
                                }
                            `}>
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-radial from-white/5 to-transparent pointer-events-none translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"></div>

                                <div className="relative z-10 w-full flex flex-col lg:flex-row gap-20 lg:gap-32 items-center justify-between animate-in fade-in zoom-in-[0.98] duration-1000">
                                    <div className={`flex-1 flex flex-col ${!currentSlide.bullets ? 'items-center text-center max-w-5xl mx-auto' : 'items-start text-left shrink-0 max-w-2xl'}`}>
                                        <div className={`w-40 h-40 bg-slate-900/50 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-inner backdrop-blur-md relative overflow-hidden transition-transform duration-500 hover:scale-105`}>
                                            <span className="text-8xl drop-shadow-2xl">{currentSlide.icon}</span>
                                        </div>

                                        <h2 className="text-6xl lg:text-[5rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 mb-10 leading-[1.1] tracking-tight drop-shadow-sm">
                                            {currentSlide.title}
                                        </h2>

                                        <p className={`text-3xl text-slate-300 leading-relaxed font-medium ${!currentSlide.bullets ? 'text-center' : ''}`}>
                                            {currentSlide.content}
                                        </p>
                                    </div>

                                    {currentSlide.bullets && (
                                        <div className="flex-1 w-full space-y-6">
                                            {currentSlide.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-center gap-8 text-slate-200 text-2xl bg-slate-950/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl group">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                                                        ${currentSlide.phase === 'Introdução' ? 'bg-indigo-500/20 text-indigo-400' :
                                                            currentSlide.phase === 'Módulo 1' ? 'bg-violet-500/20 text-violet-400' :
                                                                currentSlide.phase === 'Módulo 2' ? 'bg-purple-500/20 text-purple-400' :
                                                                    currentSlide.phase === 'Fechamento' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                        'bg-blue-500/20 text-blue-400'
                                                        }
                                                    `}>
                                                        <span className="font-black text-3xl drop-shadow-md">✦</span>
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

                    {/* INTERACTIVE STATES */}
                    {session.current_state === 'POLL_ACTIVE' && session.current_slide_index === 1 && (
                        <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-[3rem] p-12 shadow-2xl min-h-[700px]">
                            <IceBreakerDashboard sessionId={session.id} />
                        </div>
                    )}
                    {session.current_state === 'POLL_ACTIVE' && session.current_slide_index !== 1 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl min-h-[700px]">
                            <LivePollResults sessionId={session.id} slideIndex={session.current_slide_index} />
                        </div>
                    )}
                    {session.current_state === 'BROKEN_TELEPHONE' && (
                        <div className="bg-slate-900 border border-orange-500/20 rounded-[3rem] p-12 shadow-2xl shadow-orange-900/10 min-h-[700px]">
                            <h2 className="text-4xl font-bold text-white mb-4 flex items-center gap-6">
                                <Zap className="text-orange-500 w-10 h-10" />
                                Telefone sem Fio
                            </h2>
                            <p className="text-slate-400 text-xl border-b border-slate-800 pb-8 mb-8">
                                A tempestade live dos piores prompts enviados.
                            </p>
                            <BrokenTelephoneBoard sessionId={session.id} />
                        </div>
                    )}
                    {session.current_state === 'AI_PROMPT_BUILDER' && (
                        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center rounded-[4rem] bg-gradient-to-br from-purple-950/50 to-slate-900/50 backdrop-blur-md border border-purple-500/20 p-16">
                            <span className="text-8xl mb-12">🤖</span>
                            <h2 className="text-6xl font-black text-white mb-8">Construtor de Prompt</h2>
                            <p className="text-3xl text-slate-300 max-w-3xl leading-relaxed mb-6">
                                Use o seu celular neste momento para criar um prompt customizado. O Gemini vai ajudar!
                            </p>
                        </div>
                    )}
                    {session.current_state === 'RAG_VISUALIZER' && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 my-auto">
                            <RagVisualizer />
                        </div>
                    )}
                    {session.current_state === 'AGENT_SIMULATOR' && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 my-auto">
                            <AgentSimulator />
                        </div>
                    )}
                    {session.current_state === 'END_SESSION' && (
                        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center rounded-[4rem] bg-gradient-to-br from-emerald-950/50 to-slate-900/50 backdrop-blur-md border border-emerald-500/20 p-16">
                            <span className="text-8xl mb-12">🎓</span>
                            <h2 className="text-6xl font-black text-white mb-8">Sessão Encerrada</h2>
                            <p className="text-3xl text-slate-300 max-w-3xl leading-relaxed">
                                Muito obrigado a todos! Peguem seus dossiês em PDF pelo celular.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
