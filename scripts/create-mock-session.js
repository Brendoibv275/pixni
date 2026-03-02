const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Carregar variáveis do .env manualmente para este script puro
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Variáveis do Supabase não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('⏳ Gerando sessão de teste na nuvem...');

    // 2. Tenta inserir uma Sessão Fixa (PIN: 123456)
    const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
            pin: 'PIXNI1',
            current_slide_index: 0,
            current_state: 'SLIDE_CONTENT',
            is_active: true
        })
        .select()
        .single();

    if (sessionError) {
        if (sessionError.code === '23505') {
            console.log('✅ A sessão de testes PIXNI1 já existe no banco!');

            // Força colocar no estado inicial de qualquer maneira
            await supabase.from('sessions').update({ current_state: 'SLIDE_CONTENT' }).eq('pin', 'PIXNI1');
            process.exit(0);
        } else {
            console.error('❌ Erro:', sessionError.message);
            process.exit(1);
        }
    }

    console.log(`✅ Sessão Criada com Sucesso!`);
    console.log('--------------------------------------------------');
    console.log(`🔑 PIN DA SALA DE TESTE: PIXNI1`);
    console.log(`🔗 Link de Acesso: http://localhost:3000/`);
    console.log('--------------------------------------------------');
}

main();
