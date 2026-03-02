import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Send } from 'lucide-react';

interface FloatingQAProps {
    sessionId: string;
    participantId: string;
    onClose?: () => void;
}

export function FloatingQA({ sessionId, participantId, onClose }: FloatingQAProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setError('');

        try {
            const { error: submitError } = await supabase
                .from('qa_messages')
                .insert({
                    session_id: sessionId,
                    participant_id: participantId,
                    message: message.trim(),
                } as any);

            if (submitError) throw submitError;

            setSuccess(true);
            setMessage('');

            setTimeout(() => {
                setSuccess(false);
                if (onClose) onClose();
            }, 2500);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao enviar dúvida. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                <h3 className="font-bold text-white">Enviar Dúvida</h3>
            </div>

            {/* Body */}
            <div className="p-6">
                {success ? (
                    <div className="text-center py-6 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">😎</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Dúvida enviada!</h4>
                        <p className="text-slate-400 text-sm">O apresentador verá sua pergunta no telão.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                            Tem alguma dúvida sobre o que está sendo falado agora?
                        </p>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ex: Como o Gemini entende o contexto de uma API?"
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-[120px]"
                            required
                        />

                        {error && <p className="text-red-400 text-xs">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Enviando...' : (
                                <>
                                    Lançar Pergunta
                                    <Send className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
