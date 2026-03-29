export interface Block{
    persona_id: string;
    institucion_id: string;
    programa_id: string;
    fecha_inicio?: string;
    fecha_fin: string;
    titulo_obtenido: string;
    numero_cedula?: string;
    titulo_tesis?: string;
    menciones?: string;
    firmado_por: string;
    
    // block
    hash_actual: string,
    hash_anterior: string,
    nonce: number,
}