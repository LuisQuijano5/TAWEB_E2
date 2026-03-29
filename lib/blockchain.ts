import { generateBlockHash } from './hash';
import { logger } from './logger';
import { supabase } from './db';
import { Transaction } from '../types/transaction';
import { Block } from '../types/block';

const DIFFICULTY = 3; 
const TARGET_PREFIX = '0'.repeat(DIFFICULTY);

export class Blockchain {

  /**
   * Fetches the hash of the most recently mined block from Supabase.
   */
  public async getLastBlockHash(): Promise<string> {
    const { data, error } = await supabase
      .from('grados')
      .select('hash_actual')
      .order('creado_en', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info("No existing blocks found. Starting from Genesis.");
        return "0"; // Genesis prev hash
      }
      logger.error("Error fetching last block from DB", error);
      throw new Error("Database error");
    }

    return data.hash_actual;
  }

  public proofOfWork(tx: Transaction, hashAnterior: string): { nonce: number, hash: string } {
    let nonce = 0;
    let hash = '';
    logger.info(`Starting Proof of Work for degree: ${tx.titulo_obtenido}`);

    while (true) {
      hash = generateBlockHash(
        tx.persona_id,
        tx.institucion_id,
        tx.titulo_obtenido,
        tx.fecha_fin,
        hashAnterior,
        nonce
      );

      if (hash.startsWith(TARGET_PREFIX)) {
        logger.info(`Block mined! Nonce found: ${nonce}, Hash: ${hash}`);
        return { nonce, hash };
      }
      nonce++;
    }
  }

  /**
   * Takes a pending transaction, mines it, and formats it as a Block.
   */
  public async mineTransaction(tx: Transaction): Promise<Block> {
    const hashAnterior = await this.getLastBlockHash();
    
    const { nonce, hash } = this.proofOfWork(tx, hashAnterior);

    const newBlock: Block = {
      ...tx,
      hash_actual: hash,
      hash_anterior: hashAnterior,
      nonce: nonce,
    };

    return newBlock;
  }

  /**
   * Validates if an incoming block from another peer is legitimate
   */
  public isValidBlock(block: Block, previousBlockInfo: { hash: string }): boolean {
    // Check if the previous hash matches chain 
    if (block.hash_anterior !== previousBlockInfo.hash) {
      logger.warn(`Invalid block: previous hash mismatch.`);
      return false;
    }

    // Re-calculate the hash to ensure data integrity
    const recalculatedHash = generateBlockHash(
      block.persona_id,
      block.institucion_id,
      block.titulo_obtenido,
      block.fecha_fin,
      block.hash_anterior,
      block.nonce
    );

    if (recalculatedHash !== block.hash_actual) {
      logger.warn(`Invalid block: recalculated hash doesn't match hash_actual.`);
      return false;
    }

    // Verify Proof of Work 
    if (!block.hash_actual.startsWith(TARGET_PREFIX)) {
      logger.warn(`Invalid block: does not meet PoW difficulty.`);
      return false;
    }

    return true;
  }
}

export const blockchainManager = new Blockchain();