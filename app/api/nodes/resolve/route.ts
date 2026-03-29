// app/api/nodes/resolve/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';
import { Block } from '@/types/block';

export async function GET() {
  try {
    // Get our current chain length from Supabase
    const { data: localChain, error } = await supabase
      .from('grados')
      .select('*')
      .order('creado_en', { ascending: true });

    if (error) throw error;

    let maxLength = localChain.length;
    let longestChain: Block[] | null = null;
    let newChainFound = false;

    const peers = nodeState.getPeers();
    logger.info(`Starting consensus resolution with ${peers.length} peers...`);

    // Ask every peer for their chain
    for (const peerUrl of peers) {
      try {
        const response = await fetch(`${peerUrl}/api/chain`);
        if (response.ok) {
          const data = await response.json();
          
          // If their chain is strictly longer, it becomes the new candidate
          if (data.length > maxLength) {
            maxLength = data.length;
            longestChain = data.chain;
            newChainFound = true;
          }
        }
      } catch (err) {
        logger.warn(`Could not fetch chain from peer: ${peerUrl}`);
      }
    }

    // If we found a valid longer chain, replace our database 
    if (newChainFound && longestChain) {
      logger.info(`Longer chain found! Replacing local chain of length ${localChain.length} with new length ${maxLength}`);
            
      // First, delete current records
      await supabase.from('grados').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      
      // Re-insert the new longest chain
      // We map it to ensure NOt to accidentally insert their primary id if they are different
      const chainToInsert = longestChain.map(block => ({
        persona_id: block.persona_id,
        institucion_id: block.institucion_id,
        programa_id: block.programa_id,
        fecha_inicio: block.fecha_inicio,
        fecha_fin: block.fecha_fin,
        titulo_obtenido: block.titulo_obtenido,
        numero_cedula: block.numero_cedula,
        titulo_tesis: block.titulo_tesis,
        menciones: block.menciones,
        hash_actual: block.hash_actual,
        hash_anterior: block.hash_anterior,
        nonce: block.nonce,
        firmado_por: block.firmado_por,
      }));

      const { error: insertError } = await supabase.from('grados').insert(chainToInsert);

      if (insertError) {
         logger.error("Failed to sync new chain to Supabase", insertError);
         return NextResponse.json({ error: "Failed to apply consensus" }, { status: 500 });
      }

      nodeState.pendingTransactions = nodeState.pendingTransactions.filter(tx => {
        const yaEstaMinada = longestChain.some(
          (bloque: any) => bloque.persona_id === tx.persona_id && bloque.programa_id === tx.programa_id
        );
        return !yaEstaMinada; // Si ya está minada, la descartamos.
      });

      return NextResponse.json({ 
        message: "Chain replaced", 
        chain: longestChain 
      }, { status: 200 });
    }

    // If we are already up to date
    return NextResponse.json({ 
      message: "Chain is authoritative", 
      chain: localChain 
    }, { status: 200 });

  } catch (error) {
    logger.error("Error during consensus resolution", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}