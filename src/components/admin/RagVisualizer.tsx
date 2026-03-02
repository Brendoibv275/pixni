'use client';

import { useState, useEffect } from 'react';
import { Database, Search, FileText, BrainCircuit, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RagVisualizer() {
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

    // Auto-play simulation for demo purposes
    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 2000);
        const timer2 = setTimeout(() => setStep(2), 5000);
        const timer3 = setTimeout(() => setStep(3), 8000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const reset = () => setStep(0);

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-950/60 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            {/* Brilho de fundo */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="text-center mb-12 cursor-pointer relative z-10" onClick={reset}>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4 flex items-center justify-center gap-4 drop-shadow-sm tracking-tight">
                    <Database className="text-cyan-400 w-10 h-10" />
                    Como o RAG acaba com a Alucinação
                </h2>
                <p className="text-slate-300 text-xl font-medium">Em vez de tentar lembrar de tudo, a IA primeiro busca a resposta no seu acervo PIXNI.</p>
            </div>

            <div className="flex items-center justify-between gap-6 mt-12 relative">

                {/* 1. Base de Dados da Empresa */}
                <div className={`flex-1 flex flex-col items-center transition-all duration-700 ease-out ${step >= 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}>
                    <div className="w-full h-56 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-cyan-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-cyan-900/10 opacity-60 diagram-grid"></div>
                        <FileText className="w-14 h-14 text-slate-400 mb-4 relative z-10 drop-shadow-md" />
                        <span className="text-white font-black text-xl mb-2 relative z-10 tracking-tight">Base de Dados PIXNI</span>
                        <span className="text-cyan-300/80 text-sm font-medium text-center relative z-10 leading-snug">Manuais, Editais, Histórico de Reuniões</span>

                        {/* Search Highlight Animation */}
                        {step === 1 && (
                            <div className="absolute inset-0 bg-cyan-500/20 z-0 animate-pulse flex items-center justify-center">
                                <Search className="w-24 h-24 text-cyan-400/50 absolute" />
                            </div>
                        )}
                        {step >= 2 && (
                            <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 p-1 rounded-full border border-emerald-500/30 z-10">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow 1 */}
                <div className="flex flex-col items-center justify-center relative w-24">
                    {step === 0 && <span className="text-slate-600 font-mono text-xs text-center">Aguardando...</span>}
                    {step === 1 && <span className="text-cyan-400 font-mono font-bold text-xs animate-pulse text-center absolute -top-6">Buscando...</span>}
                    {step >= 2 && <span className="text-emerald-400 font-mono font-bold text-xs text-center absolute -top-6">Trecho Encontrado</span>}

                    <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden mt-2">
                        <div className={`absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-1000 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <ArrowRight className={`mt-2 ${step >= 2 ? 'text-cyan-500' : 'text-slate-700'} w-6 h-6 transition-colors`} />
                </div>

                {/* 2. Cérebro da IA (LLM) */}
                <div className={`flex-1 flex flex-col items-center transition-all duration-700 ${step >= 2 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                    <div className={`w-full h-48 rounded-2xl border-2 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500 ${step >= 3 ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
                        <BrainCircuit className={`w-12 h-12 mb-3 relative z-10 transition-colors duration-500 ${step >= 3 ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className={`font-bold mb-1 relative z-10 transition-colors ${step >= 3 ? 'text-white' : 'text-slate-300'}`}>O "Cérebro" da IA</span>

                        {step === 2 && (
                            <span className="text-cyan-400 text-xs text-center relative z-10 font-mono bg-cyan-900/30 px-3 py-1 rounded border border-cyan-800 mt-2 animate-pulse">Lendo Apenas o Trecho...</span>
                        )}
                        {step >= 3 && (
                            <span className="text-indigo-300 text-xs text-center relative z-10 font-mono px-3 py-2 rounded mt-2">Formatando a Resposta de forma inteligente</span>
                        )}
                    </div>
                </div>

            </div>

            {/* Output Area */}
            <div className="mt-14 relative z-10">
                <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 min-h-[140px] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-400 to-blue-600"></div>
                    <h4 className="text-cyan-500 text-sm uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Resultado para o Cliente
                    </h4>

                    {step === 0 && <p className="text-slate-600 font-medium italic text-lg">Aguardando pergunta na interface do aluno...</p>}
                    {step === 1 && <p className="text-cyan-400 font-mono font-bold animate-pulse text-lg">Analisando milhares de PDFs em milisegundos...</p>}
                    {step === 2 && <p className="text-indigo-400 font-mono font-bold animate-pulse text-lg">Processando contexto super-direcionado extraído...</p>}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-700 bg-emerald-950/30 border border-emerald-500/20 p-6 rounded-2xl">
                            <p className="text-emerald-400 font-black text-lg mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6" /> Resposta Exata baseada nos Termos Oficiais da PIXNI
                            </p>
                            <p className="text-slate-200 text-xl leading-relaxed">
                                "De acordo com a metodologia Sebrae (Pág 42 - Guia 2024), o prazo para aprovação deste documento é de <strong className="text-emerald-300 font-black bg-emerald-900/50 px-2 py-0.5 rounded">5 dias úteis</strong>."
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .diagram-grid {
                    background-image: linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
}
