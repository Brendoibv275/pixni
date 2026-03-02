'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CORRECT_ANSWERS } from '@/data/slidesDeck';
import { Download, Loader2, Trophy, BookOpen, Sparkles, Check } from 'lucide-react';

interface EndSessionProps {
    sessionId: string;
    participantId: string;
    participantName: string;
}

interface QuizResult {
    questionText: string;
    userAnswer: string;
    correctAnswer: string | null;
    isCorrect: boolean;
}

export function EndSessionState({ sessionId, participantId, participantName }: EndSessionProps) {
    const [loading, setLoading] = useState(true);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [participantEmail, setParticipantEmail] = useState('');
    const [acceptedMaterial, setAcceptedMaterial] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadResults();
    }, [sessionId, participantId]);

    const loadResults = async () => {
        try {
            // Busca o e-mail do participante primeiro
            const { data: partData } = await supabase
                .from('participants')
                .select('email')
                .eq('id', participantId)
                .single() as any;
            if (partData?.email) {
                setParticipantEmail(partData.email);
            }

            // Busca todas as respostas do participante nesta sessão
            const { data: answers } = await supabase
                .from('answers')
                .select('*, questions(question_text, question_type, slide_index, options)')
                .eq('session_id', sessionId)
                .eq('participant_id', participantId)
                .order('answered_at', { ascending: true });

            if (!answers || answers.length === 0) {
                setLoading(false);
                return;
            }

            const answersData = answers as any[];

            let correctCount = 0;
            let totalQuiz = 0;
            const results: QuizResult[] = [];

            for (const answer of answersData) {
                const q = (answer as any).questions;
                if (!q) continue;

                // Verifica se é uma questão com resposta correta
                const slideCorrects = CORRECT_ANSWERS[q.slide_index];
                let correctAnswer: string | null = null;
                let isCorrect = false;

                if (slideCorrects && q.question_type === 'MULTIPLE_CHOICE') {
                    // Encontra o índice local da pergunta neste slide
                    const { data: slideQuestions } = await supabase
                        .from('questions')
                        .select('id')
                        .eq('slide_index', q.slide_index)
                        .order('created_at', { ascending: true });

                    if (slideQuestions) {
                        const localIndex = slideQuestions.findIndex((sq: any) => sq.id === answer.question_id);
                        correctAnswer = slideCorrects[localIndex] || null;
                        if (correctAnswer) {
                            totalQuiz++;
                            isCorrect = answer.answer_text === correctAnswer;
                            if (isCorrect) correctCount++;
                        }
                    }
                }

                results.push({
                    questionText: q.question_text,
                    userAnswer: answer.answer_text,
                    correctAnswer,
                    isCorrect
                });
            }

            setQuizResults(results);
            setScore({ correct: correctCount, total: totalQuiz });

            // Busca o prompt gerado (se existir como resposta na sessão)
            // O prompt é salvo pelo endpoint /api/generate-prompt
            const promptKey = `pixni_prompt_${sessionId}_${participantId}`;
            const savedPrompt = localStorage.getItem(promptKey);
            if (savedPrompt) {
                setGeneratedPrompt(savedPrompt);
            }
        } catch (err) {
            console.error('Erro ao carregar resultados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsent = async (choice: boolean) => {
        setSaving(true);
        try {
            // Atualiza o participante no Supabase
            const { error: updateError } = await (supabase.from('participants') as any)
                .update({
                    material: choice,
                    personal_prompt: choice ? generatedPrompt : null
                })
                .eq('id', participantId);

            if (updateError) throw updateError;

            setAcceptedMaterial(choice);
        } catch (err: any) {
            console.error('Erro ao salvar preferência:', err);
            alert('Erro ao salvar sua preferência. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleSendEmail = async () => {
        setDownloading(true);
        try {
            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantName,
                    participantEmail,
                    score,
                    quizResults,
                    generatedPrompt
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao enviar e-mail');
            // alert('Relatório enviado com sucesso!'); // Removido alert para não quebrar o fluxo
        } catch (err: any) {
            console.error('Erro ao enviar e-mail:', err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                <p>Preparando seu dossiê...</p>
            </div>
        );
    }

    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 rounded-3xl p-6 mb-6 text-center">
                <span className="text-5xl mb-3 block">🎓</span>
                <h2 className="text-2xl font-bold text-white mb-1">Missão Cumprida!</h2>
                <p className="text-slate-400 text-sm">Parabéns, {participantName}!</p>
            </div>

            {/* Score Card */}
            {score.total > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 mb-1">Seu Score nos Quizzes</p>
                        <p className="text-3xl font-black text-white font-mono">{score.correct}/{score.total}</p>
                        <p className="text-emerald-400 text-xs font-bold">{percentage}% de acerto</p>
                    </div>
                </div>
            )}

            {/* Consent Question / Success Message */}
            <div className="flex-1 flex flex-col justify-center">
                {acceptedMaterial === null ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">
                            Aceita receber o material via e-mail?
                        </h3>
                        <p className="text-slate-400 text-sm mb-8">
                            Enviaremos seu resumo da avaliação e seu prompt pessoal para <span className="text-emerald-400 font-medium">{participantEmail}</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleConsent(false)}
                                disabled={saving}
                                className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Não
                            </button>
                            <button
                                onClick={() => handleConsent(true)}
                                disabled={saving}
                                className="py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Sim'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                            <Check className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {acceptedMaterial ? 'Tudo pronto!' : 'Obrigado!'}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {acceptedMaterial
                                ? 'Em alguns minutos você receberá o material no seu e-mail.'
                                : 'Suas respostas foram salvas. Obrigado por participar!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
