import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Session = Database['public']['Tables']['sessions']['Row'];

const POLL_INTERVAL = 2000; // 2 segundos – fallback caso Realtime não esteja habilitado

export function useSession(sessionId: string | null) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const realtimeWorking = useRef(false);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Função de fetch reutilizável
    const fetchSession = useCallback(async (): Promise<Session | null> => {
        if (!sessionId) return null;

        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;
            return data as any as Session;
        } catch (err: any) {
            console.error('Erro ao buscar sessão:', err);
            return null;
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        // 1. Fetch inicial
        const initialFetch = async () => {
            const data = await fetchSession();
            if (data) {
                setSession(data);
            } else {
                setError('Sessão não encontrada.');
            }
            setLoading(false);
        };

        initialFetch();

        // 2. Tenta Supabase Realtime
        const channel = supabase
            .channel(`session-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'sessions',
                    filter: `id=eq.${sessionId}`,
                },
                (payload) => {
                    realtimeWorking.current = true;
                    setSession(payload.new as Session);
                }
            )
            .subscribe();

        // 3. Polling de fallback – roda a cada 3s
        const getHash = (s: Session) => `${s.current_slide_index}|${s.current_state}|${s.is_active}`;

        pollTimerRef.current = setInterval(async () => {
            const data = await fetchSession();
            if (data) {
                setSession(prev => {
                    if (!prev) return data;
                    if (getHash(prev) !== getHash(data)) return data;
                    return prev;
                });
            }
        }, 3000);

        // Cleanup
        return () => {
            supabase.removeChannel(channel);
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [sessionId, fetchSession]);

    // Função utilitária para o Admin avançar o estado
    const updateSessionState = async (updates: Partial<Database['public']['Tables']['sessions']['Update']>) => {
        if (!sessionId) return;

        // Otimista: atualiza local state imediatamente
        setSession(prev => prev ? { ...prev, ...updates } as Session : prev);

        try {
            const { error } = await supabase
                .from('sessions')
                // @ts-ignore
                .update(updates)
                .eq('id', sessionId);

            if (error) {
                // Reverte se falhou
                const data = await fetchSession();
                if (data) setSession(data);
                throw error;
            }
        } catch (err) {
            console.error('Erro ao atualizar sessão:', err);
            throw err;
        }
    };

    return { session, loading, error, updateSessionState };
}
