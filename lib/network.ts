import { nodeState } from './state';
import { logger } from './logger';
import { Transaction } from '../types/transaction';
import { Block } from '@/types/block';

export class NetworkManager {
  /**
   * Sends a transaction to all known peers 
   */
  public async broadcastTransaction(tx: Transaction) {
    const peers = nodeState.getPeers();
    
    if (peers.length === 0) {
      logger.info("No peers connected. Transaction saved locally only.");
      return;
    }

    logger.info(`Broadcasting transaction to ${peers.length} peers...`);

    // We use Promise.all to send requests to all peers simultaneously
    await Promise.all(
      peers.map(async (peerUrl) => {
        try {
          // We hit their /internal/transactions endpoint to avoid loops
          const response = await fetch(`${peerUrl}/api/internal/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tx),
          });

          if (!response.ok) {
            logger.warn(`Peer ${peerUrl} rejected transaction with status: ${response.status}`);
          }
        } catch (error) {
          logger.error(`Fallo de conexión con el nodo ${peerUrl}. Sumando fallo...`);
          nodeState.incrementFailure(peerUrl);
          nodeState.removeDeadPeers(3);
        }
      })
    );
  }

  /**
   * Envia un bloque 
   */
  public async broadcastBlock(block: Block) { 
    const peers = nodeState.getPeers();
    if (peers.length === 0) return;

    logger.info(`Propagando nuevo bloque minado a ${peers.length} nodos...`);

    await Promise.all(
      peers.map(async (peerUrl) => {
        try {
          const response = await fetch(`${peerUrl}/api/blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block }),
          });

          if (!response.ok) {
            logger.warn(`El nodo ${peerUrl} rechazó el bloque.`);
          }
        } catch (error) {
          logger.error(`Fallo de conexión con el nodo ${peerUrl}. Sumando fallo...`);
          nodeState.incrementFailure(peerUrl);
          nodeState.removeDeadPeers(3);
        }
      })
    );
  }

  public async broadcastNewPeer(newNodeUrl: string) {
    const peers = nodeState.getPeers();
    const peersToNotify = peers.filter(peerUrl => peerUrl !== newNodeUrl);
    
    if (peersToNotify.length === 0) return;

    logger.info(`Pasando el chisme del nuevo nodo ${newNodeUrl} a ${peersToNotify.length} contactos...`);

    await Promise.all(
      peersToNotify.map(async (peerUrl) => {
        try {
          await fetch(`${peerUrl}/api/nodes/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ node: newNodeUrl }),
          });
        } catch (error) {
          logger.warn(`No se le pudo pasar el chisme a ${peerUrl}`);
        }
      })
    );
  }
}

export const networkManager = new NetworkManager();