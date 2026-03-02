'use client';

import { useState, useEffect } from 'react';
import { Bot, FileText, Search, Cog, CheckCircle2, ArrowRightCircle, MessageSquare } from 'lucide-react';

export function AgentSimulator() {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

    // Auto-play simulation
    useEffect(() => {
        const t1 = setTimeout(() => setStep(1), 2000);
        const t2 = setTimeout(() => setStep(2), 5000);
        const t3 = setTimeout(() => setStep(3), 8000);
        const t4 = setTimeout(() => setStep(4), 11000);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        };
    }, []);

    const reset = () => setStep(0);

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-950/60 backdrop-blur-2xl border-2 border-rose-500/40 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(244,63,94,0.15)] relative overflow-hidden" onClick={reset}>
            {/* Brilho de Fundo */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="text-center mb-12 cursor-pointer relative z-10">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-4 flex items-center justify-center gap-4 drop-shadow-sm tracking-tight">
                    <Bot className="text-rose-400 w-10 h-10" />
                    Agente Autônomo em Ação
                </h2>
                <p className="text-slate-300 text-xl font-medium">Um agente não apenas responde, ele processa, pensa e executa tarefas sozinho.</p>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-10 relative z-10">
                {/* Lateral Esquerda - Objetivo */}
                <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                    <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-inner">
                        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Tarefa Recebida
                        </h3>
                        <div className="flex items-start gap-4 bg-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-sm">
                            <MessageSquare className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                            <p className="text-slate-200 text-base leading-relaxed">"Analise este edital anexado e me dê o prazo de impugnação e documentos fiscais exigidos."</p>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                                <FileText className="w-4 h-4 text-rose-400" />
                            </div>
                            <span className="text-sm text-rose-300 font-mono font-bold tracking-tight">edital_pregao_042.pdf</span>
                        </div>
                    </div>

                    {/* Ferramentas Disponíveis */}
                    <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex-1 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full pointer-events-none"></div>
                        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-black mb-5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Ferramentas Box
                        </h3>
                        <ul className="space-y-4 relative z-10">
                            <li className={`flex items-center gap-3 text-base transition-all duration-300 ${step === 1 ? 'text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl shadow-inner -mx-3' : 'text-slate-400 px-1 hover:text-slate-300'}`}>
                                <FileText className="w-5 h-5" /> Leitor de PDF
                            </li>
                            <li className={`flex items-center gap-3 text-base transition-all duration-300 ${step === 2 ? 'text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl shadow-inner -mx-3' : 'text-slate-400 px-1 hover:text-slate-300'}`}>
                                <Search className="w-5 h-5" /> Extrator de Entidades
                            </li>
                            <li className={`flex items-center gap-3 text-base transition-all duration-300 ${step === 3 ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl shadow-inner -mx-3' : 'text-slate-400 px-1 hover:text-slate-300'}`}>
                                <Cog className="w-5 h-5" /> Formatador JSON/Markdown
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Centro/Direita - Loop de Pensamento */}
                <div className="col-span-12 md:col-span-8 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-black mb-8 flex items-center gap-3">
                        <ArrowRightCircle className="w-5 h-5 text-rose-500" /> Linha de Raciocínio (ReAct)
                    </h3>

                    <div className="space-y-8 relative">
                        {/* Linha conectora vertical (gambiarra visual) */}
                        <div className="absolute left-5 top-8 bottom-4 w-0.5 bg-slate-800/50"></div>

                        {/* Step 1 */}
                        <div className="flex gap-6 opacity-100 transition-opacity relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-black shrink-0 shadow-inner">1</div>
                            <div className="flex-1 pt-1">
                                <p className="text-purple-400 font-mono text-xs font-bold mb-2 tracking-widest">PENSAMENTO</p>
                                <p className="text-slate-300 text-lg leading-relaxed mb-4">Preciso primeiro ler o conteúdo do arquivo PDF anexado para entender o edital.</p>

                                {step >= 1 && (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 mt-2">
                                        <p className="text-rose-400 font-mono text-[11px] uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                            AÇÃO: <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Ferramenta Leitor de PDF</span>
                                        </p>
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-sm text-slate-400 font-mono max-h-24 overflow-hidden relative shadow-inner">
                                            {'>'} [PDF Extraído L1]: SECRETARIA MUNICIPAL DE SAÚDE... <br />
                                            {'>'} [L45]: OBJETO: Aquisição de... PRAZO DE IMPUGNAÇÃO: 3 dias úteis... <br />
                                            {'>'} [L82]: DOCUMENTOS HABILITAÇÃO: SICAF, Balanço Patrimonial...
                                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2 */}
                        {step >= 2 && (
                            <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-black shrink-0 shadow-inner">2</div>
                                <div className="flex-1 pt-1">
                                    <p className="text-purple-400 font-mono text-xs font-bold mb-2 tracking-widest">PENSAMENTO</p>
                                    <p className="text-slate-300 text-lg leading-relaxed mb-4">Agora que tenho o texto, vou extrair exatamente o prazo e os documentos solicitados pelo usuário.</p>

                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200 mt-2">
                                        <p className="text-cyan-400 font-mono text-[11px] uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                            AÇÃO: <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Extração Categórica</span>
                                        </p>
                                        <p className="text-cyan-100/70 text-base italic bg-slate-900/50 p-3 rounded-xl border border-white/5">"Encontrei: prazo de 3 dias úteis. Documentos: SICAF e Balanço Patrimonial."</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step >= 3 && (
                            <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-black shrink-0 shadow-inner">3</div>
                                <div className="flex-1 pt-1">
                                    <p className="text-purple-400 font-mono text-xs font-bold mb-2 tracking-widest">PENSAMENTO</p>
                                    <p className="text-slate-300 text-lg leading-relaxed mb-2">Tenho todas as informações. Vou formatar a resposta final linda e mastigada para o usuário.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resultado Final */}
            <div className={`mt-8 transition-all duration-1000 ease-out relative z-10 ${step >= 4 ? 'opacity-100 max-h-[500px] translate-y-0' : 'opacity-0 max-h-0 overflow-hidden translate-y-8'}`}>
                <div className="bg-emerald-950/40 backdrop-blur-md border-[3px] border-emerald-500/30 rounded-[2rem] p-8 flex items-start gap-6 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 shrink-0 drop-shadow-md" />
                    <div>
                        <h4 className="text-emerald-400 font-black text-xl mb-4 tracking-tight drop-shadow-sm">Relatório Final do Agente</h4>
                        <div className="text-slate-200 text-lg space-y-3 font-medium">
                            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> <strong className="text-white">Prazo de Impugnação:</strong> 3 dias úteis a contar da publicação.</p>
                            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> <strong className="text-white">Documentação Fiscal Exigida:</strong></p>
                            <ul className="list-none pl-8 space-y-2 text-slate-300">
                                <li className="flex items-center gap-2 text-base"><ArrowRightCircle className="w-4 h-4 text-emerald-500/50" /> SICAF atualizado (níveis 1 a 4)</li>
                                <li className="flex items-center gap-2 text-base"><ArrowRightCircle className="w-4 h-4 text-emerald-500/50" /> Balanço Patrimonial do último exercício</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
