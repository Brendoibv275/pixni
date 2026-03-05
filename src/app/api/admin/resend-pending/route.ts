import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import nodemailer from 'nodemailer';
import { CORRECT_ANSWERS, QUIZ_QUESTIONS } from '@/data/slidesDeck';
import { generateLessonPDF } from '@/lib/utils/pdf-generator';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID é obrigatório' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Buscar participantes que marcaram MATERIAL = TRUE e pertencem a esta sessão
        const { data: participants, error: pError } = await supabase
            .from('participants')
            .select('*')
            .eq('session_id', sessionId)
            .eq('material', true);

        if (pError) throw pError;
        if (!participants || participants.length === 0) {
            return NextResponse.json({ message: 'Nenhum aluno solicitou material nesta sessão.' });
        }

        const results = [];

        for (const p of (participants as any[])) {
            // Buscar respostas do participante para calcular o score e detalhes
            const { data: answers, error: aError } = await supabase
                .from('answers')
                .select('*')
                .eq('participant_id', p.id);

            let correctCount = 0;
            let totalCount = 0;
            let quizDetailsHtml = '';

            if (answers && answers.length > 0) {
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

                (answers as any[]).forEach(ans => {
                    const correctValue = CORRECT_ANSWERS[ans.question_id];
                    if (correctValue) {
                        totalCount++;
                        const isCorrect = ans.answer_text === correctValue;
                        if (isCorrect) correctCount++;

                        const questionText = QUIZ_QUESTIONS[ans.question_id] || ans.question_id;

                        quizDetailsHtml += `
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${questionText}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #475569;">
                            ${ans.answer_text}
                            ${!isCorrect ? `<br><span style="color: #166534; font-size: 11px; font-weight: bold;">(Correta: ${correctValue})</span>` : ''}
                        </td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                            ${isCorrect ?
                                '<span style="color: #166534; background-color: #dcfce3; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px;">Acertou</span>' :
                                '<span style="color: #991b1b; background-color: #fee2e2; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px;">Errou</span>'}
                        </td>
                    </tr>
                `;
                    }
                });

                quizDetailsHtml += `</tbody></table></div>`;
            }

            const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
            const pdfAttachment = await generateLessonPDF(p.name);

            const htmlContent = `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; background-image: linear-gradient(to bottom right, #0f172a, #1e293b);">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.025em;">PIXNI I.Academy</h1>
                        <p style="color: #94a3b8; margin-top: 8px; font-size: 16px;">De usuários a Arquitetos de IA</p>
                    </div>
                    
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700;">Olá, ${p.name}! 🎓</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                            Aqui está o material prometido da nossa aula de IA conduzida pelo mentor <strong>Brendo Dutra</strong>.
                        </p>
                        
                        ${totalCount > 0 ? `
                        <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; border: 1px solid #dcfce3; margin: 30px 0;">
                            <h3 style="margin-top: 0; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Seu Desempenho Total</h3>
                            <p style="font-size: 32px; font-weight: 800; color: #15803d; margin: 8px 0;">
                                ${correctCount} <span style="font-size: 18px; font-weight: 500; color: #86efac;">de ${totalCount} acertos (${percentage}%)</span>
                            </p>
                        </div>` : ''}

                        ${quizDetailsHtml}

                        ${p.personal_prompt ? `
                        <div style="background-color: #eff6ff; padding: 24px; border-radius: 12px; border: 1px solid #dbeafe; margin: 30px 0;">
                            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">✨ Seu Prompt de Alta Performance</h3>
                            <p style="font-size: 14px; color: #3b82f6; margin-bottom: 12px;">Use este prompt no Gemini ou ChatGPT para resultados profissionais:</p>
                            <div style="color: #1e40af; font-size: 14px; white-space: pre-wrap; background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #dbeafe; font-family: 'Courier New', Courier, monospace; line-height: 1.5;">${p.personal_prompt}</div>
                        </div>` : ''}
                        
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Atenciosamente,</p>
                            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">Brendo Dutra</p>
                            <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">Mentor Executivo | Pixni I.Academy</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Anexamos o PDF completo da aula.</p>
                        <p style="font-size: 12px; color: #cbd5e1; margin-top: 12px;">© ${new Date().getFullYear()} Pixni Academy. Todos os direitos reservados.</p>
                    </div>
                </div>
            `;

            try {
                await transporter.sendMail({
                    from: `"Brendo Dutra | Pixni Academy" <${process.env.EMAIL_USER}>`,
                    to: p.email,
                    subject: `🎓 Dossie IA: ${p.name} (Material em Anexo)`,
                    html: htmlContent,
                    attachments: [
                        {
                            filename: 'Material_Aula_Pixni_Academy.pdf',
                            content: pdfAttachment,
                            encoding: 'base64'
                        }
                    ]
                });

                results.push({ email: p.email, status: 'success' });
            } catch (err: any) {
                console.error(`Erro ao enviar para ${p.email}:`, err);
                results.push({ email: p.email, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            message: 'Processamento concluído',
            details: results
        });
    } catch (error: any) {
        console.error('Erro geral no reenvio:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
