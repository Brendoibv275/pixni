'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { getSlide } from '@/data/slidesDeck';
import { Loader2, MessageCircleQuestion, X } from 'lucide-react';

import { PollActiveState } from '@/components/mobile/PollActiveState';
import { BrokenTelephoneState } from '@/components/mobile/BrokenTelephoneState';
import { AiPromptBuilderState } from '@/components/mobile/AiPromptBuilderState';
import { EndSessionState } from '@/components/mobile/EndSessionState';
import { FloatingQA } from '@/components/mobile/FloatingQA';

function LookAtScreenState({ title, icon, color }: { title: string, icon: string, color: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-in fade-in duration-500 px-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-${color}-500/10 border border-${color}-500/30 mb-4 animate-bounce`}>
                <span className="text-5xl">{icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">Olhe para o Telão!</h2>
            <p className="text-slate-400 max-w-sm leading-relaxed text-base">
                O professor está demonstrando <span className={`text-${color}-400 font-bold`}>{title}</span> ao vivo.
            </p>
        </div>
    );
}

function SlideContentState({ slideIndex }: { slideIndex: number }) {
    const slide = getSlide(slideIndex);

    return (
        <div className={`my-auto w-full text-center rounded-[2.5rem] p-8 mt-4 mb-4 shadow-2xl relative overflow-hidden backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center
            ${slide.phase === 'Introdução' ? 'bg-indigo-950/40 shadow-[0_0_50px_rgba(99,102,241,0.2)]' :
                slide.phase === 'Módulo 1' ? 'bg-violet-950/40 shadow-[0_0_50px_rgba(139,92,246,0.2)]' :
                    slide.phase === 'Módulo 2' ? 'bg-purple-950/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]' :
                        slide.phase === 'Fechamento' ? 'bg-emerald-950/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]' :
                            'bg-slate-900/40 shadow-[0_0_50px_rgba(71,85,105,0.2)]'
            }
        `}>
            {/* Brilho sutíl de fundo simulando refração de vidro */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-30 pointer-events-none translate-x-1/4 -translate-y-1/4
                ${slide.phase === 'Introdução' ? 'bg-indigo-500' :
                    slide.phase === 'Módulo 1' ? 'bg-violet-500' :
                        slide.phase === 'Módulo 2' ? 'bg-purple-500' :
                            slide.phase === 'Fechamento' ? 'bg-emerald-500' :
                                'bg-blue-500'
                }
            `}></div>

            <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center animate-in slide-in-from-bottom-6 fade-in duration-700 zoom-in-95">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner backdrop-blur-md">
                    <span className="text-5xl drop-shadow-lg">{slide.icon || '👀'}</span>
                </div>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-6 leading-tight tracking-tight drop-shadow-sm">
                    {slide.title}
                </h2>

                <p className="text-[1.1rem] text-slate-300 leading-relaxed mb-10 font-medium">
                    {slide.content}
                </p>

                {slide.bullets && (
                    <ul className="text-left space-y-4 w-full flex flex-col gap-2">
                        {slide.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-center gap-4 text-slate-200 text-sm bg-slate-950/60 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-lg">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner
                                    ${slide.phase === 'Introdução' ? 'bg-indigo-500/20 text-indigo-400' :
                                        slide.phase === 'Módulo 1' ? 'bg-violet-500/20 text-violet-400' :
                                            slide.phase === 'Módulo 2' ? 'bg-purple-500/20 text-purple-400' :
                                                slide.phase === 'Fechamento' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                    }
                                `}>
                                    <span className="font-black text-base drop-shadow-md">✦</span>
                                </div>
                                <span className="leading-snug font-semibold">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function PlayRoom({ params }: { params: Promise<{ pin: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [participantName, setParticipantName] = useState<string>('');

    const [isQaOpen, setIsQaOpen] = useState(false);

    const { session, loading, error } = useSession(sessionId);

    useEffect(() => {
        const savedSessionId = localStorage.getItem('pixni_session_id');
        const savedParticipantId = localStorage.getItem('pixni_participant_id');
        const savedName = localStorage.getItem('pixni_participant_name');

        if (!savedSessionId || !savedParticipantId || !savedName) {
            router.push('/');
            return;
        }

        setSessionId(savedSessionId);
        setParticipantId(savedParticipantId);
        setParticipantName(savedName);
    }, [router]);

    if (loading || !sessionId) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p>Sincronizando com o telão...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-6 text-center">
                <p className="mb-4">Erro ao sincronizar sala: {error || 'Sessão encerrada ou não encontrada'}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-slate-800 rounded-lg text-white"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    const renderCurrentState = () => {
        switch (session.current_state) {
            case 'SLIDE_CONTENT':
                return <SlideContentState slideIndex={session.current_slide_index} />;
            case 'POLL_ACTIVE':
                return <PollActiveState sessionId={sessionId!} participantId={participantId!} currentSlideIndex={session.current_slide_index} />;
            case 'BROKEN_TELEPHONE':
                return <BrokenTelephoneState sessionId={sessionId!} participantId={participantId!} />;
            case 'AI_PROMPT_BUILDER':
                return <AiPromptBuilderState sessionId={sessionId!} participantId={participantId!} />;
            case 'END_SESSION':
                return <EndSessionState sessionId={sessionId!} participantId={participantId!} participantName={participantName} />;
            case 'RAG_VISUALIZER':
                return <LookAtScreenState title="A Mágica do RAG" icon="📚" color="cyan" />;
            case 'AGENT_SIMULATOR':
                return <LookAtScreenState title="O Funcionário Digital" icon="🤖" color="rose" />;
            default:
                return <SlideContentState slideIndex={session.current_slide_index} />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col pt-safe px-4 pb-safe relative overflow-x-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 bg-slate-950 pointer-events-none fixed">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-violet-600/10 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="flex items-center justify-between py-4 border-b border-slate-800/50 mb-4 z-10 w-full">
                <div>
                    <span className="text-blue-500 font-bold tracking-tight text-xl">PIXNI</span>
                    <span className="text-white font-light text-xl"> I.Academy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-slate-400">Ao Vivo</span>
                </div>
            </header>

            {/* State Machine Render */}
            <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 pt-4 pb-20">
                {renderCurrentState()}
            </main>

            {/* FAB Q&A */}
            {session.current_state !== 'END_SESSION' && (
                <button
                    onClick={() => setIsQaOpen(true)}
                    className="fixed bottom-12 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all z-40 border border-blue-400/20"
                    aria-label="Fazer uma pergunta"
                >
                    <MessageCircleQuestion className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Q&A Modal */}
            {isQaOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md relative">
                        <button onClick={() => setIsQaOpen(false)} className="absolute -top-12 right-0 p-2 text-white bg-slate-800 rounded-full z-[70]"><X className="w-5 h-5" /></button>
                        <FloatingQA sessionId={sessionId!} participantId={participantId!} onClose={() => setIsQaOpen(false)} />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full p-2 bg-slate-950/80 backdrop-blur-md border-t border-slate-900 flex justify-between px-6 text-[10px] text-slate-500 uppercase tracking-widest z-40">
                <span>{participantName}</span>
                <span>SALA: {resolvedParams.pin}</span>
            </div>
        </div>
    );
}
