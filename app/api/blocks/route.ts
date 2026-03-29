import { NextResponse } from 'next/server';
import { blockchainManager } from '@/lib/blockchain';
import { supabase } from '@/lib/db';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';
import { Block } from '@/types/block';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBlock: Block = body.block;

    if (!newBlock || !newBlock.hash_actual) {
      return NextResponse.json({ error: "Invalid block payload" }, { status: 400 });
    }

    // Get current last hash from Supabase to ensure the chain connects
    const lastBlockHash = await blockchainManager.getLastBlockHash();

    // Validate the incoming block 
    const isValid = blockchainManager.isValidBlock(newBlock, { hash: lastBlockHash });

    if (!isValid) {
      logger.warn(`Rejected invalid block from peer: ${newBlock.hash_actual}`);
      const resolveUrl = new URL('/api/nodes/resolve', request.url).href;
      fetch(resolveUrl, { method: 'GET' })
        .catch(err => logger.error("Fallo al detonar el auto-consenso", err));

      return NextResponse.json({ 
        error: "Block is invalid or out of sync. Auto-sync triggered." 
      }, { status: 409 });
    }

    // Block is valid. Save it to local Supabase ledger
    const { error: dbError } = await supabase
      .from('grados')
      .insert([{
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
      }]);

    if (dbError) {
      logger.error("Failed to save received block to Supabase", dbError);
      return NextResponse.json({ error: "Database error while saving block" }, { status: 500 });
    }

    logger.info(`Accepted and saved new block: ${newBlock.hash_actual}`);

    // Clean up the mempool
    nodeState.pendingTransactions = nodeState.pendingTransactions.filter(
      tx => tx.titulo_obtenido !== newBlock.titulo_obtenido || tx.persona_id !== newBlock.persona_id
    );

    return NextResponse.json({ message: "Block accepted" }, { status: 200 });

  } catch (error) {
    logger.error("Error processing incoming block", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}