import { jsPDF } from 'jspdf';
import { SLIDES_DECK } from '@/data/slidesDeck';

/**
 * Limpa strings para evitar caracteres que o jsPDF (fontes padrão) não consegue renderizar,
 * resultando em símbolos estranhos como "Ø=þ€".
 */
function cleanText(text: string): string {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos pesados se necessário, mas jsPDF helvetica suporta latim-1.
        // Remove Emojis e símbolos especiais que quebram fontes padrão
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{203C}]|[\u{2049}]|[\u{2122}]|[\u{2139}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]/gu, '')
        .replace(/[^\x00-\x7F\xC0-\xFF]/g, "") // Mantém ASCII e caracteres latinos básicos
        .trim();
}

export async function generateLessonPDF(participantName: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // --- CABEÇALHO ---
    doc.setFillColor(15, 23, 42); // Slate 950
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('PIXNI I.ACADEMY', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dossie de Imersao: De usuarios a Arquitetos de IA', pageWidth / 2, 35, { align: 'center' });

    // --- INFO PARTICIPANTE ---
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DA SESSAO', margin, 65);

    doc.setFont('helvetica', 'normal');
    doc.text(`Aluno(a): ${cleanText(participantName)}`, margin, 72);
    doc.text(`Mentor Principal: Brendo Dutra`, margin, 78);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, 84);

    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, 90, pageWidth - margin, 90);

    let y = 100;

    // --- CONTEÚDO ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('CONTEUDO PROGRAMATICO', margin, y);
    y += 12;

    doc.setTextColor(51, 65, 85); // Slate 700

    for (const slide of SLIDES_DECK) {
        // Pula slides sem conteúdo relevante para o PDF
        if (slide.state !== 'SLIDE_CONTENT' || slide.title.includes('Intervalo') || slide.title.includes('Lobby')) continue;

        // Verificação de espaço na página
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 25;
        }

        // Título do Slide
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        const cleanTitle = cleanText(slide.title).toUpperCase();
        const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
        doc.text(titleLines, margin, y);
        y += (titleLines.length * 7);

        // Conteúdo do Slide
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const cleanContent = cleanText(slide.content);
        const contentLines = doc.splitTextToSize(cleanContent, contentWidth);
        doc.text(contentLines, margin, y);
        y += (contentLines.length * 5) + 3;

        // Tópicos (Bullets)
        if (slide.bullets) {
            doc.setDrawColor(79, 70, 229);
            for (const bullet of slide.bullets) {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 25;
                }
                const cleanBullet = cleanText(bullet);
                const bulletLines = doc.splitTextToSize(cleanBullet, contentWidth - 10);

                // Desenha um pequeno marcador
                doc.setFillColor(79, 70, 229);
                doc.circle(margin + 2, y - 1, 0.5, 'F');

                doc.text(bulletLines, margin + 6, y);
                y += (bulletLines.length * 5);
            }
        }

        y += 8; // Espaço entre slides
    }

    // --- RODAPÉ ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(`Pagina ${i} de ${totalPages} | Pixni I.Academy - Brendo Dutra`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Retorna Base64
    return doc.output('datauristring').split(',')[1];
}
