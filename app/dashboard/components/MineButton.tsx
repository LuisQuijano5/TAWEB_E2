"use client";

import { useState } from 'react';

export default function MineButton() {
  const [status, setStatus] = useState('');
  const [mining, setMining] = useState(false);

  const handleMine = async () => {
    setMining(true);
    setStatus('Mineros trabajando (Proof of Work en progreso)...');
    
    try {
      const res = await fetch('/api/mine', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatus(`Bloque minado con éxito! Hash: ${data.block.hash_actual.substring(0, 15)}...`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Error de conexión al minar.');
    }
    setMining(false);
  };

  return (
    <div className="p-5 border rounded-lg shadow-sm bg-white mt-6">
      <h2 className="text-xl text-gray-800 font-bold mb-4 border-b pb-2">2. Minar Bloque Local</h2>
      <p className="text-sm text-gray-600 mb-4">
        Toma la primera transacción pendiente y ejecuta el Proof of Work para agregarla a Supabase.
      </p>
      
      <button 
        onClick={handleMine} 
        disabled={mining}
        className={`w-full p-3 rounded font-bold text-white transition-colors ${mining ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
      >
        {mining ? 'Minando...' : 'Minar Transacciones Pendientes'}
      </button>

      {status && <p className="mt-4 text-sm font-medium p-2 bg-gray-50 rounded border">{status}</p>}
    </div>
  );
}