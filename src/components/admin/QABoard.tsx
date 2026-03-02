'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface QABoardProps {
    sessionId: string;
}

export function QABoard({ sessionId }: QABoardProps) {
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        let subscription: any;

        const loadQuestions = async () => {
            const fetchQa = async () => {
                const { data } = await supabase
                    .from('qa_messages')
                    .select('*, participants(name)')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: false });

                setQuestions(data || []);
            };

            await fetchQa();

            subscription = supabase
                .channel(`qa_session_${sessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Insert or Update (is_resolved)
                        schema: 'public',
                        table: 'qa_messages',
                        filter: `session_id=eq.${sessionId}`
                    },
                    () => {
                        fetchQa();
                    }
                )
                .subscribe();
        };

        loadQuestions();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [sessionId]);

    const toggleResolve = async (qaId: string, currentState: boolean) => {
        await supabase
            .from('qa_messages')
            // @ts-ignore - Supabase type inference is too strict here (never array bug)
            .update({ is_resolved: !currentState })
            .eq('id', qaId);
    };

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400 border-2 border-slate-700/50 border-dashed rounded-[2.5rem] min-h-[50vh] bg-slate-900/30 backdrop-blur-sm mt-8">
                <MessageSquare className="w-20 h-20 mb-6 text-indigo-500/50" />
                <h3 className="text-2xl font-bold text-white mb-3">Nenhuma Dúvida Ainda</h3>
                <p className="text-lg">O botão flutuante dos alunos está vazio. Quando alguém perguntar, aparecerá aqui.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-h-[70vh] overflow-y-auto pb-10 custom-scrollbar px-4 pt-4">
            {questions.map((q) => (
                <div
                    key={q.id}
                    className={`border rounded-[2rem] p-8 shadow-xl transition-all flex flex-col backdrop-blur-md ${q.is_resolved
                        ? 'bg-slate-950/60 border-white/5 opacity-70 grayscale-[50%]'
                        : 'bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1'
                        }`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <span className={`font-bold px-4 py-1.5 rounded-full text-xs shadow-inner border ${q.is_resolved ? 'bg-slate-900/80 text-slate-500 border-white/5' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                            {q.participants?.name || 'Aluno'}
                        </span>

                        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
                            <span className="text-slate-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <p className={`font-medium text-lg leading-relaxed flex-1 mb-6 ${q.is_resolved ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                        {q.message}
                    </p>

                    <button
                        onClick={() => toggleResolve(q.id, q.is_resolved)}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.98] ${q.is_resolved
                            ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50'
                            }`}
                    >
                        <CheckCircle className={`w-5 h-5 ${q.is_resolved ? '' : 'animate-pulse'}`} />
                        {q.is_resolved ? 'Reabrir Dúvida' : 'Marcar como Respondida'}
                    </button>
                </div>
            ))}
        </div>
    );
}
