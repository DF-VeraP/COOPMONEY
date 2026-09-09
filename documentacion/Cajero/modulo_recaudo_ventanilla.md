# Módulo: Recaudo en Ventanilla (Cajero)

## 1. Identificación y Alcance
* **Rol Responsable:** `cajero`
* **Requerimientos Asociados:**
  * **RF029:** Buscar a un socio por documento de identidad o nombre.
  * **RF030:** Ver el perfil del socio con sus créditos activos, cuotas vencidas y saldo de ahorros.
  * **RF031:** Registrar un pago de cuota presencial en caja (efectivo, transferencia o mixto).
  * **RF032:** Opción en pantalla: *"El socio tiene \$X en ahorros. ¿Desea usar sus ahorros para este pago?"*.
  * **RF033:** El cajero selecciona Sí o No según la voluntad expresa del socio.
  * **RF034:** El sistema genera y descarga automáticamente un **Recibo oficial de pago en PDF** con código único de transacción.

---

## 2. Endpoints de la API REST

### 2.1. Buscar Socio y sus Obligaciones
* **Ruta:** `GET /api/socio/resumen/doc/:documento?cooperativaId=:id`
* **Permisos:** Requiere Token JWT con rol `cajero` o `admin_local`.
* **Respuesta Exitosa (200 OK):**
```json
{
  "socio": {
    "id_socio": 5,
    "nombre": "Emerson Murcia",
    "documento": "1117811948",
    "saldo_ahorros": 850000.00
  },
  "creditos_activos": [
    {
      "id_credito": 12,
      "monto_aprobado": 5000000.00,
      "saldo_pendiente": 3750000.00,
      "proxima_cuota": {
        "numero_cuota": 4,
        "valor_cuota": 458333.33,
        "fecha_vencimiento": "2026-03-15",
        "dias_mora": 0,
        "interes_mora": 0.00,
        "total_a_pagar": 458333.33
      }
    }
  ]
}
```

### 2.2. Registrar Pago en Caja
* **Ruta:** `POST /api/cajero/recaudar`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Cuerpo de la Solicitud:**
```json
{
  "id_credito": 12,
  "id_cuota": 45,
  "monto_pagado": 458333.33,
  "metodo_pago": "efectivo", // "efectivo", "transferencia", "ahorro"
  "usar_ahorros": false
}
```
* **Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Pago registrado exitosamente",
  "pago": {
    "id_pago": 108,
    "monto": 458333.33,
    "fecha": "2026-03-08T17:15:00.000Z",
    "nuevo_saldo_credito": 3291666.67,
    "nuevo_saldo_ahorro": 850000.00,
    "url_recibo": "/api/pagos/108/recibo"
  }
}
```

### 2.3. Descarga del Recibo de Pago (PDF)
* **Ruta:** `GET /api/pagos/:idPago/recibo`
* **Generación Dinámica:** Mediante el servicio `ReceiptService` ([receipt.service.js](file:///c:/Users/Lenovo/Documents/SENA/COOPMONEY/Coopmoney_proyect/src/services/receipt.service.js)) con PDFKit.
* **Contenido del Recibo:** Consecutivo oficial `REC-XXXXX`, membrete de la cooperativa, fecha y hora exacta, cajero emisor, nombre y documento del socio, desglose (capital, interés corriente, interés de mora), nuevo saldo y firma autorizada.

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    id_credito_pago INT REFERENCES credito(id_credito),
    id_cuota_pago INT REFERENCES cuota_credito(id_cuota),
    id_cajero_pago INT REFERENCES usuario(id_usuario),
    monto_pago NUMERIC(14,2) NOT NULL,
    monto_capital NUMERIC(14,2) NOT NULL,
    monto_interes_corriente NUMERIC(14,2) NOT NULL,
    monto_interes_mora NUMERIC(14,2) DEFAULT 0.00,
    metodo_pago VARCHAR(30) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-cajero.html`
* Formulario rápido de búsqueda con autocompletado, visualización de cuota sugerida y modal de confirmación con botón de impresión directa del comprobante.
