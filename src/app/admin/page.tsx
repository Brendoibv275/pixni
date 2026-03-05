'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Presentation, LogIn } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Preencha e-mail e senha.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push('/admin/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            // Mostrar o erro exato que a API do Supabase retornar
            setError(`Erro: ${err.message || 'Falha no login. Verifique suas credenciais.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Glow fundo Admin */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 bg-slate-950 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                {/* Borda Glow Top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Presentation className="w-10 h-10 text-indigo-400 ml-1" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight text-center">Acesso Professor</h1>
                    <p className="text-slate-400 text-sm mt-3 text-center max-w-[250px] leading-relaxed">
                        Faça login para criar e gerenciar suas aulas interativas.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <span className="animate-pulse">Autenticando...</span>
                        ) : (
                            <>
                                Entrar no Painel
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={async () => {
                                setLoading(true);
                                const { error } = await supabase.auth.signUp({ email, password });
                                setLoading(false);
                                if (error) setError(error.message);
                                else setError("Registro feito! Pode fazer login se ativado.");
                            }}
                            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                        >
                            Não tem uma conta? Crie uma usando os dados acima.
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-8 text-slate-600 text-sm">
                Voltar para <a href="/" className="text-indigo-400 hover:underline">Visão do Aluno</a>
            </div>
        </div>
    );
}
