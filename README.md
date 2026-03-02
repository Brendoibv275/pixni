# PIXNI - I.Academy 🚀

Plataforma interativa de aula ao vivo (estilo Kahoot + Mentimeter) para transformar profissionais em **Arquitetos de IA**.

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- npm (vem com o Node.js)
- Conta no [Supabase](https://supabase.com/) (já configurada)

## 🚀 Instalação

```bash
# 1. Entrar na pasta do projeto
cd "c:\Users\drbre\Downloads\Pix ni\aula pix\pixni-academy"

# 2. Instalar dependências
npm install

# 3. Popular as perguntas no banco de dados
node scripts/seed-questions.js

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

O app vai abrir em **http://localhost:3000**

## 🔑 Variáveis de Ambiente (`.env`)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `GEMINI_API_KEY` | Chave da API do Google Gemini (para o Construtor de Prompt) |

## 🧪 Como Testar

### Passo 1: Acessar como Administrador

1. Abra **http://localhost:3000/admin**
2. Digite um PIN (ex: `1234`) e clique em **"Criar/Entrar"**
3. Você será redirecionado para o **Dashboard do Admin**

### Passo 2: Acessar como Aluno (em outra aba)

1. Abra **http://localhost:3000** (em outra aba ou celular na mesma rede)
2. Digite o mesmo PIN (`1234`)
3. Digite seu nome e clique em **"Entrar na Sala"**

### Passo 3: Navegar pela Aula

No **Dashboard do Admin** (aba 1):
- Use o botão **►** para avançar slides
- Use o botão **◄** para voltar
- Observe o conteúdo mudar no telão E no celular ao mesmo tempo

### Estados Especiais (automáticos ao navegar):

| Slide | O que acontece |
|-------|---------------|
| **1** | Quiz Quebra-Gelo (4 perguntas) → aluno responde no celular |
| **6** | Quiz APIs (2 perguntas) |
| **13** | Quiz Pós-Pausa (2 perguntas) |
| **17** | 🎮 Telefone sem Fio → aluno escreve o pior prompt possível |
| **18** | 🤖 Construtor de Prompt → aluno preenche 3 passos e IA gera prompt |
| **21** | 🎓 Dossiê Final → aluno baixa PDF com resultados |

### Funcionalidades em tempo real:

- **Q&A**: O aluno pode clicar no botão flutuante 💬 para enviar dúvidas
- **Q&A Admin**: No admin, clique na aba "Q&A" para ver/resolver dúvidas
- **Alunos**: No admin, clique na aba "Alunos" para ver quem está conectado

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Login do aluno (PIN + nome)
│   ├── admin/
│   │   ├── page.tsx          # Login do admin (criar/entrar sala)
│   │   └── [session_id]/
│   │       └── page.tsx      # Dashboard do admin (telão)
│   ├── play/
│   │   └── [pin]/
│   │       └── page.tsx      # Tela do aluno (celular)
│   └── api/
│       └── generate-prompt/
│           └── route.ts      # API do Gemini para gerar prompts
├── components/
│   ├── admin/
│   │   ├── LivePollResults.tsx    # Gráficos ao vivo dos quizzes
│   │   ├── BrokenTelephoneBoard.tsx # Piores prompts no telão
│   │   ├── QABoard.tsx            # Painel de dúvidas
│   │   └── ParticipantsList.tsx   # Lista de alunos
│   └── mobile/
│       ├── PollActiveState.tsx    # Quiz no celular
│       ├── BrokenTelephoneState.tsx # Telefone sem fio
│       ├── AiPromptBuilderState.tsx # Construtor de prompt 3 passos
│       ├── EndSessionState.tsx    # Dossiê PDF
│       └── FloatingQA.tsx         # Botão de dúvidas
├── data/
│   └── slidesDeck.ts         # Conteúdo dos 22 slides da aula
├── hooks/
│   ├── useSession.ts         # Hook de sessão + realtime
│   └── useRealtimeAnswers.ts # Hook de respostas em tempo real
├── lib/
│   └── supabase/
│       └── client.ts         # Cliente Supabase
└── types/
    └── supabase.ts           # Tipos TypeScript do banco
```

## 🛠️ Tech Stack

- **Next.js 16** (App Router + TypeScript)
- **Tailwind CSS** + **Framer Motion**
- **Supabase** (PostgreSQL + Realtime WebSockets)
- **Google Gemini API** (geração de prompts)
- **jsPDF** (geração do dossiê PDF)
- **Recharts** (gráficos ao vivo)
- **Lucide React** (ícones)

## 📝 Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Rodar seed das perguntas
node scripts/seed-questions.js

# Build de produção
npm run build

# Iniciar em produção
npm start
```
