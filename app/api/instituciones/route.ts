import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { data, error } = await supabase.from('instituciones').select('*');
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error("Error fetching instituciones", error);
    return NextResponse.json({ error: "Failed to fetch instituciones" }, { status: 500 });
  }
}