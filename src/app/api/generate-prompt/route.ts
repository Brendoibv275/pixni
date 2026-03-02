import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Você é um Engenheiro de Prompts Sênior especialista em criar comandos de alta performance para Inteligência Artificial.

Sua tarefa é receber informações sobre o cargo, a principal tarefa burocrática e o resultado ideal de um profissional, e gerar um PROMPT DE ALTA PERFORMANCE estruturado no framework:

1. **PERSONA**: Defina uma persona especialista (Ex: "Aja como um consultor sênior especialista em...")
2. **CONTEXTO**: Contextualize o cenário profissional com base no cargo e na dor informada
3. **TAREFA**: Defina a tarefa principal de forma clara e detalhada
4. **FORMATO**: Especifique o formato de saída ideal (tabela, lista, relatório, etc.)

Regras:
- O prompt deve ser prático, direto e pronto para copiar e colar no Gemini/ChatGPT
- Use linguagem profissional mas acessível
- O prompt deve ter entre 200 e 400 palavras
- NÃO inclua explicações sobre o framework, apenas gere o prompt final
- Comece diretamente com "Aja como..." ou "Você é..."
- Inclua exemplos de formato de saída quando possível`;

export async function POST(request: NextRequest) {
    try {
        const { cargo, tarefa, resultado, sessionId, participantId } = await request.json();

        if (!cargo || !tarefa || !resultado) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios (cargo, tarefa, resultado).' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Fallback: gera um prompt template sem IA
            const fallbackPrompt = generateFallbackPrompt(cargo, tarefa, resultado);
            return NextResponse.json({ prompt: fallbackPrompt });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const userMessage = `
Informações do profissional:
- **Cargo**: ${cargo}
- **Tarefa mais demorada**: ${tarefa}
- **Resultado ideal desejado**: ${resultado}

Gere o prompt de alta performance agora:`;

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userMessage }] }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        });

        const response = result.response;
        const promptText = response.text();

        return NextResponse.json({ prompt: promptText });

    } catch (error: any) {
        console.error('Erro ao gerar prompt:', error);
        return NextResponse.json(
            { error: 'Falha ao gerar o prompt. Tente novamente.' },
            { status: 500 }
        );
    }
}

function generateFallbackPrompt(cargo: string, tarefa: string, resultado: string): string {
    return `Aja como um especialista sênior com experiência na área de ${cargo}, com profundo conhecimento em otimização de processos corporativos e automação com Inteligência Artificial.

**CONTEXTO:**
Eu sou ${cargo} e a tarefa que mais consome meu tempo atualmente é: ${tarefa}. Preciso de uma solução estruturada que me ajude a automatizar ou otimizar esse processo.

**TAREFA:**
Analise minha situação e crie um plano detalhado e prático para transformar essa tarefa manual em um processo mais eficiente. O resultado que eu espero alcançar é: ${resultado}.

**FORMATO DE SAÍDA:**
Retorne sua resposta organizada em:
1. **Diagnóstico Rápido** (3 bullets com os principais gargalos que você identificou)
2. **Plano de Ação** (tabela com: Etapa | Ação | Ferramenta/IA Sugerida | Tempo Estimado)
3. **Prompt Auxiliar** (um prompt secundário que eu possa usar para executar a primeira etapa do plano)
4. **Quick Win** (uma ação que eu posso fazer AGORA em 5 minutos para já ter um resultado)

Seja prático, direto e use linguagem acessível. Foque em soluções que eu consiga implementar com ferramentas de IA gratuitas ou de baixo custo como Gemini, ChatGPT, ou Google AI Studio.`;
}
