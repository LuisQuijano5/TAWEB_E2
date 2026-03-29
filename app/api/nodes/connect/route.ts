import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { myNodeUrl, targetNodeUrl } = await request.json();

    if (myNodeUrl === targetNodeUrl) {
      return NextResponse.json({ error: "Un nodo no puede conectarse a sí mismo." }, { status: 400 });
    }

    const peerRes = await fetch(`${targetNodeUrl}/api/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node: myNodeUrl }),
    });

    if (!peerRes.ok) throw new Error("El nodo destino rechazó la conexión");

    nodeState.addPeer(targetNodeUrl);

    logger.info(`Conexión manual exitosa con: ${targetNodeUrl}`);
    return NextResponse.json({ message: "Conectado" }, { status: 200 });

  } catch (error) {
    logger.error("Error al conectar con otro nodo", error);
    return NextResponse.json({ error: "No se pudo conectar con el nodo" }, { status: 500 });
  }
}