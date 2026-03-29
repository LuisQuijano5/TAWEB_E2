import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { networkManager } from '@/lib/network'; 
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newNodeUrl = body.node;

    if (!newNodeUrl) {
      return NextResponse.json({ error: "Please provide a valid node URL" }, { status: 400 });
    }

    // Intentar agregarlo. addPeer ahora devuelve true si es nuevo.
    const isNewNode = nodeState.addPeer(newNodeUrl);
    
    if (isNewNode) {
      logger.info(`Nuevo nodo descubierto y registrado: ${newNodeUrl}`);
      
      // GOSSIP
      networkManager.broadcastNewPeer(newNodeUrl).catch(err => 
        logger.error("Error en el gossip de nodos", err)
      );
    } else {
      logger.info(`Nodo ya conocido ignorado: ${newNodeUrl}`);
    }

    // 3. Devolvemos nuestra lista actual para que el que preguntó también se actualice
    const currentPeers = nodeState.getPeers();

    return NextResponse.json({ 
      message: "Node registered successfully", 
      peers: currentPeers 
    }, { status: 200 });

  } catch (error) {
    logger.error("Error registering node", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}