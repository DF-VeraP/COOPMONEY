# Módulo: Gestión de Mora y Cobranza (Gestor Financiero)

## 1. Identificación y Alcance
* **Rol Responsable:** `gestor`
* **Requerimientos Asociados:**
  * **RF055:** Ver listado de créditos en mora clasificados por rangos:
    * 1 a 10 días (*Leve*)
    * 11 a 30 días (*Preocupante*)
    * 31 a 60 días (*Crítica*)
    * 61 o más días (*Severa / Castigo*)
  * **RF056:** En mora leve (1-10 días): Envío de recordatorios automáticos al socio por correo y envío manual adicional.
  * **RF057:** En mora preocupante (11-30 días): Registrar gestión de cobro (fecha, contacto, acuerdo de pago).
  * **RF058:** Reestructurar un crédito vencido (ampliar plazo, recalcular cuotas y tasa).
  * **RF059:** Ver historial de reestructuraciones y acuerdos previos.
  * **RF060:** Proponer castigo de cartera para créditos con 61 o más días de mora irrecuperables.
  * **RF061:** Ver ficha de contacto integral del deudor (teléfono, dirección, correo).

---

## 2. Endpoints de la API REST

### 2.1. Listar Cartera en Mora por Franjas
* **Ruta:** `GET /api/gestor/mora?cooperativaId=:id&rango=:rango`
* **Respuesta (200 OK):**
```json
[
  {
    "id_credito": 14,
    "socio": "Mauricio Gómez",
    "telefono": "3145678901",
    "correo": "mauricio.gomez@gmail.com",
    "cuotas_vencidas": 2,
    "dias_mora_max": 24,
    "rango": "preocupante",
    "saldo_en_mora": 750000.00,
    "saldo_total_deuda": 4200000.00
  }
]
```

### 2.2. Registrar Bitácora de Gestión de Cobro
* **Ruta:** `POST /api/gestor/mora/gestion`
* **Cuerpo:**
```json
{
  "id_credito": 14,
  "canal_contacto": "llamada_telefonica",
  "compromiso_pago_fecha": "2026-03-20",
  "observacion": "Socio manifiesta retraso por cambio de empleo. Se compromete a abonar cuota 4 el 20 de marzo."
}
```

### 2.3. Reestructuración de Crédito
* **Ruta:** `POST /api/gestor/credito/:id/reestructurar`
* **Efectos:** Cancela el cronograma de cuotas anterior y genera una nueva tabla de amortización con el saldo insoluto restante, ajustando plazo y condiciones pactadas.

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE gestion_cobranza (
    id_gestion SERIAL PRIMARY KEY,
    id_credito_gestion INT REFERENCES credito(id_credito),
    id_gestor INT REFERENCES usuario(id_usuario),
    canal_contacto VARCHAR(50) NOT NULL,
    observaciones TEXT NOT NULL,
    compromiso_pago_fecha DATE,
    fecha_gestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-gestor.html` (Pestaña "Gestión de Cobranza y Mora").
