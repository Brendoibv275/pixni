import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Answer = Database['public']['Tables']['answers']['Row'];

const POLL_INTERVAL = 3000; // 3s de polling

export function useRealtimeAnswers(sessionId: string | null, activeQuestionId: string | null) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAnswers = useCallback(async () => {
        if (!sessionId || !activeQuestionId) return;

        try {
            const { data, error } = await supabase
                .from('answers')
                .select('*')
                .eq('session_id', sessionId)
                .eq('question_id', activeQuestionId);

            if (error) throw error;
            setAnswers(data || []);
        } catch (err) {
            console.error('Erro ao buscar respostas:', err);
        }
    }, [sessionId, activeQuestionId]);

    useEffect(() => {
        if (!sessionId || !activeQuestionId) {
            setAnswers([]);
            return;
        }

        // 1. Fetch inicial
        fetchAnswers();

        // 2. Supabase Realtime
        const channel = supabase
            .channel(`answers-${sessionId}-${activeQuestionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'answers',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    if (payload.new.question_id === activeQuestionId) {
                        setAnswers((prev) => [...prev, payload.new as Answer]);
                    }
                }
            )
            .subscribe();

        // 3. Polling fallback
        pollTimerRef.current = setInterval(fetchAnswers, POLL_INTERVAL);

        return () => {
            supabase.removeChannel(channel);
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [sessionId, activeQuestionId, fetchAnswers]);

    return { answers };
}
