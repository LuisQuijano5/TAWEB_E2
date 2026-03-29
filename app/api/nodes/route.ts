import { NextResponse } from 'next/server';
import { nodeState } from '@/lib/state';

export async function GET() {
  const peers = nodeState.peers;
  
  return NextResponse.json({ peers }, { status: 200 });
}