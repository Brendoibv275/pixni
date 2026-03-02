'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Presentation, Plus, LogOut, Clock, Play } from 'lucide-react';
import { Database } from '@/types/supabase';

type Session = Database['public']['Tables']['sessions']['Row'];

export default function AdminDashboard() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthAndLoad = async () => {
            const { data: { session }, error: authError } = await supabase.auth.getSession();

            if (authError || !session) {
                router.push('/admin');
                return;
            }

            setUserEmail(session.user.email ?? null);

            // Carrega as salas do professor
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('admin_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSessions(data);
            }
            setLoading(false);
        };

        checkAuthAndLoad();
    }, [router]);

    const handleCreateSession = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Não autenticado");

            // Gera um PIN de exatamente 6 caracteres para respeitar o limite do banco de dados (VARCHAR(6))
            const newPin = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data: newSession, error: createError } = await supabase
                .from('sessions')
                .insert({
                    pin: newPin,
                    current_slide_index: 0,
                    current_state: 'SLIDE_CONTENT',
                    is_active: true,
                    admin_id: session.user.id
                } as any)
                .select('id')
                .single() as { data: { id: string } | null, error: any };

            if (createError) {
                console.error("Supabase Error Details:", createError);
                throw createError;
            }

            router.push(`/admin/${newSession!.id}`);
        } catch (err: any) {
            console.error('Erro ao criar sala:', err);
            alert(`Erro ao criar sala: ${err?.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-500/20 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Carregando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-inner">
                            <Presentation className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Painel do Professor</h1>
                            {userEmail && <p className="text-xs text-slate-400">{userEmail}</p>}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm bg-slate-800/50 hover:bg-slate-800 py-2 px-3 rounded-lg border border-slate-700/50"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-4 py-8">
                {/* Hero / CTA */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 mb-10 relive overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 md:flex items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Pronto para ensinar?</h2>
                            <p className="text-indigo-200/70 max-w-md">
                                Crie uma nova sala interativa. Seus alunos poderão entrar instantaneamente escaneando um QR Code.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateSession}
                            disabled={loading}
                            className="mt-6 md:mt-0 whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-3 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            Iniciar Nova Aula
                        </button>
                    </div>
                </div>

                {/* Histórico de Salas */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <h3 className="text-xl font-bold text-white">Suas Aulas</h3>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                            <Presentation className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Você ainda não criou nenhuma sala.</p>
                            <p className="text-slate-500 text-sm mt-1">Clique em "Iniciar Nova Aula" para começar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.map(session => (
                                <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg font-mono text-sm text-indigo-400 tracking-wider">
                                            {session.pin}
                                        </div>
                                        {session.is_active ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                Ativa
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                                                Encerrada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-6">
                                        Criada em: {new Date(session.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <button
                                        onClick={() => router.push(`/admin/${session.id}`)}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Play className="w-4 h-4" />
                                        {session.is_active ? 'Retomar Controle' : 'Ver Histórico'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
