// FALTARIA IMPLEMENTAR LA LOGICA DE ELIMINADO EN OTROS LADOS
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}