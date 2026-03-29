-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- TABLE: personas
-- =========================
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  curp VARCHAR(18) UNIQUE,
  correo VARCHAR(150),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO personas (nombre, apellido_paterno, apellido_materno, curp, correo) VALUES
('Luis', 'Quijano', 'Martínez', 'QUIJ900101HDFABC01', 'luis@example.com'),
('Ana', 'García', 'López', 'GALA920202MDFABC02', 'ana@example.com'),
('Carlos', 'Ramírez', 'Santos', 'RASC910303HDFABC03', 'carlos@example.com');

-- =========================
-- TABLE: instituciones
-- =========================
CREATE TABLE instituciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  pais VARCHAR(100),
  estado VARCHAR(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO instituciones (nombre, pais, estado) VALUES
('UNAM', 'México', 'CDMX'),
('ITESM', 'México', 'Nuevo León'),
('UDG', 'México', 'Jalisco');

-- =========================
-- TABLE: niveles_grado
-- =========================
CREATE TABLE niveles_grado (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

INSERT INTO niveles_grado (id, nombre) VALUES
(1, 'Técnico'),
(2, 'Licenciatura'),
(3, 'Maestría'),
(4, 'Doctorado'),
(5, 'Especialidad');

-- =========================
-- TABLE: programas
-- =========================
CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  nivel_grado_id INT REFERENCES niveles_grado(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO programas (nombre, nivel_grado_id) VALUES
('Ingeniería en Sistemas', 2),
('Medicina', 2),
('Derecho', 2),
('Maestría en IA', 3),
('Doctorado en Ciencias', 4);

-- =========================
-- TABLE: grados (BLOCKCHAIN)
-- =========================
CREATE TABLE grados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  institucion_id UUID REFERENCES instituciones(id),
  programa_id UUID REFERENCES programas(id),

  fecha_inicio DATE,
  fecha_fin DATE,
  titulo_obtenido VARCHAR(255),
  numero_cedula VARCHAR(50),
  titulo_tesis TEXT,
  menciones VARCHAR(100),

  -- Blockchain fields
  hash_actual TEXT NOT NULL,
  hash_anterior TEXT,
  nonce INTEGER,
  firmado_por VARCHAR(255),

  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);