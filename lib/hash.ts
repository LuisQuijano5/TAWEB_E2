import crypto from 'crypto';

export function generateBlockHash(
  personaId: string,
  institucionId: string,
  tituloObtenido: string,
  fechaFin: string,
  hashAnterior: string,
  nonce: number
): string {
  const dataToHash = `${personaId}${institucionId}${tituloObtenido}${fechaFin}${hashAnterior}${nonce}`;
  
  return crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');
}