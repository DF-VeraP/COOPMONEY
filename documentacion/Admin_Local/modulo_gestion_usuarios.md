# Módulo: Gestión de Usuarios y Roles (Administrador Local)

## 1. Identificación y Alcance
* **Rol Responsable:** `admin_local`
* **Requerimientos Asociados:**
  * **RF045:** Crear un nuevo usuario en su cooperativa con rol específico (`analista`, `cajero`, `gerente`, `gestor`, `socio`).
  * **RF046:** Asignar nombre, correo, documento, teléfono y contraseña al nuevo usuario.
  * **RF047:** Desactivar un usuario existente (empleado desvinculado).
  * **RF048:** Activar un usuario previamente desactivado.
  * **RF049:** Listar todos los usuarios activos e inactivos de su cooperativa.
  * **RF050:** Cambiar el rol de un usuario existente (ej: `cajero` $\rightarrow$ `analista`).
  * **RF051:** Ver perfil y trazabilidad de cualquier usuario de su cooperativa.

---

## 2. Endpoints de la API REST

### 2.1. Listar Usuarios de la Cooperativa
* **Ruta:** `GET /api/admin/usuarios?cooperativaId=:id`
* **Permisos:** Requiere Token JWT con rol `admin_local` perteneciente a la misma cooperativa.
* **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id_usuario": 14,
    "nombre_usuario": "Carlos Mendoza",
    "documento_usuario": "1098765432",
    "correo_usuario": "carlos.mendoza@coopaloha.com",
    "telefono_usuario": "3114567890",
    "rol_usuario": "cajero",
    "estado_usuario": "activo",
    "id_socio": null
  }
]
```

### 2.2. Crear Nuevo Usuario Individual
* **Ruta:** `POST /api/admin/usuarios`
* **Cuerpo de la Solicitud:**
```json
{
  "cooperativaId": 2,
  "nombre": "Ana Lucía Torres",
  "documento": "52890123",
  "correo": "ana.torres@coopaloha.com",
  "telefono": "3159876543",
  "rol": "analista",
  "password": "PasswordSegura2026!"
}
```
* **Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente con ID 25"
}
```

### 2.3. Carga Masiva de Usuarios y Socios (Bulk)
* **Ruta:** `POST /api/admin/usuarios/bulk`
* **Cuerpo:** Arreglo JSON de usuarios/socios importados desde CSV o Excel.
* **Procesamiento:** Inserta en bloque con validación transaccional `BEGIN...COMMIT`, evitando duplicidad de correos o documentos.

### 2.4. Cambio de Rol y Estado
* **Cambiar Rol:** `PATCH /api/admin/usuarios/:id/rol` $\rightarrow$ `{ "nuevoRol": "analista" }`
* **Cambiar Estado:** `PATCH /api/admin/usuarios/:id/estado` $\rightarrow$ `{ "nuevoEstado": "inactivo" }`

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_cooperativa_usuario INT REFERENCES cooperativa(id_cooperativa),
    nombre_usuario VARCHAR(100) NOT NULL,
    documento_usuario VARCHAR(20) UNIQUE NOT NULL,
    correo_usuario VARCHAR(100) UNIQUE NOT NULL,
    telefono_usuario VARCHAR(30),
    contrasena_usuario VARCHAR(255) NOT NULL,
    rol_usuario VARCHAR(30) NOT NULL CHECK (rol_usuario IN (
        'super_admin', 'admin_local', 'gerente', 'analista', 'cajero', 'gestor', 'socio'
    )),
    estado_usuario VARCHAR(20) DEFAULT 'activo' CHECK (estado_usuario IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-adminlocal.html`
* Incluye tabla paginada con filtros por estado y rol, modales para creación/edición y visualizador de contraseñas.
