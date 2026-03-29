import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { blockchainManager } from '@/lib/blockchain';
import { supabase } from '@/lib/db';
import { logger } from '@/lib/logger';
import { networkManager } from '@/lib/network';

export async function POST() {
  try {
    // Check if there are any transactions to mine
    if (nodeState.pendingTransactions.length === 0) {
      return NextResponse.json({ error: "No pending transactions to mine" }, { status: 400 });
    }

    // Take the first transaction from the mempool (FIFO)
    const txToMine = nodeState.pendingTransactions[0];
    const newBlock = await blockchainManager.mineTransaction(txToMine);

    // Save the newly mined block (grado) to Supabase 
    const { error: dbError } = await supabase
      .from('grados')
      .insert([
        {
          persona_id: newBlock.persona_id,
          institucion_id: newBlock.institucion_id,
          programa_id: newBlock.programa_id,
          fecha_inicio: newBlock.fecha_inicio,
          fecha_fin: newBlock.fecha_fin,
          titulo_obtenido: newBlock.titulo_obtenido,
          numero_cedula: newBlock.numero_cedula,
          titulo_tesis: newBlock.titulo_tesis,
          menciones: newBlock.menciones,
          hash_actual: newBlock.hash_actual,
          hash_anterior: newBlock.hash_anterior,
          nonce: newBlock.nonce,
          firmado_por: newBlock.firmado_por,
        }
      ]);

    if (dbError) {
      logger.error("Failed to save block to Supabase", dbError);
      return NextResponse.json({ error: "Failed to save block" }, { status: 500 });
    }

    // Remove the transaction from pending list now that its mined
    nodeState.pendingTransactions.shift();

    // TODO: Propagate this new block to other ZeroTier peers
    networkManager.broadcastBlock(newBlock).catch(err => 
      logger.error("Error propagando el bloque en segundo plano", err)
    );
    
    return NextResponse.json({ message: "Block mined successfully", block: newBlock }, { status: 200 });

  } catch (error) {
    logger.error("Mining error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}