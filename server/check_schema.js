import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('Checking profiles table schema...');
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('otp, otp_expires_at')
            .limit(1);

        if (error) {
            console.error('Schema Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Schema OK! Columns exist.');
        }
    } catch (err) {
        console.error('Caught Exception:', err);
    }
}

checkSchema();
