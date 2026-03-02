'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface AiPromptBuilderProps {
    sessionId: string;
    participantId: string;
}

const STEPS = [
    {
        label: 'Passo 1 de 3',
        question: 'Qual é o seu cargo ou o que você faz?',
        placeholder: 'Ex: Consultor Sênior de Gestão, Analista de Editais...',
        icon: '🎭'
    },
    {
        label: 'Passo 2 de 3',
        question: 'Qual tarefa burocrática mais consome seu tempo hoje?',
        placeholder: 'Ex: Ler editais e classificar riscos, estruturar atas 5W2H, analisar NFs...',
        icon: '🎯'
    },
    {
        label: 'Passo 3 de 3',
        question: 'Qual seria o resultado ideal que você queria automaticamente?',
        placeholder: 'Ex: Um relatório pronto em PDF com os riscos classificados por prioridade...',
        icon: '✨'
    }
];

export function AiPromptBuilderState({ sessionId, participantId }: AiPromptBuilderProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(['', '', '']);
    const [generating, setGenerating] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const updateAnswer = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[step] = value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleGenerate();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cargo: answers[0],
                    tarefa: answers[1],
                    resultado: answers[2],
                    sessionId,
                    participantId
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Falha ao gerar prompt');
            }

            const data = await response.json();
            setGeneratedPrompt(data.prompt);

            // Salva o prompt no localStorage para ser recuperado no final da sessão
            const promptKey = `pixni_prompt_${sessionId}_${participantId}`;
            localStorage.setItem(promptKey, data.prompt);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao gerar o prompt. Tente novamente.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = generatedPrompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Tela de resultado
    if (generatedPrompt) {
        return (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-3xl p-6 mb-4 text-center">
                    <span className="text-4xl mb-3 block">🤖</span>
                    <h2 className="text-xl font-bold text-white mb-1">Seu Prompt de Alta Performance</h2>
                    <p className="text-slate-400 text-xs">Gerado pela IA com base nas suas respostas</p>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-5 text-slate-200 text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap font-mono mb-4">
                    {generatedPrompt}
                </div>

                <button
                    onClick={handleCopy}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {copied ? (
                        <>
                            <Check className="w-5 h-5" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            Copiar Prompt
                        </>
                    )}
                </button>
            </div>
        );
    }

    // Tela de loading
    if (generating) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Gerando seu Prompt...</h2>
                <p className="text-slate-400 text-sm max-w-xs">
                    A IA está usando o framework Persona + Contexto + Tarefa + Formato para criar o prompt perfeito para você.
                </p>
                <Loader2 className="w-6 h-6 animate-spin text-purple-400 mt-6" />
            </div>
        );
    }

    // Formulário de 3 passos
    const currentStep = STEPS[step];

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    Construtor de Prompt
                </span>
                <span className="text-xs text-slate-500 font-mono">{currentStep.label}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${((step + 1) / 3) * 100}%` }}
                />
            </div>

            <div className="bg-purple-600/10 border border-purple-500/20 rounded-3xl p-6 mb-6 text-center">
                <span className="text-4xl mb-3 block">{currentStep.icon}</span>
                <h2 className="text-lg font-bold text-white leading-relaxed">
                    {currentStep.question}
                </h2>
            </div>

            <textarea
                value={answers[step]}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder={currentStep.placeholder}
                className="flex-1 w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-inner min-h-[120px] mb-4"
            />

            {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

            <div className="flex gap-3">
                {step > 0 && (
                    <button
                        onClick={handleBack}
                        className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={!answers[step].trim()}
                    className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {step === 2 ? (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Gerar Meu Prompt
                        </>
                    ) : (
                        <>
                            Avançar
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
