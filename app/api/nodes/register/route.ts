import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { node } = await request.json();

    if (!node) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

    if (node === process.env.MY_NODE_URL) {
      return NextResponse.json({ error: "No puedes conectarte a ti mismo." }, { status: 400 });
    }

    const isNew = nodeState.addPeer(node);
    if (!isNew) {
       return NextResponse.json({ error: "Este nodo ya está registrado." }, { status: 409 });
    }

    nodeState.addPeer(node);
    logger.info(`Nodo registrado manualmente: ${node}`);

    return NextResponse.json({ message: "Node registered successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}