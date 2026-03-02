'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LogIn, Tv } from 'lucide-react';

function JoinForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pega o ID da sala (se não vier, será null e a pessoa precisará digitar o PIN apenas)
    const urlRoomId = searchParams.get('room');
    const urlPin = searchParams.get('pin');

    const [pin, setPin] = useState(urlPin || '');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Se a sala veio via URL, esconde o campo PIN (fricção zero)
    const isDirectLink = !!urlRoomId && !!urlPin;

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        let targetSessionId = urlRoomId;

        if (!pin || !name || !email) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Se NÃO tiver o ID da sala na URL, busca a sala pelo PIN digitado
            if (!targetSessionId) {
                const { data: sessionData, error: sessionError } = await supabase
                    .from('sessions')
                    .select('id, is_active')
                    .eq('pin', pin.toUpperCase())
                    .single() as { data: { id: string, is_active: boolean } | null, error: any };

                if (sessionError || !sessionData) {
                    throw new Error('Sessão não encontrada com este código.');
                }
                if (!sessionData.is_active) {
                    throw new Error('Esta sessão já foi encerrada.');
                }
                targetSessionId = sessionData.id;
            } else {
                // Se veio com a URL direta, só checa se a sala de fato está ativa por precaução.
                const { data: activeCheck } = await supabase
                    .from('sessions')
                    .select('is_active')
                    .eq('id', targetSessionId)
                    .single() as { data: { is_active: boolean } | null };

                if (!activeCheck?.is_active) {
                    throw new Error('A sessão já foi encerrada.');
                }
            }

            // Registra o participante com NOME e EMAIL
            const { data: participantData, error: participantError } = await supabase
                .from('participants')
                .insert({
                    session_id: targetSessionId,
                    name: name.trim(),
                    email: email.trim().toLowerCase()
                } as any)
                .select('id')
                .single() as { data: { id: string } | null, error: any };

            if (participantError) {
                throw new Error('Erro ao registrar sua entrada. Tente novamente.');
            }

            // Salva os dados no localStorage para o fluxo funcionar igual a antes
            localStorage.setItem('pixni_session_id', targetSessionId);
            localStorage.setItem('pixni_participant_id', participantData!.id);
            localStorage.setItem('pixni_participant_name', name.trim());

            router.push(`/play/${pin.toUpperCase()}`);
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido ao entrar na sala.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleJoin} className="space-y-4">
            {/* Se for um link direto, o PIN fica invisível para acelerar */}
            {!isDirectLink && (
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">
                        Código da Aula
                    </label>
                    <input
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        placeholder="Ex: EVENTO26"
                        maxLength={10}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-center tracking-widest text-lg"
                    />
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">
                    Seu Nome
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como professor deve te chamar?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">
                    Seu E-mail
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="receber materiais e certificados"
                    autoComplete="email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1 ml-1 text-center">
                    Garantimos a privacidade dos seus dados.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
                {loading ? (
                    <span className="animate-pulse">Conectando...</span>
                ) : (
                    <>
                        Entrar na Aula
                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}

export default function JoinPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Background Decorativo Mobile */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[120vw] h-[60vh] rounded-b-[100%] bg-blue-600/10 blur-[80px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[120vw] h-[60vh] rounded-t-[100%] bg-purple-600/5 blur-[80px]"></div>
            </div>

            <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                {/* Borda superior accent */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-3xl"></div>

                <div className="flex flex-col items-center mb-8 pt-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
                        <Tv className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">PIXNI Academy</h1>
                    <p className="text-slate-400 text-sm mt-1 text-center font-medium">Você está a um passo da aula!</p>
                </div>

                <Suspense fallback={<div className="text-center text-slate-500 text-sm p-4">Carregando formulário...</div>}>
                    <JoinForm />
                </Suspense>
            </div>

            <p className="mt-8 text-slate-600 text-[10px] sm:text-xs">
                Desenvolvido por PIXNI. Todos os direitos reservados.
            </p>
        </div>
    );
}
