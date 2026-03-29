"use client";

import { useState, useEffect } from 'react';

export default function TransactionForm() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    persona_id: '',
    institucion_id: '',
    programa_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    titulo_obtenido: '',
    firmado_por: process.env.NEXT_PUBLIC_NODE_NAME || 'Nodo-Desconocido',
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/personas').then(res => res.json()),
      fetch('/api/instituciones').then(res => res.json()),
      fetch('/api/programas').then(res => res.json())
    ]).then(([personasData, instData, progData]) => {
      setPersonas(personasData || []);
      setInstituciones(instData || []);
      setProgramas(progData || []);
    }).catch(err => console.error("Error fetching base data", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Enviando y propagando...');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('Transacción en mempool y propagada.');
      } else {
        setStatus('Error al enviar la transacción.');
      }
    } catch (error) {
      setStatus('Error de red.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass = "border p-2 rounded w-full bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-5 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">1. Emitir Nuevo Grado</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <select name="persona_id" onChange={handleChange} className={inputClass} required value={formData.persona_id}>
          <option value="">-- Seleccionar Alumno --</option>
          {personas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido_paterno}</option>)}
        </select>

        <select name="institucion_id" onChange={handleChange} className={inputClass} required value={formData.institucion_id}>
          <option value="">-- Seleccionar Institución --</option>
          {instituciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>

        <select name="programa_id" onChange={handleChange} className={inputClass} required value={formData.programa_id}>
          <option value="">-- Seleccionar Programa --</option>
          {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="text-sm text-gray-600 mb-1 block">Fecha Inicio</label>
            <input type="date" name="fecha_inicio" onChange={handleChange} className={inputClass} />
          </div>
          <div className="w-1/2">
            <label className="text-sm text-gray-600 mb-1 block">Fecha Fin *</label>
            <input type="date" name="fecha_fin" onChange={handleChange} className={inputClass} required />
          </div>
        </div>

        <input name="titulo_obtenido" placeholder="Título Obtenido (Ej. Ing. en Sistemas)" onChange={handleChange} className={inputClass} required />
        <input name="firmado_por" placeholder="Firma del Nodo" value={formData.firmado_por} onChange={handleChange} className={`${inputClass} bg-gray-100`} required />
        
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold transition-colors mt-2">
          Emitir y Propagar
        </button>
      </form>
      {status && <p className="mt-4 text-sm font-medium text-center text-gray-800">{status}</p>}
    </div>
  );
}