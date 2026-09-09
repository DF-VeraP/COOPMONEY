# Módulo: Configuración Institucional (Administrador Local)

## 1. Identificación y Alcance
* **Rol Responsable:** `admin_local`
* **Requerimientos Asociados:**
  * Administración de datos de contacto institucional, actualización de contraseña del administrador y consulta de métricas operativas de la entidad.

---

## 2. Endpoints de la API REST

### 2.1. Cambio de Contraseña de Administrador
* **Ruta:** `POST /api/admin/perfil/contrasena`
* **Headers:** `Authorization: Bearer <token>`
* **Cuerpo:**
```json
{
  "passwordActual": "MiClaveAnterior123",
  "passwordNueva": "NuevaClaveRobusta2026!"
}
```
* **Respuesta:**
```json
{
  "success": true,
  "message": "Contraseña actualizada con éxito"
}
```

---

## 3. Seguridad
* Encriptación mediante `bcryptjs` con costo de sal (salt) de 12 rondas.
* Validación estricta de longitud mínima (8 caracteres) con políticas de robustez.
