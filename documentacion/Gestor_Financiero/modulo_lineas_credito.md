# Módulo: Líneas de Crédito y Parametrización (Gestor Financiero)

## 1. Identificación y Alcance
* **Rol Responsable:** `gestor`
* **Requerimientos Asociados:**
  * **RF052 / RNF01:** Configurar tasas de interés parametrizables por línea de crédito (Efectivo Anual % EA).
  * **RF053:** Configurar plazos máximos y mínimos por línea de crédito (en meses).
  * **RF054:** Configurar montos máximos y mínimos financiables por línea de crédito.

---

## 2. Endpoints de la API REST

### 2.1. Listar Líneas de Crédito
* **Ruta:** `GET /api/gestor/lineas?cooperativaId=:id`
* **Respuesta (200 OK):**
```json
[
  {
    "id_linea": 1,
    "nombre_linea": "Consumo",
    "descripcion_linea": "Préstamos de libre inversión",
    "tasa_interes_ea": 18.0,
    "plazo_minimo_meses": 6,
    "plazo_maximo_meses": 48,
    "monto_minimo": 500000.00,
    "monto_maximo": 20000000.00,
    "estado_linea": "activo"
  },
  {
    "id_linea": 2,
    "nombre_linea": "Vivienda",
    "descripcion_linea": "Adquisición y mejora de vivienda",
    "tasa_interes_ea": 12.0,
    "plazo_minimo_meses": 12,
    "plazo_maximo_meses": 120,
    "monto_minimo": 5000000.00,
    "monto_maximo": 100000000.00,
    "estado_linea": "activo"
  }
]
```

### 2.2. Crear o Modificar Línea de Crédito
* **Ruta:** `POST /api/gestor/lineas`
* **Cuerpo de la Solicitud:**
```json
{
  "cooperativaId": 2,
  "nombre": "Educativo Especial",
  "descripcion": "Financiación de matrículas y posgrados",
  "tasaEA": 10.5,
  "plazoMin": 6,
  "plazoMax": 36,
  "montoMin": 1000000,
  "montoMax": 15000000
}
```

---

## 3. Modelo de Datos Involucrado

```sql
CREATE TABLE linea_credito (
    id_linea SERIAL PRIMARY KEY,
    id_cooperativa_linea INT REFERENCES cooperativa(id_cooperativa),
    nombre_linea VARCHAR(100) NOT NULL,
    descripcion_linea TEXT,
    tasa_interes_ea NUMERIC(5,2) NOT NULL CHECK (tasa_interes_ea > 0),
    plazo_minimo_meses INT NOT NULL CHECK (plazo_minimo_meses > 0),
    plazo_maximo_meses INT NOT NULL CHECK (plazo_maximo_meses >= plazo_minimo_meses),
    monto_minimo NUMERIC(14,2) NOT NULL CHECK (monto_minimo > 0),
    monto_maximo NUMERIC(14,2) NOT NULL CHECK (monto_maximo >= monto_minimo),
    estado_linea VARCHAR(20) DEFAULT 'activo'
);
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-gestor.html` (Pestaña "Líneas de Crédito").
