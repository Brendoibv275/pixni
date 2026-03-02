/**
 * Script para atualizar as perguntas no Supabase com os índices de slide corretos.
 * 
 * Rode com: node scripts/seed-questions.js
 * 
 * O arquivo .env precisa ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const QUESTIONS = [
    // =====================================================
    //  SLIDE 1 – Quebra-Gelo (4 perguntas)
    // =====================================================
    {
        slide_index: 1,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'Qual ecossistema de ferramentas de IA você mais utiliza no dia a dia?',
        options: JSON.stringify([
            'Chat e Texto (Gemini, GPT, Claude)',
            'Geração de Imagens (Leonardo AI, Midjourney, DALL-E)',
            'Código e Automação (Cursor, Copilot, n8n)',
            'Outros (Vídeo, Áudio, etc.)',
            'Quase não utilizo ferramentas de IA'
        ])
    },
    {
        slide_index: 1,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'Quantas vezes você usa IA por dia?',
        options: JSON.stringify([
            '1 vez ou menos',
            '2 a 5 vezes',
            '5 a 10 vezes',
            'Mais de 10 vezes'
        ])
    },
    {
        slide_index: 1,
        question_type: 'OPEN_TEXT',
        question_text: 'Seja honesto: de 0 a 10, qual o seu nível real de domínio sobre IA hoje?',
        options: null
    },
    {
        slide_index: 1,
        question_type: 'OPEN_TEXT',
        question_text: 'O que você espera sair daqui sabendo fazer que não sabe hoje?',
        options: null
    },

    // =====================================================
    //  SLIDE 6 – Quiz Fixação APIs (2 perguntas)
    // =====================================================
    {
        slide_index: 6,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'O que melhor define uma API no contexto de IA?',
        options: JSON.stringify([
            'Um banco de dados superpotente',
            'Uma ponte de comunicação para integrar a IA aos nossos sistemas',
            'Um tipo de linguagem de programação exclusiva para IA'
        ])
    },
    {
        slide_index: 6,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'Qual é a principal revolução prática das LLMs?',
        options: JSON.stringify([
            'Conexão em tempo real com a internet',
            'Permitir comandos complexos via linguagem natural humana',
            'Substituir completamente o trabalho humano'
        ])
    },

    // =====================================================
    //  SLIDE 13 – Quiz Pós-Pausa (2 perguntas)
    // =====================================================
    {
        slide_index: 13,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'Por que uma IA "alucina" (inventa respostas)?',
        options: JSON.stringify([
            'Porque é um motor de previsão matemática e tentará prever sem dados exatos',
            'Porque os desenvolvedores programaram a máquina para mentir',
            'Porque ela busca informações em sites não confiáveis do Google'
        ])
    },
    {
        slide_index: 13,
        question_type: 'MULTIPLE_CHOICE',
        question_text: 'O que acontece se estourar a "Janela de Contexto" de uma IA?',
        options: JSON.stringify([
            'A IA lê o documento em partes, demorando mais tempo',
            'O banco de dados da IA é atualizado permanentemente',
            'Ela esquece as informações pois excedeu sua memória de curto prazo'
        ])
    },

    // =====================================================
    //  SLIDE 17 – Telefone sem Fio (pergunta especial)
    // =====================================================
    {
        slide_index: 17,
        question_type: 'BROKEN_TELEPHONE',
        question_text: 'Cenário: Um gerente quer usar IA para analisar Notas Fiscais automaticamente. Crie o PIOR PROMPT possível para a IA!',
        options: null
    }
];

async function seedQuestions() {
    console.log('🗑️  Limpando perguntas existentes...');

    // Primeiro, remove answers que dependem das perguntas
    const { data: existingQuestions } = await supabase
        .from('questions')
        .select('id');

    if (existingQuestions && existingQuestions.length > 0) {
        const questionIds = existingQuestions.map(q => q.id);
        for (const qId of questionIds) {
            await supabase.from('answers').delete().eq('question_id', qId);
        }
    }

    // Remove perguntas existentes
    await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('📝 Inserindo perguntas atualizadas...');

    const { data, error } = await supabase
        .from('questions')
        .insert(QUESTIONS)
        .select();

    if (error) {
        console.error('❌ Erro ao inserir perguntas:', error);
        return;
    }

    console.log(`✅ ${data.length} perguntas inseridas com sucesso!`);
    console.log('');
    console.log('Distribuição por slide:');

    const bySlide = {};
    data.forEach(q => {
        bySlide[q.slide_index] = (bySlide[q.slide_index] || 0) + 1;
    });

    Object.entries(bySlide).forEach(([slide, count]) => {
        console.log(`  Slide ${slide}: ${count} pergunta(s)`);
    });
}

seedQuestions().catch(console.error);
