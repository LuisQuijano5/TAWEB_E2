import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { data: chain, error } = await supabase
      .from('grados')
      .select('*')
      .order('creado_en', { ascending: true });

    if (error) {
      logger.error("Error fetching blockchain from Supabase", error);
      return NextResponse.json({ error: "Failed to retrieve chain" }, { status: 500 });
    }

    return NextResponse.json({
      length: chain.length,
      chain: chain
    }, { status: 200 });

  } catch (error) {
    logger.error("Unexpected error fetching chain", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}