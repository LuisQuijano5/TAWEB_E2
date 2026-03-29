import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';
import { Transaction } from '@/types/transaction';

export async function POST(request: Request) {
  try {
    const tx: Transaction = await request.json();

    // Basic Validation
    if (!tx.persona_id || !tx.institucion_id || !tx.titulo_obtenido || !tx.fecha_fin || !tx.firmado_por) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Add to local mempool
    nodeState.addTransaction(tx);
    logger.info(`Received propagated transaction from peer: ${tx.titulo_obtenido}`);

    return NextResponse.json({ message: "Propagated transaction processed" }, { status: 200 });

  } catch (error) {
    logger.error("Error processing internal transaction", error);
    return NextResponse.json({ error: "Invalid transaction format" }, { status: 400 });
  }
}