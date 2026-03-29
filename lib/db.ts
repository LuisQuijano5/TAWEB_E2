import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // Igual y se tiene que cambiar a la de service

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function validateTransactionReferences(
  persona_id: string, 
  institucion_id: string, 
  programa_id: string
): Promise<boolean> {
  try {
    const [p, i, prog] = await Promise.all([
      supabase.from('personas').select('id').eq('id', persona_id).single(),
      supabase.from('instituciones').select('id').eq('id', institucion_id).single(),
      supabase.from('programas').select('id').eq('id', programa_id).single()
    ]);

    if (p.error || i.error || prog.error) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}