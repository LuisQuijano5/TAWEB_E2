import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { data, error } = await supabase.from('niveles_grado').select('*');
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error("Error fetching niveles de grado", error);
    return NextResponse.json({ error: "Failed to fetch niveles de grado" }, { status: 500 });
  }
}