-- Adiciona a coluna admin_id à tabela sessions (referenciando o usuário autenticado do Supabase)
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);

-- Adiciona a coluna email aos participantes (será preenchido via formulário mobile)
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Habilitar RLS mais restritivo nas sessões
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 1. Permite que usuários autenticados criem sessões atreladas apenas ao seu ID
DROP POLICY IF EXISTS "Professores podem criar salas" ON public.sessions;
CREATE POLICY "Professores podem criar salas" 
  ON public.sessions FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- 2. Permite que professores editem e removam suas próprias sessões
DROP POLICY IF EXISTS "Professores gerenciam suas salas" ON public.sessions;
CREATE POLICY "Professores gerenciam suas salas" 
  ON public.sessions FOR UPDATE USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Professores apagam suas salas" ON public.sessions;
CREATE POLICY "Professores apagam suas salas" 
  ON public.sessions FOR DELETE USING (auth.uid() = admin_id);

-- 3. Todos podem ler todas as sessões ativas (essencial para o Aluno conseguir acessar/ver a sala)
DROP POLICY IF EXISTS "Todos podem ler sessões ativas" ON public.sessions;
CREATE POLICY "Todos podem ler sessões ativas"
  ON public.sessions FOR SELECT USING (is_active = true);

-- 4. O professor deve conseguir ler as próprias sessões (incluindo as não ativas/histórico)
DROP POLICY IF EXISTS "Professores leem as proprias salas" ON public.sessions;
CREATE POLICY "Professores leem as proprias salas"
  ON public.sessions FOR SELECT USING (auth.uid() = admin_id);
