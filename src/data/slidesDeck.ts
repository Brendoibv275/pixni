/**
 * PIXNI I.Academy – Deck Completo de Slides
 * 
 * Cada slide define:
 * - index: número do slide (auto-gerado pela posição no array)
 * - title: título exibido no telão e no mobile
 * - content: texto principal do slide
 * - bullets: pontos-chave (opcionais)
 * - state: qual estado a máquina de estados deve assumir
 * - notes: notas do apresentador (visíveis apenas no admin)
 * - icon: emoji representativo
 */

export type SlideState = 'SLIDE_CONTENT' | 'POLL_ACTIVE' | 'BROKEN_TELEPHONE' | 'AI_PROMPT_BUILDER' | 'RAG_VISUALIZER' | 'AGENT_SIMULATOR' | 'END_SESSION';

export interface Slide {
    title: string;
    content: string;
    bullets?: string[];
    state: SlideState;
    notes?: string;
    icon?: string;
    phase?: string;
}

export const SLIDES_DECK: Slide[] = [
    // =====================================================
    //  SLIDE 0 – Capa
    // =====================================================
    {
        title: "Pixni - I.Academy",
        content: "Bem-vindos à revolução digital. Hoje vocês deixam de ser usuários e se tornam Arquitetos de IA.",
        state: 'SLIDE_CONTENT',
        notes: "Esperar todos escanearem o QR Code e entrarem na sala. Mostrar o PIN no projetor.",
        icon: "🚀",
        phase: "Abertura"
    },

    // =====================================================
    //  SLIDE 1 – Quebra-Gelo (4 perguntas)
    // =====================================================
    {
        title: "Quebra-Gelo: Mapeamento da Turma",
        content: "Vamos descobrir o nível e as expectativas de cada um com 4 perguntas rápidas no seu celular.",
        state: 'POLL_ACTIVE',
        notes: "São 4 perguntas sequenciais: ecossistema, frequência, nível 0-10, e expectativa. Resultados ao vivo no telão.",
        icon: "🎯",
        phase: "Quebra-Gelo"
    },

    // =====================================================
    //  SLIDES 2-5 – Introdução ao Ecossistema de IA
    // =====================================================
    {
        title: "O que é Inteligência Artificial?",
        content: "IA não é um \"ser pensante\". É um ecossistema de ferramentas matemáticas treinadas para reconhecer padrões em dados.",
        bullets: [
            "IA é um campo da computação, não uma entidade única",
            "Machine Learning, Deep Learning e LLMs são subcategorias",
            "As LLMs (Large Language Models) são apenas uma parte desse todo"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Desmistificar: IA não é magia, é matemática aplicada a linguagem.",
        icon: "🧠",
        phase: "Introdução"
    },

    {
        title: "LLMs: A Revolução da Comunicação",
        content: "As LLMs (Gemini, GPT, Claude) são a forma mais funcional que já criamos para nos comunicar com computadores.",
        bullets: [
            "Antes: precisávamos programar em código para o computador entender",
            "Agora: literalmente PEDIMOS em linguagem natural – e ele entende",
            "A comunicação humano-máquina mudou para sempre"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Dar exemplo prático: 'Gere um relatório 5W2H sobre o projeto X'. Antes levava horas, agora leva 10 segundos.",
        icon: "💬",
        phase: "Introdução"
    },

    {
        title: "A Mágica das APIs",
        content: "Como tiramos a IA de dentro do site do Google e colocamos dentro dos NOSSOS sistemas? Com uma mágica chamada API.",
        bullets: [
            "API = garçom – leva o pedido da mesa (nosso sistema) até a cozinha (a IA)",
            "Com uma API, a IA trabalha DENTRO da nossa ferramenta",
            "Podemos criar assistentes, analisadores, classificadores... tudo personalizado"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Analogia do restaurante: o garçom (API) não cozinha, mas sem ele nada chega à mesa.",
        icon: "🔌",
        phase: "Introdução"
    },

    {
        title: "Ecossistema Completo de IA",
        content: "Hoje não existe apenas um tipo de IA. Temos ferramentas especializadas para cada necessidade.",
        bullets: [
            "Texto e Chat: Gemini, GPT, Claude",
            "Imagens: Midjourney, Leonardo AI, DALL-E",
            "Código: Cursor, GitHub Copilot, Windsurf",
            "Automação: n8n, Make, Zapier com IA",
            "Vídeo e Áudio: Suno, Runway, ElevenLabs"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Mostrar que o ecossistema vai muito além do ChatGPT. Cada ferramenta resolve um problema diferente.",
        icon: "🌐",
        phase: "Introdução"
    },

    // =====================================================
    //  SLIDE 6 – Quiz Fixação Introdução (2 perguntas)
    // =====================================================
    {
        title: "Quiz Rápido: APIs e LLMs",
        content: "Vamos testar o que absorveram sobre APIs e LLMs com 2 perguntas rápidas.",
        state: 'POLL_ACTIVE',
        notes: "2 perguntas de múltipla escolha sobre API e revolução prática das LLMs.",
        icon: "📝",
        phase: "Introdução"
    },

    // =====================================================
    //  SLIDES 7-11 – Módulo 1: Sistema Operacional da IA
    // =====================================================
    {
        title: "Módulo 1: O Sistema Operacional da IA",
        content: "Agora que entendemos O QUE é IA, vamos entender COMO ela funciona por baixo dos panos.",
        state: 'SLIDE_CONTENT',
        notes: "Transição: agora vamos falar de como os modelos pensam (spoiler: eles não pensam, eles preveem).",
        icon: "⚙️",
        phase: "Módulo 1"
    },

    {
        title: "IA vs Google: Previsão vs Busca",
        content: "O Google BUSCA páginas em um índice gigante. A IA PREVÊ qual deveria ser a próxima palavra com base em tudo que ela já 'leu'.",
        bullets: [
            "Google: vai até um banco de dados e acha um link → você lê",
            "IA: calcula matematicamente qual resposta tem mais probabilidade de estar certa",
            "Por isso a IA pode 'inventar' respostas – ela não tem certeza, ela estima"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Diferença crucial: a IA não tem um banco de dados que ela consulta, ela calcula previsões estatísticas.",
        icon: "🔎",
        phase: "Módulo 1"
    },

    {
        title: "Tokens e Janela de Contexto",
        content: "A IA não lê palavras, ela lê TOKENS. E ela tem um limite: a Janela de Contexto é a 'memória de curto prazo'.",
        bullets: [
            "1 palavra ≈ 1.3 tokens (em inglês), em português pode ser mais",
            "Janela de Contexto = quanto a IA 'lembra' de uma conversa",
            "Gemini 2.0: ~2 milhões de tokens | GPT-4: ~128 mil tokens",
            "Se estourar a janela, a IA ESQUECE o começo da conversa"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Analogia: é como uma mesa de trabalho. Quanto maior a mesa, mais documentos cabem. Mas se encher demais, os primeiros caem no chão.",
        icon: "📏",
        phase: "Módulo 1"
    },

    {
        title: "Alucinação: Quando a IA 'Inventa'",
        content: "Se a IA é um motor de previsão e não tem o dado exato, ela 'chuta' – com a confiança de quem tem certeza.",
        bullets: [
            "Alucinação = a IA gera conteúdo falso mas convincente",
            "Acontece porque ela PREVÊ padrões, mesmo sem fatos",
            "Solução: dar CONTEXTO preciso (documentos, dados, exemplos)",
            "Veremos como RAG resolve isso à frente"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Exemplo clássico: pedir jurisprudência ao GPT – ele inventa número de processo, relator, tudo com cara de real.",
        icon: "🤥",
        phase: "Módulo 1"
    },

    {
        title: "O Prompt: O Volante da IA",
        content: "Se a IA é o motor, o Prompt é o VOLANTE. A qualidade do comando define a qualidade da resposta.",
        bullets: [
            "Prompt ruim → resposta genérica e inútil",
            "Prompt bem feito → resposta cirúrgica e útil",
            "Engenharia de Prompt é a habilidade nº1 para dominar IA",
            "Vamos praticar isso no Módulo 2"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Transição para a pausa: deixar eles mastigando esse conceito. Depois voltamos com quiz pós-pausa.",
        icon: "🎮",
        phase: "Módulo 1"
    },

    // =====================================================
    //  SLIDE 12 – PAUSA CAFÉ
    // =====================================================
    {
        title: "☕ Intervalo Estratégico",
        content: "Pausa de 15 minutos. Aproveite para revisar as perguntas no seu celular e pensar nas dúvidas para o Q&A.",
        bullets: [
            "Use o botão flutuante no canto do celular para enviar dúvidas",
            "Quando voltarmos, tenho 2 perguntas para ver se estão acordados 😉"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Revisar o painel de Q&A durante a pausa. Selecionar as 2-3 melhores perguntas para responder ao voltar.",
        icon: "☕",
        phase: "Intervalo"
    },

    // =====================================================
    //  SLIDE 13 – Quiz Pós-Pausa (2 perguntas)
    // =====================================================
    {
        title: "Quiz Pós-Pausa: Teste de Atenção",
        content: "Vamos ver quem prestou atenção antes do café! 2 perguntas sobre o Módulo 1.",
        state: 'POLL_ACTIVE',
        notes: "2 perguntas: alucinação e janela de contexto. Mostrar gráficos ao vivo.",
        icon: "⚡",
        phase: "Módulo 1"
    },

    // =====================================================
    //  SLIDES 14-16 – Módulo 2: Engenharia de Prompt
    // =====================================================
    {
        title: "Módulo 2: Engenharia de Prompt Corporativa",
        content: "Chegou a hora de converter teoria em prática. Vamos aprender a construir comandos que fazem a IA trabalhar POR nós.",
        state: 'SLIDE_CONTENT',
        notes: "Abertura do módulo mais prático. A partir daqui, eles vão criar coisas no celular.",
        icon: "🏗️",
        phase: "Módulo 2"
    },

    {
        title: "Anatomia do Prompt Perfeito",
        content: "Todo prompt de alta performance segue um framework de 4 blocos:",
        bullets: [
            "🎭 PERSONA: 'Aja como um consultor sênior do Sebrae...'",
            "📋 CONTEXTO: 'Estou analisando um edital de licitação de R$500 mil...'",
            "🎯 TAREFA: 'Liste os 5 principais riscos deste edital...'",
            "📐 FORMATO: 'Retorne em uma tabela com colunas: Risco | Impacto | Mitigação'"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Mostrar lado a lado: prompt amador vs prompt com framework. A diferença é brutal.",
        icon: "📐",
        phase: "Módulo 2"
    },

    {
        title: "Exemplo: Prompt Amador vs Engenheirado",
        content: "Veja a diferença entre pedir algo 'de qualquer jeito' e usar o framework:",
        bullets: [
            "❌ Amador: 'Me fala sobre editais'",
            "✅ Engenheirado: 'Persona: Consultor sênior especialista em editais do Sebrae. Contexto: Tenho um edital de pregão eletrônico Nº 023/2025 da Prefeitura de BH, valor R$480.000. Tarefa: Analise os requisitos de habilitação e liste riscos de inabilitação. Formato: Tabela com Requisito | Risco | Recomendação.'",
            "A resposta do segundo é 10x mais útil e precisa"
        ],
        state: 'SLIDE_CONTENT',
        notes: "Se possível, rodar o prompt engenheirado ao vivo no Gemini e mostrar a resposta. Impacto visual enorme.",
        icon: "⚡",
        phase: "Módulo 2"
    },

    // =====================================================
    //  SLIDE 17 – Telefone sem Fio (Gamificação)
    // =====================================================
    {
        title: "🎮 Dinâmica: Telefone sem Fio da IA",
        content: "Sua missão: criar o PIOR PROMPT POSSÍVEL para o cenário no telão. Vamos ver quem consegue a resposta mais absurda!",
        bullets: [
            "Cenário: Um gerente quer usar IA para analisar NFs",
            "Escreva o prompt mais vago e confuso que conseguir",
            "Os piores (melhores) aparecerão no telão em tempo real"
        ],
        state: 'BROKEN_TELEPHONE',
        notes: "Gamificação! Depois de mostrar os piores prompts, usar um deles para rodar na IA ao vivo e mostrar a resposta caótica.",
        icon: "📞",
        phase: "Módulo 2"
    },

    // =====================================================
    //  SLIDE 18 – AI Prompt Builder (Interação com Gemini)
    // =====================================================
    {
        title: "Construtor de Prompts com IA",
        content: "Agora vamos criar o SEU prompt perfeito. Responda 3 perguntas no celular e a IA vai gerar um prompt profissional sob medida para você.",
        bullets: [
            "Passo 1: Qual é o seu cargo ou o que você faz?",
            "Passo 2: Qual tarefa mais consome seu tempo?",
            "Passo 3: Qual seria o resultado ideal?",
            "A IA vai usar o framework Persona+Contexto+Tarefa+Formato para gerar o prompt"
        ],
        state: 'AI_PROMPT_BUILDER',
        notes: "Motor do Gemini no backend. Os resultados podem ser projetados no telão se quiser compartilhar os melhores.",
        icon: "🤖",
        phase: "Módulo 2"
    },

    // =====================================================
    //  SLIDES 19-20 – Fechamento: Agentes e RAG
    // =====================================================
    {
        title: "A Mágica do RAG (Retrieval-Augmented Generation)",
        content: "Como fazemos a IA ler APENAS os documentos da PIXNI e parar de inventar coisas? Fazendo ela 'pescar' a resposta antes de falar.",
        bullets: [
            "Não mandamos a IA decorar manuais, damos uma LUPA para ela",
            "Passo 1: A IA busca a informação exata no seu PDF",
            "Passo 2: Ela lê apenas aquele trecho",
            "Passo 3: Ela responde baseada 100% no seu documento"
        ],
        state: 'RAG_VISUALIZER',
        notes: "Explicar visualmente. Esta tela vai mostrar uma animação interativa de como a busca funciona antes da geração.",
        icon: "📚",
        phase: "Fechamento"
    },

    {
        title: "Dando 'Corpo' à IA: O Funcionário Digital",
        content: "Chat é passivo (espera ordens). Um Agente é ativo: ele tem ferramentas, objetivos e trabalha sozinho enquanto você toma café.",
        bullets: [
            "Agente pensa: 'O que preciso fazer?' → 'Qual ferramenta uso?'",
            "Exemplo Prático: Um Agente que recebe um Edital, lê, extrai os prazos e te manda um resumo no WhatsApp",
            "Vamos ver isso acontecendo agora na prática!"
        ],
        state: 'AGENT_SIMULATOR',
        notes: "A tela via mostrar um Agente trabalhando em passos lógicos: Recebendo -> Lendo -> Extraindo -> Resumindo.",
        icon: "🤖",
        phase: "Fechamento"
    },

    // =====================================================
    //  SLIDE 21 – Gran Finale / Dossiê
    // =====================================================
    {
        title: "🎓 Missão Cumprida! Baixe seu Dossiê",
        content: "Parabéns, Arquiteto! Seu dossiê personalizado está pronto com os resultados dos quizzes, o resumo da aula e o seu Prompt sob medida.",
        bullets: [
            "📊 Seu desempenho nos quizzes",
            "📝 Resumo dos conceitos: LLM, API, Prompt, RAG, Agentes",
            "🎯 Seu Prompt de Alta Performance personalizado",
            "Clique no botão abaixo para baixar o PDF"
        ],
        state: 'END_SESSION',
        notes: "Projetar no telão: 'Parabéns! Baixem o dossiê no celular.' Agradecer e encaminhar para o almoço.",
        icon: "🎓",
        phase: "Encerramento"
    }
];

// Helpers
export const TOTAL_SLIDES = SLIDES_DECK.length;

export function getSlide(index: number): Slide {
    return SLIDES_DECK[Math.min(Math.max(0, index), SLIDES_DECK.length - 1)];
}

export function getSlideState(index: number): SlideState {
    return getSlide(index).state;
}

// Respostas corretas para cálculo de score no PDF
export const CORRECT_ANSWERS: Record<number, Record<number, string>> = {
    // slide_index -> { question_local_index -> answer_text }
    // Slide 6 – Quiz APIs
    6: {
        0: "Através de uma 'ponte' chamada API, que conecta nosso aplicativo ao cérebro da IA",
        1: "Permitem delegar tarefas complexas para o computador usando a nossa língua do dia a dia"
    },
    // Slide 13 – Quiz Pós-Pausa  
    13: {
        0: "Porque ela é uma máquina de adivinhação estatística que preencheu lacunas com falta de contexto real",
        1: "Ela esquece o início porque sua 'memória de curto prazo' esgotou"
    }
};
