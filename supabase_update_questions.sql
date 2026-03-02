-- Script de Atualização das Perguntas do PIXNI Academy
-- Execute este script no SQL Editor do Supabase para atualizar as perguntas e alternativas.

-- 1. Janela de Contexto (Slide 13)
UPDATE public.questions
SET 
  question_text = 'Você pediu para a IA resumir um edital enorme e ela ''cortou'' o final ou parou de responder. O que aconteceu?',
  options = '["A internet caiu do lado do Google", "Ela esquece o início porque sua ''memória de curto prazo'' esgotou", "A IA não sabe ler documentos maiores que 10 páginas"]'::jsonb
WHERE id = '0c790b1e-7505-4c43-a60e-580f93e543ad';

-- 2. Revolução Prática LLMs (Slide 6)
UPDATE public.questions
SET 
  question_text = 'No ambiente corporativo, qual o verdadeiro poder das ferramentas de IA para um consultor?',
  options = '["Elas buscam informações no Google mais rápido", "Permitem delegar tarefas complexas para o computador usando a nossa língua do dia a dia", "Substituem completamente a necessidade de ler documentos"]'::jsonb
WHERE id = '2be8f1d4-885a-4b12-8672-3e7ff51c2fe7';

-- 3. Definição de API (Slide 6)
UPDATE public.questions
SET 
  question_text = 'Como a PIXNI consegue colocar a inteligência do Gemini dentro do seu próprio sistema interno?',
  options = '["Comprando os computadores do Google", "Através de uma ''ponte'' chamada API, que conecta nosso aplicativo ao cérebro da IA", "Criando uma rede social interna"]'::jsonb
WHERE id = '6065fb15-5f6e-4d44-8ea7-a44f9d385e12';

-- 4. Alucinação (Slide 13)
UPDATE public.questions
SET 
  question_text = 'O consultor pediu um modelo de plano e a IA inventou dados falsos da empresa com extrema confiança. Por que?',
  options = '["Porque ela é uma máquina de adivinhação estatística que preencheu lacunas com falta de contexto real", "Porque os programadores configuraram a ferramenta para mentir em assuntos corporativos", "Porque ela copiou informações de um site concorrente"]'::jsonb
WHERE id = '7ebaf6c8-1a2a-44b3-80f1-6bae657112e9';

-- 5. Pior Prompt (Slide 17)
UPDATE public.questions
SET 
  question_text = 'Cenário: Você precisa que a IA leia um balanço financeiro de 40 páginas e extraia só o faturamento e lucros. Crie o PIOR PROMPT possível para isso!'
WHERE id = 'b79cc5a4-0245-4f97-85e2-99c6d5d81422';

-- Dica: O JSONB no Supabase precisa ser formatado exatamente e escapado se contiver aspas duplas, 
-- por isso o cast explícito ::jsonb no final do array.
