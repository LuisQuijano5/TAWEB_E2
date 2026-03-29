"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">Documentación de la API</h1>
      <div className="border rounded-lg shadow-sm">
        <SwaggerUI url="/openapi.yaml" />
      </div>
    </div>
  );
}