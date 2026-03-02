'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LivePollResultsProps {
    sessionId: string;
    slideIndex: number;
}

export function LivePollResults({ sessionId, slideIndex }: LivePollResultsProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [activeQIndex, setActiveQIndex] = useState(0);
    const [chartData, setChartData] = useState<{ name: string, value: number, color: string, label: string }[]>([]);
    const [totalAnswers, setTotalAnswers] = useState(0);
    const [openTextAnswers, setOpenTextAnswers] = useState<any[]>([]);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    useEffect(() => {
        loadQuestions();
    }, [sessionId, slideIndex]);

    useEffect(() => {
        if (questions.length === 0) return;

        let subscription: any;
        let pollTimer: NodeJS.Timeout | null = null;

        const question = questions[activeQIndex];
        if (!question) return;

        const fetchAndProcess = async () => {
            const { data: answers } = await supabase
                .from('answers')
                .select('answer_text')
                .eq('question_id', question.id)
                .eq('session_id', sessionId);

            processAnswers(answers || [], question);
        };

        fetchAndProcess();

        // Realtime Subscribe
        subscription = supabase
            .channel(`poll_results_${question.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'answers',
                    filter: `question_id=eq.${question.id}`
                },
                () => { fetchAndProcess(); }
            )
            .subscribe();

        // Polling fallback (3s) – garante que resultados apareçam mesmo sem Realtime
        pollTimer = setInterval(fetchAndProcess, 3000);

        return () => {
            if (subscription) supabase.removeChannel(subscription);
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [questions, activeQIndex, sessionId]);

    const loadQuestions = async () => {
        const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('slide_index', slideIndex)
            .order('created_at', { ascending: true });

        if (data && data.length > 0) {
            setQuestions(data);
            setActiveQIndex(0);
        }
    };

    const processAnswers = (answers: any[], question: any) => {
        setTotalAnswers(answers.length);

        if (question.question_type === 'MULTIPLE_CHOICE' && question.options) {
            let options: string[] = [];
            const raw = question.options;
            if (Array.isArray(raw)) options = raw;
            else if (typeof raw === 'string') { try { options = JSON.parse(raw); } catch { options = []; } }

            const counts: Record<string, number> = {};
            options.forEach(opt => counts[opt] = 0);

            answers.forEach(a => {
                if (counts[a.answer_text] !== undefined) {
                    counts[a.answer_text]++;
                }
            });

            const formatted = options.map((opt, i) => ({
                name: String.fromCharCode(65 + i),
                label: opt,
                value: counts[opt],
                color: colors[i % colors.length]
            }));

            setChartData(formatted);
            setOpenTextAnswers([]);
        } else {
            // Text answers
            setChartData([]);
            setOpenTextAnswers(answers.map(a => a.answer_text));
        }
    };

    if (questions.length === 0) {
        return <div className="text-slate-500 animate-pulse text-center p-12">Procurando quiz ativo neste slide...</div>;
    }

    const question = questions[activeQIndex];

    return (
        <div className="w-full h-full flex flex-col">
            {/* Question selector (tabs) */}
            {questions.length > 1 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                    {questions.map((q, i) => (
                        <button
                            key={q.id}
                            onClick={() => setActiveQIndex(i)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === activeQIndex
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            P{i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Question text + vote count */}
            <div className="flex justify-between items-start mb-8 px-4 bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                <div className="flex-1 pr-8">
                    <h3 className="text-3xl text-white font-extrabold leading-tight tracking-tight shadow-sm">
                        {question.question_text}
                    </h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/80 border border-emerald-500/30 px-6 py-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] shrink-0 min-w-[140px] backdrop-blur-sm">
                    <span className="text-5xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-md">
                        {totalAnswers}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold mt-2">
                        {question.question_type === 'MULTIPLE_CHOICE' ? 'VOTOS TOTAIS' : 'RESPOSTAS'}
                    </span>
                </div>
            </div>

            {/* Chart (multiple choice) or Text list (open text) */}
            {question.question_type === 'MULTIPLE_CHOICE' ? (
                <>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 16, fontWeight: 'bold' }} width={40} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-800 p-4 border border-slate-700 rounded-2xl shadow-2xl max-w-[250px]">
                                                    <p className="text-white font-bold text-sm mb-2">{data.label}</p>
                                                    <p className="text-blue-400 font-black text-xl">{data.value} votos</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40} animationDuration={1000}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                        {chartData.map((entry, index) => (
                            <div key={index} className="flex flex-col items-start p-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner backdrop-blur-sm">
                                <span className="text-sm font-black font-mono px-3 py-1 rounded-lg mb-3 text-white shadow-md" style={{ backgroundColor: entry.color, boxShadow: `0 4px 14px 0 ${entry.color}40` }}>
                                    Opção {entry.name}
                                </span>
                                <span className="text-slate-300 text-sm line-clamp-2 leading-relaxed font-medium">{entry.label}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-4 custom-scrollbar">
                    {openTextAnswers.length === 0 ? (
                        <div className="text-center text-slate-500 p-16 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/20 backdrop-blur-sm">
                            <span className="text-5xl mb-6 block opacity-50">💬</span>
                            <p className="text-lg font-medium">Aguardando respostas dos alunos...</p>
                        </div>
                    ) : (
                        openTextAnswers.map((text, i) => (
                            <div key={i} className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 text-slate-200 text-base animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-lg backdrop-blur-md">
                                <span className="inline-block px-2 py-1 bg-slate-800 rounded-md text-slate-400 text-xs font-mono font-bold mr-3 border border-slate-700">#{i + 1}</span>
                                <span className="leading-relaxed">{text}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
