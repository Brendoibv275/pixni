-- Executa este SQL no Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS public.qa_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.qa_messages ENABLE ROW LEVEL SECURITY;

-- Políticas (drop+create para evitar erros de duplicata)
DROP POLICY IF EXISTS "Allow insert qa_messages" ON public.qa_messages;
CREATE POLICY "Allow insert qa_messages" ON public.qa_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select qa_messages" ON public.qa_messages;
CREATE POLICY "Allow select qa_messages" ON public.qa_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update qa_messages" ON public.qa_messages;
CREATE POLICY "Allow update qa_messages" ON public.qa_messages FOR UPDATE USING (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qa_messages;
