'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface IceBreakerDashboardProps {
    sessionId: string;
}

// Helper: parse options de JSON string ou array
function parseOptions(raw: any): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
    return [];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function IceBreakerDashboard({ sessionId }: IceBreakerDashboardProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [answersMap, setAnswersMap] = useState<Record<string, any[]>>({});
    const [totalParticipants, setTotalParticipants] = useState(0);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadQuestions();

        // Polling a cada 3s para atualizar respostas
        pollRef.current = setInterval(loadAnswers, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [sessionId]);

    const loadQuestions = async () => {
        const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('slide_index', 1)
            .order('created_at', { ascending: true });

        if (data && data.length > 0) {
            setQuestions(data as any);
            loadAnswers(data as any);
        }
    };

    const loadAnswers = async (qs?: any[]) => {
        const questionsList = qs || questions;
        if (questionsList.length === 0) return;

        const newMap: Record<string, any[]> = {};

        for (const q of questionsList) {
            const { data } = await supabase
                .from('answers')
                .select('answer_text, participant_id')
                .eq('question_id', q.id)
                .eq('session_id', sessionId);

            newMap[q.id] = data || [];
        }

        setAnswersMap(newMap);

        // Conta participantes únicos
        const uniqueIds = new Set<string>();
        Object.values(newMap).forEach(arr => arr.forEach(a => uniqueIds.add(a.participant_id)));
        setTotalParticipants(uniqueIds.size);
    };

    if (questions.length === 0) {
        return <div className="text-slate-500 text-center p-12 animate-pulse">Carregando perguntas do quebra-gelo...</div>;
    }

    // Renderiza diferentes visualizações para cada tipo de pergunta
    const renderQuestion = (q: any, index: number) => {
        const answers = answersMap[q.id] || [];
        const isMultiChoice = q.question_type === 'MULTIPLE_CHOICE';

        if (isMultiChoice) {
            return renderBarChart(q, answers, index);
        } else {
            return renderTextCloud(q, answers, index);
        }
    };

    const renderBarChart = (q: any, answers: any[], index: number) => {
        const options = parseOptions(q.options);
        const counts: Record<string, number> = {};
        options.forEach(opt => counts[opt] = 0);
        answers.forEach(a => {
            if (counts[a.answer_text] !== undefined) counts[a.answer_text]++;
        });

        const data = options.map((opt, i) => ({
            name: String.fromCharCode(65 + i),
            label: opt.length > 25 ? opt.substring(0, 25) + '…' : opt,
            fullLabel: opt,
            value: counts[opt],
            color: COLORS[i % COLORS.length]
        }));

        return (
            <div key={q.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

                <h4 className="text-white font-black text-lg mb-2 leading-snug drop-shadow-sm">{q.question_text}</h4>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <span className="bg-slate-950/50 border border-white/5 px-3 py-1 rounded-full text-slate-300 text-xs font-mono shadow-inner">{answers.length} respostas</span>
                </div>

                <div className="flex-1 min-h-[160px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: -10, right: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} width={30} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                content={({ active, payload }) => {
                                    if (active && payload?.[0]) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-slate-900/90 backdrop-blur-md p-3 border border-white/10 rounded-xl shadow-2xl text-xs max-w-[200px]">
                                                <p className="text-white font-bold mb-2">{d.fullLabel}</p>
                                                <p className="text-emerald-400 font-black text-2xl drop-shadow-sm">{d.value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                                {data.map((entry, i) => <Cell key={i} fill={entry.value > 0 ? entry.color : '#0f172a'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mini legend */}
                <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                    {data.map((d, i) => (
                        <span key={i} className="text-[10px] text-slate-300 bg-slate-950/60 border border-white/5 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span className="font-bold mr-1" style={{ color: d.color }}>{d.name}</span> {d.label}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const renderTextCloud = (q: any, answers: any[], index: number) => {
        // Detecção super inteligente: se 80% das respostas forem puramente números, consideramos como "Gráfico de Níveis"
        const isNumericAnswers = answers.length > 0 &&
            answers.filter(a => !isNaN(Number(a.answer_text.trim()))).length >= answers.length * 0.8;

        const isLevelQuestion = q.question_text.toLowerCase().includes('0 a 10') ||
            q.question_text.toLowerCase().includes('nível') ||
            isNumericAnswers;

        if (isLevelQuestion && answers.length > 0) {
            // Parse numbers and compute distribution
            const levels: Record<string, number> = {};
            for (let i = 0; i <= 10; i++) levels[String(i)] = 0;

            let validNumbers = 0;
            let sum = 0;

            answers.forEach(a => {
                const numStr = a.answer_text.replace(/[^0-9]/g, '');
                if (numStr !== '') {
                    let num = parseInt(numStr);
                    if (num > 10) num = 10;
                    if (num >= 0 && num <= 10) {
                        if (levels[String(num)] !== undefined) levels[String(num)]++;
                        sum += num;
                        validNumbers++;
                    }
                }
            });

            const data = Object.entries(levels).map(([level, count]) => ({
                name: level,
                value: count,
                color: count > 0 ? '#8b5cf6' : '#1e293b' // Violet theme to match keynote
            }));

            const avg = validNumbers > 0 ? (sum / validNumbers).toFixed(1) : '—';

            return (
                <div key={q.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                    {/* Glow background */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

                    <h4 className="text-white font-black text-lg mb-2 leading-snug drop-shadow-sm">{q.question_text}</h4>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-slate-950/50 border border-white/5 px-3 py-1 rounded-full text-slate-300 text-xs font-mono shadow-inner">{answers.length} respostas</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                            <span className="text-violet-300 font-bold bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-sm shadow-inner">
                                Média: <span className="text-white ml-1">{avg}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[160px] relative z-10 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload?.[0]) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900/90 backdrop-blur-md p-3 border border-white/10 rounded-xl shadow-2xl text-center">
                                                    <p className="text-slate-400 font-medium text-xs uppercase mb-1">Nível {d.name}</p>
                                                    <p className="text-violet-400 font-black text-xl">{d.value} pessoas</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28} animationDuration={1000}>
                                    {data.map((entry, i) => (
                                        <Cell key={i} fill={entry.value > 0 ? '#8b5cf6' : '#0f172a'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        // Para expectativas / objetivos: mostra como cards divididos visualmente bonitos ("Objetivos escritos")
        return (
            <div key={q.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

                <h4 className="text-white font-black text-lg mb-2 leading-snug drop-shadow-sm">{q.question_text}</h4>
                <div className="flex items-center gap-4 mb-6">
                    <span className="bg-slate-950/50 border border-white/5 px-3 py-1 rounded-full text-slate-300 text-xs font-mono shadow-inner">{answers.length} respostas</span>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    {answers.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <span className="text-3xl block mb-3 opacity-50">🎯</span>
                            <span className="font-medium text-sm">Aguardando objetivos...</span>
                        </div>
                    ) : (
                        answers.map((a, i) => (
                            <div key={i} className="bg-slate-950/60 backdrop-blur-sm border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all rounded-2xl p-4 text-slate-200 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-start gap-4 shadow-lg group/item">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                                    <span className="text-indigo-400 font-black">✦</span>
                                </div>
                                <span className="leading-relaxed font-medium mt-1">{a.answer_text}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col relative z-20">
            {/* Header com estilo Premium */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-inner">
                        <span className="text-2xl drop-shadow-md">🎯</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-sm mb-1">Mapeamento da Turma</h3>
                        <p className="text-slate-400 font-medium tracking-wide">Resultados ao vivo do Quebra-Gelo</p>
                    </div>
                </div>

                <div className="bg-slate-950/60 backdrop-blur-xl border border-emerald-500/30 px-6 py-3 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 min-w-[140px] group hover:scale-105 transition-transform">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-500 font-mono drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all">
                        {totalParticipants}
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-emerald-500/80 font-bold mt-1">participantes</span>
                </div>
            </div>

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                {questions.map((q, i) => renderQuestion(q, i))}
            </div>
        </div>
    );
}
