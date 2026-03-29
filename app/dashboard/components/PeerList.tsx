"use client";

import { useState, useEffect } from 'react';

export default function PeerList() {
  const [peers, setPeers] = useState<any[]>([]);
  const [newPeerUrl, setNewPeerUrl] = useState('');
  const [status, setStatus] = useState('');

  const fetchPeers = async () => {
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      setPeers(data.peers || []);
    } catch (error) {
      console.error("Error fetching peers", error);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, []);

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setStatus('Agregando nodo...');
    
    try {
      // Llamamos a nuestro PROPIO endpoint oficial para registrar un nodo en nuestra libreta
      const res = await fetch('/api/nodes/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: newPeerUrl }),
      });

      if (res.ok) {
        setStatus('Nodo agregado con éxito.');
        setNewPeerUrl('');
        fetchPeers(); 
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error || 'No se pudo agregar el nodo'}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('Error de red interno.');
    }
  };

  return (
    <div className="p-5 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Red de Nodos</h2>
      
      <form onSubmit={handleRegister} className="flex gap-2 mb-4">
        <input 
          type="url" 
          placeholder="URL del Nodo (Ej. http://node-2:3000)" 
          value={newPeerUrl}
          onChange={(e) => setNewPeerUrl(e.target.value)}
          className="border p-2 rounded flex-grow text-sm bg-white text-gray-900 border-gray-300"
          required 
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700 transition-colors">
          Agregar
        </button>
      </form>
      {status && <p className="text-xs mb-3 font-medium text-gray-600">{status}</p>}

      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Nodos Registrados ({peers.length})</h3>
        {peers.length === 0 ? (
          <p className="text-sm text-gray-400">No hay nodos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {peers.map((peer, idx) => (
              <li key={idx} className="text-sm bg-gray-50 p-2 border rounded flex justify-between items-center text-gray-800">
                <span className="font-mono">{peer.url || peer}</span>
                <span className="text-green-500 font-bold text-xs">● Registrado</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}