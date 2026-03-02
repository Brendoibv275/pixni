import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
    // Inicializa dentro do handler para não quebrar o build quando a env var não está disponível
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await req.json();
        const { participantName, participantEmail, score, quizResults, generatedPrompt } = body;

        if (!participantEmail) {
            return NextResponse.json({ error: 'E-mail do participante é obrigatório' }, { status: 400 });
        }

        const percentage = score?.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

        // Construção do corpo do e-mail em HTML
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #0f172a; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">PIXNI I.Academy</h1>
                    <p style="color: #94a3b8; margin-top: 5px;">De usuários a Arquitetos de IA</p>
                </div>
                
                <div style="padding: 30px; background-color: #f8fafc; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <h2 style="color: #0f172a; margin-top: 0;">Olá, ${participantName}! 🎓</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Obrigado por participar da nossa sessão. Aqui está o seu relatório de desempenho e os principais conceitos abordados em aula.</p>
                    
                    ${score?.total > 0 ? `
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">Seu Score nos Quizzes</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0;">
                            ${score.correct} de ${score.total} acertos (${percentage}%)
                        </p>
                    </div>` : ''}

                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">Resumo de Conceitos (Mentalidade)</h3>
                        <ul style="padding-left: 20px; line-height: 1.6;">
                            <li><strong>LLM:</strong> Motor de IA que prevê palavras com base em probabilidade.</li>
                            <li><strong>API:</strong> Ponte de comunicação para integrar IA aos nossos sistemas.</li>
                            <li><strong>Tokens & Janela:</strong> Pedaços de texto e o limite de "memória" de curto prazo da IA.</li>
                            <li><strong>Prompt:</strong> O comando/instrução que enviamos. Prompts profissionais exigem Persona, Contexto e Formato.</li>
                            <li><strong>RAG:</strong> Alimentar a IA com seus próprios documentos (PDFs, planilhas) para evitar alucinação.</li>
                        </ul>
                    </div>

                    ${generatedPrompt ? `
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #166534;">✨ Seu Prompt de Alta Performance</h3>
                        <p style="color: #15803d; font-size: 14px; white-space: pre-wrap; background-color: #dcfce3; padding: 15px; border-radius: 6px;">${generatedPrompt}</p>
                    </div>` : ''}
                    
                    <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #64748b;">
                        Continue praticando e aplicando IA no seu dia a dia.<br>
                        <strong>Equipe Pixni Academy</strong>
                    </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
                    <span style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} Pixni Academy. Todos os direitos reservados.</span>
                </div>
            </div>
        `;

        const data = await resend.emails.send({
            from: 'Pixni Academy <onboarding@resend.dev>', // O Resend permite usar onboarding@resend.dev gratis só pra emails aprovados. Se configurar seu dominio, você troca aqui.
            to: [participantEmail],
            subject: '🎓 Seu Dossiê e Resultados da Pixni Academy',
            html: htmlContent,
        });

        if (data.error) {
            console.error("Erro do resend:", data.error);
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Erro na rota de email:', error);
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
