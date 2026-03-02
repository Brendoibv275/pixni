const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*');
    if (error) {
        console.error("Error reading sessions:", error);
    } else {
        console.log("Sessions found:", sessions.length);
        console.log(sessions.slice(0, 5));
    }
}
test();
