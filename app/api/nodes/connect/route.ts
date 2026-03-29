import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { myNodeUrl, targetNodeUrl } = await request.json();

    logger.info(`Intentando conectar con peer: ${targetNodeUrl}`);

    // DOCKER
    const peerRes = await fetch(`${targetNodeUrl}/api/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node: myNodeUrl }),
    });

    if (!peerRes.ok) throw new Error("El nodo destino rechazó la conexión");

    // ObteneR los peers que el otro nodo conoce
    const peerData = await peerRes.json();
    const discoveredPeers: string[] = peerData.peers || [];

    // GUARDAR el nodo objetivo y a sus amigos en  memoria local
    nodeState.addPeer(targetNodeUrl);
    
    // Filtramos para no agregarnos a nosotros mismos
    discoveredPeers.forEach(peer => {
      if (peer !== myNodeUrl) {
        nodeState.addPeer(peer);
      }
    });
    logger.info(`Conexión exitosa. Se descubrieron ${discoveredPeers.length} nodos (excluyéndome a mí).`);

    return NextResponse.json({ 
      message: "Conectado", 
      discovered: discoveredPeers.length 
    }, { status: 200 });

  } catch (error) {
    logger.error("Error en el handshake con otro nodo", error);
    return NextResponse.json({ error: "No se pudo conectar con el nodo" }, { status: 500 });
  }
}