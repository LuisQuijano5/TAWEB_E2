import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';

export async function GET() {
  return NextResponse.json({ 
    peers: nodeState.getPeers(),
    pendingCount: nodeState.pendingTransactions.length 
  }, { status: 200 });
}