import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { networkManager } from '@/lib/network';
import { logger } from '@/lib/logger';
import { Transaction } from '@/types/transaction';
import { validateTransactionReferences } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const tx: Transaction = await request.json();

    // Basic Validation of TRANSACTION not BLOCK
    if (!tx.persona_id || !tx.institucion_id || !tx.titulo_obtenido || !tx.fecha_fin || !tx.firmado_por) {
      return NextResponse.json({ error: "Missing required transaction fields" }, { status: 400 });
    }

    const isValidDB = await validateTransactionReferences(tx.persona_id, tx.institucion_id, tx.programa_id);
    if (!isValidDB) {
      logger.warn(`Transacción rechazada: IDs no existen en la BD.`);
      return NextResponse.json({ error: "El alumno, institución o programa no existen" }, { status: 400 });
    }

    // Add to local mempool 
    nodeState.addTransaction(tx);
    logger.info(`New transaction added to local mempool: ${tx.titulo_obtenido}`);

    // Propagate 
    networkManager.broadcastTransaction(tx).catch(err => 
      logger.error("Error broadcasting transaction in background", err)
    );

    return NextResponse.json({ message: "Transaction accepted and broadcasted" }, { status: 200 });

  } catch (error) {
    logger.error("Error processing incoming transaction", error);
    return NextResponse.json({ error: "Invalid transaction format" }, { status: 400 });
  }
}