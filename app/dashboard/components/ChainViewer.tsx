"use client";

import { useState, useEffect } from 'react';

export default function ChainViewer() {
  const [chain, setChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chain');
      const data = await res.json();
      if (data.chain) {
        setChain(data.chain);
      }
    } catch (error) {
      console.error("Error fetching chain:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChain();
  }, []);

  return (
    <div className="p-4 border rounded shadow-sm bg-gray-50 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-gray-800 font-bold">Explorador de Blockchain</h2>
        <button onClick={fetchChain} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
          Actualizar Cadena
        </button>
      </div>

      {loading ? (
        <p className="text-gray-800">Cargando bloques...</p>
      ) : chain.length === 0 ? (
        <p className="text-gray-800">La cadena está vacía (Solo bloque génesis o sin datos).</p>
      ) : (
        <div className="flex flex-col gap-4">
          {chain.map((block, index) => (
            <div key={block.id || index} className="p-3 border bg-white rounded shadow-sm overflow-x-auto">
              <p className="font-bold text-gray-600 text-lg">Bloque #{index}</p>
              <p className="text-sm text-gray-600"><strong>Hash:</strong> {block.hash_actual}</p>
              <p className="text-sm text-gray-600"><strong>Anterior:</strong> {block.hash_anterior || "0 (Génesis)"}</p>
              <p className="text-sm text-gray-600"><strong>Nonce:</strong> {block.nonce}</p>
              <div className="mt-2 text-sm  text-gray-600 bg-gray-100 p-2 rounded">
                <strong>Datos:</strong> {block.titulo_obtenido} (Firma: {block.firmado_por})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}