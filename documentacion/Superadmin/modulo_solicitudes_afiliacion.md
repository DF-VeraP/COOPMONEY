# Módulo: Solicitudes de Afiliación de Cooperativas (Superadmin)

## 1. Identificación y Alcance
* **Rol Responsable:** `super_admin`
* **Requerimientos Asociados:**
  * **RF001 / Ampliación SaaS:** Radicación pública y aprobación de nuevas cooperativas aspirantes en la red COOPMONEY.
  * **Aprobación Transaccional:** Al aprobar una solicitud, se crea automáticamente la entidad `cooperativa` y se crea la cuenta del representante legal con rol `admin_local` y contraseña cifrada con `bcryptjs`.

---

## 2. Endpoints de la API REST

### 2.1. Listar solicitudes de afiliación de cooperativas
* **Ruta:** `GET /api/superadmin/solicitudes`
* **Permisos:** Requiere Token JWT con rol `super_admin`.
* **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id_solicitud": 5,
    "nit_cooperativa": "901555666-2",
    "nombre_cooperativa": "Cooperativa Financiera del Sur",
    "correo_cooperativa": "contacto@coopdelsur.com",
    "nombre_representante": "Dra. Patricia Ortiz",
    "correo_representante": "patricia.ortiz@coopdelsur.com",
    "lineas_credito": "Consumo, Vivienda",
    "cantidad_socios": "100-500",
    "estado_solicitud": "pendiente",
    "fecha_solicitud": "2026-03-08T14:15:00.000Z"
  }
]
```

### 2.2. Aprobar o Rechazar Solicitud de Cooperativa
* **Ruta:** `POST /api/superadmin/solicitudes/:id/resolver`
* **Cuerpo de la Solicitud:**
```json
{
  "accion": "aprobar", // o "rechazar"
  "motivo": "Documentación jurídica y personería solidaria verificada."
}
```
* **Flujo Transaccional al Aprobar:**
  1. Inserta en la tabla `cooperativa`.
  2. Inserta en la tabla `usuario` el nuevo usuario del representante con `rol_usuario = 'admin_local'` asignado a la nueva cooperativa.
  3. Actualiza el estado en `solicitud_afiliacion` a `'aprobada'`.
  4. Dispara correo electrónico institucional de confirmación al representante con sus credenciales de acceso.

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE solicitud_afiliacion (
    id_solicitud SERIAL PRIMARY KEY,
    nit_cooperativa VARCHAR(20) NOT NULL,
    nombre_cooperativa VARCHAR(150) NOT NULL,
    correo_cooperativa VARCHAR(100) NOT NULL,
    telefono_cooperativa VARCHAR(30) NOT NULL,
    direccion_cooperativa VARCHAR(200) NOT NULL,
    sitio_web VARCHAR(150),
    nombre_representante VARCHAR(150) NOT NULL,
    cedula_representante VARCHAR(20) NOT NULL,
    cargo_representante VARCHAR(100) NOT NULL,
    correo_representante VARCHAR(100) NOT NULL,
    telefono_representante VARCHAR(30) NOT NULL,
    lineas_credito TEXT,
    cantidad_socios VARCHAR(50),
    necesita_migracion BOOLEAN DEFAULT FALSE,
    contrasena_admin VARCHAR(255) NOT NULL,
    estado_solicitud VARCHAR(20) DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaces Asociadas
* **Radicación Pública:** `public/registro-cooperativa.html`
* **Gestión por Superadmin:** `public/dashboard-superadmin.html` (Pestaña "Solicitudes Pendientes").
