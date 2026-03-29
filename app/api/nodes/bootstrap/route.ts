import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nodes: string[] = body.nodes;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "Please provide an array of node URLs" }, { status: 400 });
    }

    nodes.forEach(nodeUrl => {
      nodeState.addPeer(nodeUrl);
    });

    logger.info(`Bootstrapped ${nodes.length} nodes into the network.`);

    return NextResponse.json({ message: "Nodes added successfully" }, { status: 200 });

  } catch (error) {
    logger.error("Error bootstrapping nodes", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}