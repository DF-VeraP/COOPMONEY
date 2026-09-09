# Módulo: Portal del Socio (Socio)

## 1. Identificación y Alcance
* **Rol Responsable:** `socio`
* **Requerimientos Asociados:**
  * **RF016:** Ver su perfil con datos personales, documento, teléfono y correo electrónico.
  * **RF017:** Ver su saldo actual de aportes y ahorros disponibles.
  * **RF018:** Ver listado completo de sus créditos (activos, al día, en mora y finalizados).
  * **RF021:** Recibir notificaciones internas y alertas de créditos preaprobados o vencimientos próximos.

---

## 2. Endpoints de la API REST

### 2.1. Resumen General del Socio
* **Ruta:** `GET /api/socio/resumen/:userId`
* **Permisos:** Requiere Token JWT. El middleware `requireSameUserParam` verifica que el usuario autenticado solo pueda consultar su propio expediente.
* **Respuesta Exitosa (200 OK):**
```json
{
  "socio": {
    "id_socio": 5,
    "nombre": "Emerson Murcia",
    "documento": "1117811948",
    "correo": "murciacorredoremerson@gmail.com",
    "telefono": "3117811948",
    "direccion": "Calle 12 # 4-50",
    "saldo_ahorros": 1250000.00,
    "fecha_afiliacion": "2025-11-10"
  },
  "creditos": [
    {
      "id_credito": 12,
      "linea": "Consumo",
      "monto_aprobado": 5000000.00,
      "saldo_pendiente": 3750000.00,
      "cuotas_totales": 12,
      "cuotas_pagadas": 3,
      "proxima_cuota": {
        "numero": 4,
        "valor": 458333.33,
        "fecha_vencimiento": "2026-03-15",
        "dias_mora": 0
      }
    }
  ]
}
```

### 2.2. Notificaciones del Socio
* **Consultar Alertas:** `GET /api/socio/notificaciones/:socioId`
* **Marcar como Leída:** `POST /api/socio/notificaciones/leer` $\rightarrow$ `{ "idNotificacion": 14 }`

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE socio (
    id_socio SERIAL PRIMARY KEY,
    id_cooperativa_socio INT REFERENCES cooperativa(id_cooperativa),
    id_usuario_socio INT UNIQUE REFERENCES usuario(id_usuario),
    nombre_socio VARCHAR(150) NOT NULL,
    documento_socio VARCHAR(20) UNIQUE NOT NULL,
    correo_socio VARCHAR(100) NOT NULL,
    telefono_socio VARCHAR(30),
    direccion_socio VARCHAR(200),
    saldo_ahorro NUMERIC(14,2) DEFAULT 0.00 CHECK (saldo_ahorro >= 0),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    estado_socio VARCHAR(20) DEFAULT 'activo' CHECK (estado_socio IN ('activo', 'inactivo'))
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-socio.html`
* Incluye tarjetas de resumen de saldos, visor de perfil, tabla interactiva de créditos activos y campana de notificaciones.
