import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { data, error } = await supabase.from('programas').select('*');
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error("Error fetching programas", error);
    return NextResponse.json({ error: "Failed to fetch programas" }, { status: 500 });
  }
}