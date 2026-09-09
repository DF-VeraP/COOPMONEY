# Módulo: Estudio de Aspirantes (Analista de Crédito)

## 1. Identificación y Alcance
* **Rol Responsable:** `analista`
* **Requerimientos Asociados:**
  * **RF010:** Ver listado de solicitudes de aspirantes en estado `pendiente`.
  * **RF011:** Ver los datos completos de un aspirante (personal, laboral, ingresos).
  * **RF012:** Aprobar una solicitud (el aspirante se convierte automáticamente en `socio`, se le crea su usuario en el sistema y su cuenta de ahorros).
  * **RF013:** Rechazar una solicitud con motivo obligatorio explícito.
  * **RF014:** Filtrar solicitudes por estado (`pendiente`, `aprobada`, `rechazada`).
  * **RF015:** Ver historial de solicitudes revisadas por el analista.

---

## 2. Endpoints de la API REST

### 2.1. Listar Solicitudes de Aspirantes
* **Ruta:** `GET /api/analista/aspirantes/:analistaId`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta (200 OK):**
```json
[
  {
    "id_aspirante": 8,
    "nombre_aspirante": "Julio César Morales",
    "documento_aspirante": "1087654321",
    "correo_aspirante": "julio.morales@gmail.com",
    "telefono_aspirante": "3123456789",
    "ocupacion_aspirante": "Ingeniero Agrónomo",
    "ingresos_aspirante": 3800000.00,
    "estado_solicitud": "pendiente",
    "fecha_solicitud": "2026-03-08T10:00:00.000Z"
  }
]
```

### 2.2. Resolver Solicitud (Aprobar / Rechazar)
* **Ruta:** `POST /api/analista/aspirantes/:id/resolver`
* **Cuerpo de la Solicitud:**
```json
{
  "accion": "aprobar", // o "rechazar"
  "motivo": "Capacidad de ingresos suficiente y verificación laboral conforme."
}
```
* **Efectos Secundarios al Aprobar:**
  1. Inserta en la tabla `socio` asignando la fecha de ingreso.
  2. Crea la cuenta de ahorros inicial del socio con saldo \$0.
  3. Crea el registro en la tabla `usuario` con rol `'socio'` y genera una contraseña inicial de acceso.
  4. Envía notificación por correo electrónico con las instrucciones de ingreso al socio.

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE aspirante (
    id_aspirante SERIAL PRIMARY KEY,
    id_cooperativa_aspirante INT REFERENCES cooperativa(id_cooperativa),
    nombre_aspirante VARCHAR(150) NOT NULL,
    documento_aspirante VARCHAR(20) NOT NULL,
    correo_aspirante VARCHAR(100) NOT NULL,
    telefono_aspirante VARCHAR(30) NOT NULL,
    direccion_aspirante VARCHAR(200) NOT NULL,
    ocupacion_aspirante VARCHAR(100) NOT NULL,
    ingresos_aspirante NUMERIC(14,2) NOT NULL,
    estado_solicitud VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_solicitud IN ('pendiente', 'aprobada', 'rechazada')),
    motivo_rechazo TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-analista.html` (Sección "Aspirantes a Asociados").
