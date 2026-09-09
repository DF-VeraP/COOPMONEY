# Módulo: Evaluación de Solicitudes de Crédito (Analista)

## 1. Identificación y Alcance
* **Rol Responsable:** `analista`
* **Requerimientos Asociados:**
  * Evaluación rigurosa de las solicitudes de crédito radicadas por los socios.
  * Verificación de cumplimiento de las reglas de política de la entidad:
    * Antigüedad mínima como socio $\ge$ 2 meses.
    * Ahorro mínimo en la cooperativa $\ge$ 15% del monto solicitado.
    * Cero mora activa en créditos previos.
    * Límite de créditos activos en simultáneo $\le$ 2.
    * Monto solicitado no superior a $3 \times$ su saldo en ahorros.
  * Aprobación con generación automática de la tabla de amortización cuota a cuota.
  * Rechazo fundamentado con notificación inmediata al socio.

---

## 2. Endpoints de la API REST

### 2.1. Listar Solicitudes de Crédito
* **Ruta:** `GET /api/analista/solicitudes?cooperativaId=:id`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta (200 OK):**
```json
[
  {
    "id_credito": 12,
    "id_socio": 5,
    "nombre_socio": "Emerson Murcia",
    "documento_socio": "1117811948",
    "monto_solicitado": 5000000.00,
    "plazo_meses": 12,
    "linea_nombre": "Consumo",
    "tasa_interes_ea": 18.0,
    "saldo_ahorros_actual": 1200000.00,
    "meses_antiguedad": 4,
    "cumple_politicas": true,
    "estado": "pendiente"
  }
]
```

### 2.2. Resolver Solicitud de Crédito
* **Ruta:** `POST /api/analista/solicitudes/:id/resolver`
* **Cuerpo de la Solicitud:**
```json
{
  "accion": "aprobar", // o "rechazar"
  "motivo": "Capacidad de pago validada con comprobantes de nómina."
}
```
* **Acciones al Aprobar:**
  1. Estado del crédito pasa a `'aprobado'`.
  2. Ejecuta el algoritmo de amortización francés generando las $N$ cuotas en la tabla `cuota_credito`.
  3. Desembolso simulado (fecha de inicio y fijación de calendarios de pago).

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE credito (
    id_credito SERIAL PRIMARY KEY,
    id_socio_credito INT REFERENCES socio(id_socio),
    id_linea_credito INT REFERENCES linea_credito(id_linea),
    monto_solicitado NUMERIC(14,2) NOT NULL,
    monto_aprobado NUMERIC(14,2),
    plazo_meses INT NOT NULL,
    tasa_interes_ea NUMERIC(5,2) NOT NULL,
    cuota_fija_mensual NUMERIC(14,2),
    saldo_pendiente NUMERIC(14,2),
    estado_credito VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_credito IN (
        'pendiente', 'aprobado', 'rechazado', 'activo', 'finalizado', 'castigado'
    )),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-analista.html` (Sección "Créditos por Evaluar").
