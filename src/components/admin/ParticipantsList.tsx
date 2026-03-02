'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { UserCircle, Clock } from 'lucide-react';

interface ParticipantsListProps {
    sessionId: string;
}

export function ParticipantsList({ sessionId }: ParticipantsListProps) {
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        let subscription: any;

        const loadParticipants = async () => {
            const fetchParticipants = async () => {
                const { data } = await supabase
                    .from('participants')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('joined_at', { ascending: true });

                setParticipants(data || []);
            };

            await fetchParticipants();

            subscription = supabase
                .channel(`participants_${sessionId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'participants',
                        filter: `session_id=eq.${sessionId}`
                    },
                    () => { fetchParticipants(); }
                )
                .subscribe();
        };

        loadParticipants();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [sessionId]);

    if (participants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                <UserCircle className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Ninguém entrou ainda</h3>
                <p>Quando alguém entrar com o PIN, aparecerá aqui.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Total de alunos ativos</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{participants.length}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pb-4 pr-2">
                {participants.map((p, i) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                            {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{p.name}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
