"use client";

import { useState, useEffect } from 'react';

export default function MineButton() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchMempool = async () => {
    try {
      const res = await fetch('/api/transactions', { cache: 'no-store' }); 
      const data = await res.json();
      
      setPendingCount(data.transactions?.length || 0);
    } catch (error) {
      console.error("Error al consultar mempool");
    }
  };

  useEffect(() => {
    fetchMempool();
    const interval = setInterval(fetchMempool, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMine = async () => {
    setLoading(true);
    setStatus('Minando bloque...  (Resolviendo Proof of Work)');
    
    try {
      const res = await fetch('/api/mine', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatus(`¡Bloque minado! Hash: ${data.block?.hash_actual || 'Exitoso'}`);
        fetchMempool(); 
        
        setTimeout(() => window.location.reload(), 2000); 
      } else {
        setStatus(`Error: ${data.error || 'No se pudo minar'}`);
      }
    } catch (error) {
      setStatus('Error de conexión al minar.');
    }
    setLoading(false);
  };

  return (
    <div className="p-5 border rounded-lg shadow-sm bg-white mt-4 border-orange-200">
      
      {/* ENCABEZADO CON INDICADOR DE MEMPOOL */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-orange-800">2. Minar Bloque</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
          pendingCount > 0 
            ? 'bg-orange-100 text-orange-700 border border-orange-300 animate-pulse' 
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {pendingCount} {pendingCount === 1 ? 'Tx en Mempool' : 'Txs en Mempool'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Toma <strong className="text-orange-600">la transacción más antigua</strong> en espera, resuelve el acertijo criptográfico y añádela a la Blockchain.
      </p>

      {/* BOTÓN INTELIGENTE */}
      <button 
        onClick={handleMine} 
        disabled={loading || pendingCount === 0}
        className={`w-full p-3 rounded font-bold text-white transition-all ${
          loading 
            ? 'bg-orange-300 cursor-wait' 
            : pendingCount === 0 
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-md'
        }`}
      >
        {loading ? 'Procesando (PoW)...' : pendingCount === 0 ? 'Mempool Vacío' : 'Minar Siguiente Transacción'}
      </button>
      
      {status && <p className="mt-3 text-sm font-medium p-2 bg-orange-50 text-orange-900 rounded border border-orange-100">{status}</p>}
    </div>
  );
}