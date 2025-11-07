-- backend/database/init.sql

-- Tabla usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_red VARCHAR(100) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla tipos_solicitud
CREATE TABLE tipos_solicitud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla solicitudes
CREATE TABLE solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_solicitud VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_solicitud_id UUID NOT NULL REFERENCES tipos_solicitud(id),
    solicitante_id UUID NOT NULL REFERENCES usuarios(id),
    responsable_id UUID NOT NULL REFERENCES usuarios(id),
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla historial_solicitudes
CREATE TABLE historial_solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    comentario TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla comentarios
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_solicitante ON solicitudes(solicitante_id);
CREATE INDEX idx_solicitudes_responsable ON solicitudes(responsable_id);
CREATE INDEX idx_historial_solicitud ON historial_solicitudes(solicitud_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

-- Datos iniciales
INSERT INTO usuarios (usuario_red, nombre_completo, email, area) VALUES
('jperez', 'Juan Pérez', 'jperez@banco.com', 'Desarrollo'),
('mgarcia', 'María García', 'mgarcia@banco.com', 'DevOps'),
('lrodriguez', 'Luis Rodríguez', 'lrodriguez@banco.com', 'Arquitectura'),
('alopez', 'Ana López', 'alopez@banco.com', 'Seguridad');

INSERT INTO tipos_solicitud (codigo, nombre, descripcion) VALUES
('DEPLOY', 'Despliegue', 'Aprobación para desplegar nueva versión'),
('ACCESS', 'Acceso', 'Solicitud de acceso a herramientas'),
('PIPELINE', 'Cambio Pipeline', 'Modificación en pipelines CI/CD'),
('TECH_TOOL', 'Herramienta Técnica', 'Nueva incorporación al catálogo'),
('CONFIG', 'Cambio Configuración', 'Modificación de configuraciones');