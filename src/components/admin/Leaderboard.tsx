'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CORRECT_ANSWERS } from '@/data/slidesDeck';
import { Trophy, Medal, Clock, Loader2 } from 'lucide-react';

interface LeaderboardProps {
    sessionId: string;
}

interface PlayerScore {
    id: string;
    name: string;
    score: number;
    timeCost: number; // Sum of timestamps for correct answers (lower is faster)
    rank?: number;
}

export function Leaderboard({ sessionId }: LeaderboardProps) {
    const [players, setPlayers] = useState<PlayerScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndCalculateScores = async () => {
            setLoading(true);
            try {
                // 1. Fetch participants
                const { data: participants } = await supabase
                    .from('participants')
                    .select('id, name')
                    .eq('session_id', sessionId);

                if (!participants || participants.length === 0) {
                    setPlayers([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch questions to know question_type
                const { data: questions } = await supabase
                    .from('questions')
                    .select('id, question_type')
                    .order('created_at', { ascending: true });

                const questionsMap = new Map((questions as any[])?.map(q => [q.id, q]) || []);

                // 3. Fetch answers for this session
                const { data: answers } = await supabase
                    .from('answers')
                    .select('participant_id, question_id, answer_text, answered_at')
                    .eq('session_id', sessionId);

                const scores: PlayerScore[] = (participants as any[]).map(p => ({
                    id: p.id,
                    name: p.name,
                    score: 0,
                    timeCost: 0
                }));

                const scoreMap = new Map<string, PlayerScore>(scores.map(s => [s.id, s]));

                if (answers) {
                    (answers as any[]).forEach(ans => {
                        const qInfo = questionsMap.get(ans.question_id);
                        if (!qInfo || qInfo.question_type !== 'MULTIPLE_CHOICE') return;

                        // Direct lookup by question ID — no ordering dependency
                        const correctAns = CORRECT_ANSWERS[ans.question_id];
                        if (correctAns && ans.answer_text.trim() === correctAns.trim()) {
                            const player = scoreMap.get(ans.participant_id);
                            if (player) {
                                player.score += 1;
                                player.timeCost += new Date(ans.answered_at).getTime();
                            }
                        }
                    });
                }

                // Sort: Highest Score First, then Lowest TimeCost (Faster) First
                const ranked = Array.from(scoreMap.values()).sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.timeCost - b.timeCost;
                });

                // Assign ranks handling ties visually if needed, but keeping absolute order
                ranked.forEach((p, idx) => p.rank = idx + 1);

                setPlayers(ranked);

            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculateScores();

        // Optional: Could subscribe to "answers" table, but usually Leaderboard is final slide
        // Subscribing just in case late answers come in
        const subscription = supabase
            .channel('leaderboard_updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'answers', filter: `session_id=eq.${sessionId}` },
                () => { fetchAndCalculateScores(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-indigo-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase">Calculando Pódio...</p>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="text-center p-12 bg-slate-900/40 rounded-3xl border border-white/5 shadow-inner">
                <p className="text-slate-400 text-xl font-medium">Nenhum participante registrado ainda.</p>
            </div>
        );
    }

    // Top 3 for Podium
    const podium = players.slice(0, 3);
    const others = players.slice(3, 10); // Show max top 10

    // Arrange podium order for visual display: 2nd, 1st, 3rd
    const visualPodium = [
        podium[1] || null,
        podium[0] || null,
        podium[2] || null
    ];

    return (
        <div className="w-full flex flex-col items-center">

            {/* Podium Area */}
            {podium.length > 0 && (
                <div className="flex items-end justify-center w-full gap-4 lg:gap-8 mb-16 h-[350px]">
                    {visualPodium.map((player, idx) => {
                        if (!player) return <div key={`empty-${idx}`} className="w-32 lg:w-48" />;

                        const isFirst = player.rank === 1;
                        const isSecond = player.rank === 2;
                        const isThird = player.rank === 3;

                        const heightClass = isFirst ? 'h-[250px]' : isSecond ? 'h-[180px]' : 'h-[140px]';
                        const colorClass = isFirst
                            ? 'from-amber-400/20 to-amber-600/40 border-amber-400/50 text-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.3)]'
                            : isSecond
                                ? 'from-slate-300/20 to-slate-500/40 border-slate-300/50 text-slate-200'
                                : 'from-amber-700/20 to-amber-900/40 border-amber-700/50 text-amber-600';

                        return (
                            <div key={player.id} className="flex flex-col items-center relative group w-[22%] max-w-[200px] animate-in slide-in-from-bottom duration-1000" style={{ animationDelay: `${isFirst ? 600 : isSecond ? 300 : 0}ms`, animationFillMode: 'both' }}>
                                {/* Floating Badge */}
                                <div className={`absolute -top-16 bg-slate-950/80 p-3 rounded-2xl border ${colorClass} backdrop-blur-md shadow-xl transition-transform group-hover:-translate-y-2`}>
                                    {isFirst ? <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> :
                                        <Medal className={`w-8 h-8 ${isSecond ? 'text-slate-300' : 'text-amber-700'}`} />}
                                </div>

                                {/* Info Box */}
                                <div className="text-center mb-4 z-10 bg-slate-900/80 px-4 py-2 border border-white/5 rounded-xl backdrop-blur-sm w-full shadow-lg">
                                    <p className="font-bold text-white truncate max-w-[150px] mx-auto" title={player.name}>{player.name.split(' ')[0]}</p>
                                    <p className={`font-black text-xl ${isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-amber-600'}`}>{player.score} pts</p>
                                </div>

                                {/* Block */}
                                <div className={`w-full rounded-t-3xl bg-gradient-to-t border-t border-x backdrop-blur-md flex flex-col items-center justify-end pb-8 relative overflow-hidden transition-all duration-700 ${heightClass} ${colorClass}`}>
                                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                    <div className="absolute top-0 w-full h-1 bg-white/30"></div>
                                    <span className="text-6xl font-black opacity-30 drop-shadow-md relative z-10">{player.rank}º</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Others List */}
            {others.length > 0 && (
                <div className="w-full max-w-3xl space-y-3 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
                    {others.map((player) => (
                        <div key={player.id} className="flex items-center justify-between bg-slate-900/40 rounded-2xl p-4 border border-white/5 backdrop-blur-sm shadow-inner hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-slate-500 font-black font-mono w-6 text-right">{player.rank}º</span>
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-white/5 shadow-inner">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-200">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-slate-400 text-sm hidden sm:flex">
                                    <Clock className="w-4 h-4 opacity-50" />
                                    <span>Rapidez: {(player.timeCost / 10000000000).toFixed(2)} pts</span>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-inner">
                                    <span className="text-emerald-400 font-bold">{player.score} Acertos</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {players.length > 10 && (
                <p className="mt-6 text-slate-500 text-sm font-medium animate-pulse">
                    Mostrando Top 10 de {players.length} participantes
                </p>
            )}
        </div>
    );
}
