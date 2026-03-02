'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Send, AlertTriangle } from 'lucide-react';

interface BrokenTelephoneProps {
    sessionId: string;
    participantId: string;
}

export function BrokenTelephoneState({ sessionId, participantId }: BrokenTelephoneProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Busca a pergunta do tipo BROKEN_TELEPHONE (sem .single() pra evitar 406)
            let questionId: string | null = null;

            const { data: btQuestions } = await supabase
                .from('questions')
                .select('id')
                .eq('question_type', 'BROKEN_TELEPHONE')
                .limit(1) as any;

            if (btQuestions && btQuestions.length > 0) {
                questionId = btQuestions[0].id;
            } else {
                // Fallback: busca qualquer OPEN_TEXT
                const { data: otQuestions } = await supabase
                    .from('questions')
                    .select('id')
                    .eq('question_type', 'OPEN_TEXT')
                    .limit(1) as any;

                if (otQuestions && otQuestions.length > 0) {
                    questionId = otQuestions[0].id;
                }
            }

            if (!questionId) {
                setError('Sem pergunta configurada para esta dinâmica.');
                setLoading(false);
                return;
            }

            const { error: submitError } = await supabase
                .from('answers')
                .insert({
                    session_id: sessionId,
                    participant_id: participantId,
                    question_id: questionId,
                    answer_text: prompt.trim()
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
            setError('Erro ao enviar o prompt. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-xl font-bold text-white">Prontinho!</h2>
                <p className="text-slate-400 max-w-xs">
                    Seu prompt "ruim" foi enviado. Vamos ver qual ficou mais absurdo no telão!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Telefone Sem Fio</h2>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    <strong className="text-orange-400">Cenário:</strong> Um gerente quer usar IA para analisar Notas Fiscais automaticamente.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                    Sua missão: crie o <strong className="text-orange-400">PIOR PROMPT POSSÍVEL</strong> para essa tarefa! Pense como alguém que nunca viu IA na vida.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Escreva seu pior prompt aqui... quanto mais vago e confuso, melhor!"
                    className="flex-1 w-full bg-slate-900 border border-slate-700/50 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-[200px]"
                    required
                />

                {error && (
                    <div className="text-red-400 text-xs text-center">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="animate-pulse">Enviando ruindade...</span>
                    ) : (
                        <>
                            Enviar Aberração
                            <Send className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
