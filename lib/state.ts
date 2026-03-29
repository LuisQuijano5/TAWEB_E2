import { Transaction } from '../types/transaction';
import { Peer } from '../types/peer';

class NodeState {
  public pendingTransactions: Transaction[] = []; 
  public peers: Peer[] = [];

  addTransaction(tx: Transaction) {
    this.pendingTransactions.push(tx);
  }

  clearPendingTransactions() {
    this.pendingTransactions = [];
  }

  addPeer(peerUrl: string): boolean {
    if (!this.peers.find(p => p.url === peerUrl)) {
      this.peers.push({ url: peerUrl, lastSeen: Date.now(), failures: 0 });
      return true; 
    }
    return false; 
  }

  getPeers(): string[] {
    return this.peers.map(p => p.url);
  }

  incrementFailure(peerUrl: string) {
    const peer = this.peers.find(p => p.url === peerUrl);
    if (peer) {
      peer.failures += 1;
    }
  }

  removeDeadPeers(maxFailures: number = 3) {
    this.peers = this.peers.filter(p => p.failures < maxFailures);
  }
}

export const nodeState = new NodeState();