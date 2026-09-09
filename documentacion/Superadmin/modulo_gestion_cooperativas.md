# Módulo: Gestión de Cooperativas (Superadmin)

## 1. Identificación y Alcance
* **Rol Responsable:** `super_admin`
* **Requerimientos Asociados:**
  * **RF001:** Registrar una nueva cooperativa en el sistema (nombre, NIT, dirección, teléfono, correo).
  * **RF002:** Listar todas las cooperativas registradas en el sistema.
  * **RF003:** Activar o desactivar una cooperativa (al desactivarla se bloquea el acceso de todos sus usuarios).
  * **RF005:** Buscar cooperativas por nombre o NIT con filtros dinámicos.

---

## 2. Endpoints de la API REST

### 2.1. Listar todas las cooperativas
* **Ruta:** `GET /api/superadmin/cooperativas`
* **Permisos:** Requiere Token JWT con rol `super_admin`.
* **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id_cooperativa": 1,
    "nombre_cooperativa": "Cooperativa Demo Huila",
    "nit_cooperativa": "900123456-1",
    "direccion_cooperativa": "Calle 10 # 5-20, Neiva",
    "telefono_cooperativa": "6088712345",
    "correo_cooperativa": "contacto@coopdemohuila.com",
    "estado_cooperativa": "activo",
    "fecha_registro": "2026-01-15T08:30:00.000Z"
  }
]
```

### 2.2. Registrar una nueva cooperativa
* **Ruta:** `POST /api/superadmin/cooperativas`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Cuerpo de la Solicitud:**
```json
{
  "nombre_cooperativa": "Cooperativa San Agustín",
  "nit_cooperativa": "901234567-8",
  "direccion_cooperativa": "Carrera 4 # 12-30",
  "telefono_cooperativa": "3151234567",
  "correo_cooperativa": "gerencia@coopsanagustin.coop"
}
```
* **Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Cooperativa registrada exitosamente",
  "cooperativa": {
    "id_cooperativa": 3,
    "nombre_cooperativa": "Cooperativa San Agustín"
  }
}
```

### 2.3. Activar o Desactivar Cooperativa
* **Ruta:** `PATCH /api/superadmin/cooperativas/:id/estado`
* **Cuerpo de la Solicitud:**
```json
{
  "estado": "inactivo" // o "activo"
}
```
* **Regla de Negocio:** Al cambiar el estado a `inactivo`, el middleware de autenticación (`auth.controller.js`) intercepta cualquier intento de login de usuarios pertenecientes a dicha cooperativa y responde con HTTP 403 (*"La cooperativa seleccionada está inactiva"*).

---

## 3. Modelo de Datos Involucrado (PostgreSQL)

```sql
CREATE TABLE cooperativa (
    id_cooperativa SERIAL PRIMARY KEY,
    nombre_cooperativa VARCHAR(150) NOT NULL,
    nit_cooperativa VARCHAR(20) UNIQUE NOT NULL,
    direccion_cooperativa VARCHAR(200),
    telefono_cooperativa VARCHAR(30),
    correo_cooperativa VARCHAR(100),
    estado_cooperativa VARCHAR(20) DEFAULT 'activo' CHECK (estado_cooperativa IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-superadmin.html`
* **Controlador JS:** `public/js/controllers/superadmin.controller.js`
* Permite búsqueda en tiempo real por texto (NIT o Razón Social), modal para registro de entidad y switch reactivo para alternar estado activo/inactivo.
