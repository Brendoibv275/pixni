'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

type Question = Database['public']['Tables']['questions']['Row'];

// Helper: options pode vir como string JSON ou como array do Supabase
function parseOptions(raw: any): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
}

interface PollActiveProps {
    sessionId: string;
    participantId: string;
    currentSlideIndex: number;
}

export function PollActiveState({ sessionId, participantId, currentSlideIndex }: PollActiveProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [allDone, setAllDone] = useState(false);
    const [openTextAnswer, setOpenTextAnswer] = useState('');
    const [error, setError] = useState('');

    // 1. Busca TODAS as perguntas do slide atual
    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setCurrentQIndex(0);
            setAllDone(false);
            setSubmitted(false);
            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('slide_index', currentSlideIndex)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (!data || data.length === 0) {
                    setError('Nenhuma pergunta neste slide.');
                    setLoading(false);
                    return;
                }

                setQuestions(data as any);
                // Parse opções da primeira pergunta
                setOptions(parseOptions((data[0] as any).options));
            } catch (err: any) {
                console.error('Erro ao buscar perguntas:', err);
                setError('Não foi possível carregar as perguntas.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [currentSlideIndex]);

    // 2. Quando a pergunta muda, verifica se já respondeu e carrega opções
    useEffect(() => {
        if (questions.length === 0) return;
        const question = questions[currentQIndex];
        if (!question) return;

        setSubmitted(false);
        setOpenTextAnswer('');

        // Carrega opções (pode vir como JSON string do banco)
        setOptions(parseOptions((question as any).options));

        // Verifica se já respondeu esta pergunta
        const checkPreviousAnswer = async () => {
            const { count } = await supabase
                .from('answers')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', question.id)
                .eq('participant_id', participantId)
                .eq('session_id', sessionId);

            if (count && count > 0) {
                setSubmitted(true);
            }
        };

        checkPreviousAnswer();
    }, [currentQIndex, questions, participantId, sessionId]);

    const handleSubmit = async (answerPayload: string) => {
        const question = questions[currentQIndex];
        if (!question || submitted || submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const { error: submitError } = await supabase
                .from('answers')
                .insert({
                    session_id: sessionId,
                    question_id: question.id,
                    participant_id: participantId,
                    answer_text: answerPayload
                } as any);

            if (submitError) {
                if (submitError.code === '23505') {
                    setSubmitted(true);
                    return;
                }
                throw submitError;
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError('Falha ao enviar. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            setAllDone(true);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p className="font-medium animate-pulse">Carregando atividade...</p>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                <p>{error}</p>
            </div>
        );
    }

    if (allDone) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500 bg-emerald-950/30 backdrop-blur-xl rounded-[2.5rem] p-8 border border-emerald-500/20 shadow-2xl shadow-emerald-900/20">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Todas Respondidas! 🎉</h2>
                <p className="text-slate-300 max-w-xs text-base leading-relaxed">
                    Você completou todas as <strong className="text-emerald-400">{questions.length}</strong> perguntas. Fique de olho no telão!
                </p>
            </div>
        );
    }

    const question = questions[currentQIndex];
    if (!question) return null;

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Resposta Registrada!</h2>
                <p className="text-slate-400 max-w-xs mb-6 text-sm">
                    Pergunta {currentQIndex + 1} de {questions.length}
                </p>
                {currentQIndex < questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-[0.98]"
                    >
                        Próxima Pergunta
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-[0.98]"
                    >
                        Finalizar Quiz ✓
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Efeito de iluminação no card */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6 relative z-10 w-full">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    Atividade ao Vivo
                </span>
                <span className="text-sm text-slate-400 font-mono font-bold bg-slate-950/50 px-3 py-1 rounded-full border border-white/5">
                    {currentQIndex + 1} / {questions.length}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-950/80 rounded-full mb-8 overflow-hidden border border-white/5 shadow-inner relative z-10">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
                />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 mb-6 text-center shadow-inner">
                    <h2 className="text-xl font-bold text-white leading-tight tracking-tight">
                        {question.question_text}
                    </h2>
                </div>

                <div className="relative z-10 overflow-y-auto pb-6 -mx-2 px-2">
                    {question.question_type === 'MULTIPLE_CHOICE' ? (
                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSubmit(option)}
                                    disabled={submitting}
                                    className="w-full text-left bg-slate-950/60 hover:bg-blue-600/90 hover:shadow-lg hover:shadow-blue-900/20 border border-white/5 hover:border-blue-400/50 text-slate-300 hover:text-white p-5 rounded-[1.5rem] transition-all active:scale-[0.98] group flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/5 flex-shrink-0 flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-100 group-hover:bg-blue-500 group-hover:border-blue-400 transition-colors shadow-inner">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-base font-medium pt-2 leading-tight">{option}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form
                            className="flex flex-col space-y-4 h-full"
                            onSubmit={(e) => { e.preventDefault(); handleSubmit(openTextAnswer); }}
                        >
                            <textarea
                                value={openTextAnswer}
                                onChange={(e) => setOpenTextAnswer(e.target.value)}
                                placeholder="Digite sua resposta aqui..."
                                className="flex-1 w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-inner min-h-[120px]"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting || !openTextAnswer.trim()}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {submitting ? 'Enviando...' : 'Enviar Resposta'}
                            </button>
                        </form>
                    )}
                </div>

                {error && <div className="text-red-400 text-xs text-center mt-2">{error}</div>}
            </div>
        </div>
    );
}
