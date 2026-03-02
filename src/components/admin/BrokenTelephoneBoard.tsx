'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface BrokenTelephoneBoardProps {
    sessionId: string;
}

export function BrokenTelephoneBoard({ sessionId }: BrokenTelephoneBoardProps) {
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const loadBoard = async () => {
            setLoading(true);

            // 1. Busca pergunta da dinâmica BROKEN_TELEPHONE
            let questionId: string | null = null;

            const { data: btData } = await supabase
                .from('questions')
                .select('id')
                .eq('question_type', 'BROKEN_TELEPHONE')
                .limit(1) as any;

            if (btData && btData.length > 0) {
                questionId = btData[0].id;
            } else {
                // Fallback para OPEN_TEXT
                const { data: fallback } = await supabase
                    .from('questions')
                    .select('id')
                    .eq('question_type', 'OPEN_TEXT')
                    .limit(1) as any;
                if (fallback && fallback.length > 0) questionId = fallback[0].id;
            }

            if (!questionId) return;

            // 2. Busca o que já escreveram
            const fetchAnswers = async () => {
                const { data } = await supabase
                    .from('answers')
                    .select('*, participants(name)')
                    .eq('question_id', questionId as string)
                    .eq('session_id', sessionId)
                    .order('answered_at', { ascending: false });

                setAnswers(data || []);
            };

            await fetchAnswers();
            setLoading(false);

            // 3. Ouve novas atrocidades ao vivo
            subscription = supabase
                .channel(`broken_telephone_${questionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'answers',
                        filter: `question_id=eq.${questionId}`
                    },
                    (payload) => {
                        fetchAnswers();
                    }
                )
                .subscribe();
        };

        loadBoard();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [sessionId]);

    if (loading) return <div className="animate-pulse text-slate-500 font-bold p-10 text-center">Buscando as piores criações...</div>;

    if (answers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400 border-2 border-slate-700/50 border-dashed rounded-[2.5rem] min-h-[400px] bg-slate-900/30 backdrop-blur-sm">
                <AlertTriangle className="w-20 h-20 text-orange-500/50 mb-8" />
                <h3 className="text-2xl font-bold text-white mb-3">Aguardando os Prompts</h3>
                <p className="text-lg">Ninguém enviou um prompt ainda. Pressionem a plateia!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max px-4 max-h-[600px] overflow-y-auto pb-10 custom-scrollbar">
            {answers.map((answer, i) => (
                <div
                    key={answer.id}
                    className={`bg-slate-950/40 backdrop-blur-md border ${i === 0 ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20' : 'border-white/5'} rounded-[2rem] p-8 transition-all hover:scale-[1.02] shadow-inner flex flex-col`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="bg-slate-900/80 text-slate-300 text-xs font-bold px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
                            {answer.participants?.name || 'Anônimo'}
                        </span>

                        {i === 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full shadow-inner animate-pulse">
                                <Zap className="w-3.5 h-3.5 fill-orange-400" /> Ao Vivo
                            </span>
                        )}
                    </div>

                    <p className="text-slate-100 font-medium text-lg leading-relaxed italic font-serif flex-1">
                        "{answer.answer_text}"
                    </p>
                </div>
            ))}
        </div>
    );
}
