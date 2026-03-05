import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateLessonPDF } from '@/lib/utils/pdf-generator';
import { QUIZ_QUESTIONS, CORRECT_ANSWERS } from '@/data/slidesDeck';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { participantName, participantEmail, score, quizResults, generatedPrompt } = body;

        if (!participantEmail) {
            return NextResponse.json({ error: 'E-mail do participante é obrigatório' }, { status: 400 });
        }

        const percentage = score?.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

        // Construir tabela de resultados do quiz
        let quizDetailsHtml = '';
        if (quizResults && Array.isArray(quizResults) && quizResults.length > 0) {
            quizDetailsHtml = `
                <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead style="background-color: #f8fafc;">
                            <tr>
                                <th style="padding: 12px 15px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #64748b; width: 40%;">Questão</th>
                                <th style="padding: 12px 15px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #64748b;">Sua Resposta</th>
                                <th style="padding: 12px 15px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #64748b;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const result of quizResults) {
                const qText = result.questionText || 'Questão';
                const isCorrect = !!result.isCorrect;
                const userAnswer = result.userAnswer || 'Não respondida';
                const correctAnswer = result.correctAnswer;

                quizDetailsHtml += `
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${qText}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #475569;">
                            ${userAnswer}
                            ${!isCorrect && correctAnswer ? `<br><span style="color: #166534; font-size: 11px; font-weight: bold;">(Correta: ${correctAnswer})</span>` : ''}
                        </td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                            ${isCorrect ?
                        '<span style="color: #166534; background-color: #dcfce3; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px;">Acertou</span>' :
                        '<span style="color: #991b1b; background-color: #fee2e2; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px;">Errou</span>'}
                        </td>
                    </tr>
                `;
            }

            quizDetailsHtml += `</tbody></table></div>`;
        }

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; background-image: linear-gradient(to bottom right, #0f172a, #1e293b);">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.025em;">PIXNI I.Academy</h1>
                    <p style="color: #94a3b8; margin-top: 8px; font-size: 16px;">De usuários a Arquitetos de IA</p>
                </div>
                
                <div style="padding: 40px 30px;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700;">Olá, ${participantName}! 🎓</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                        Parabéns por completar sua jornada de imersão em Inteligência Artificial! Aqui está o seu dossiê exclusivo e o material de apoio da nossa sessão conduzida pelo mentor <strong>Brendo Dutra</strong>.
                    </p>
                    
                    ${score?.total > 0 ? `
                    <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; border: 1px solid #dcfce3; margin: 30px 0;">
                        <h3 style="margin-top: 0; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Seu Desempenho Total</h3>
                        <p style="font-size: 32px; font-weight: 800; color: #15803d; margin: 8px 0;">
                            ${score.correct} <span style="font-size: 18px; font-weight: 500; color: #86efac;">de ${score.total} acertos (${percentage}%)</span>
                        </p>
                    </div>` : ''}

                    ${quizDetailsHtml}

                    <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 30px 0;">
                        <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Mentalidade Arquiteto de IA</h3>
                        <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Os pilares fundamentais abordados hoje:</p>
                        <ul style="padding-left: 0; list-style: none; margin: 0;">
                            <li style="margin-bottom: 10px; display: flex; align-items: flex-start;">
                                <span style="color: #6366f1; margin-right: 10px;">✦</span>
                                <span><strong>LLM:</strong> Motores de previsão probabilística.</span>
                            </li>
                            <li style="margin-bottom: 10px; display: flex; align-items: flex-start;">
                                <span style="color: #6366f1; margin-right: 10px;">✦</span>
                                <span><strong>APIs:</strong> A ponte de integração para sistemas corporativos.</span>
                            </li>
                            <li style="margin-bottom: 10px; display: flex; align-items: flex-start;">
                                <span style="color: #6366f1; margin-right: 10px;">✦</span>
                                <span><strong>Engenharia de Prompt:</strong> O framework Persona + Contexto + Tarefa.</span>
                            </li>
                        </ul>
                    </div>

                    ${generatedPrompt ? `
                    <div style="background-color: #eff6ff; padding: 24px; border-radius: 12px; border: 1px solid #dbeafe; margin: 30px 0;">
                        <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">✨ Seu Prompt de Alta Performance</h3>
                        <p style="font-size: 14px; color: #3b82f6; margin-bottom: 12px;">Use este prompt no Gemini ou ChatGPT para resultados profissionais:</p>
                        <div style="color: #1e40af; font-size: 14px; white-space: pre-wrap; background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #dbeafe; font-family: 'Courier New', Courier, monospace; line-height: 1.5;">${generatedPrompt}</div>
                    </div>` : ''}
                    
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center;">
                        <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Atenciosamente,</p>
                        <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">Brendo Dutra</p>
                        <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">Mentor Executivo | Pixni I.Academy</p>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        Anexamos a este e-mail o resumo completo da nossa aula em PDF.
                    </p>
                    <p style="font-size: 12px; color: #cbd5e1; margin-top: 12px;">
                        © ${new Date().getFullYear()} Pixni Academy. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        `;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("Credenciais de email não configuradas no .env.");
        }

        const pdfAttachment = await generateLessonPDF(participantName);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Brendo Dutra | Pixni Academy" <${process.env.EMAIL_USER}>`,
            to: participantEmail,
            subject: `🎓 Dossie IA: ${participantName} (Material em Anexo)`,
            html: htmlContent,
            attachments: [
                {
                    filename: 'Material_Aula_Pixni_Academy.pdf',
                    content: pdfAttachment,
                    encoding: 'base64'
                }
            ]
        });

        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error('Erro na rota de email:', error);
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
