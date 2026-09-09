# Módulo: Solicitud y Simulación de Créditos (Socio)

## 1. Identificación y Alcance
* **Rol Responsable:** `socio`
* **Requerimientos Asociados:**
  * **RF019:** Radicar una solicitud de crédito en línea ingresando monto, línea y plazo.
  * **RF020:** Verificación interactiva de cumplimiento de reglas de crédito antes de enviar:
    * Antigüedad $\ge$ 2 meses en la cooperativa.
    * Ahorro mínimo $\ge$ 15% del monto pretendido.
    * Sin mora en cuotas activas.
    * Máximo 2 créditos activos simultáneos.
    * Capacidad máxima: Monto $\le$ Ahorros $\times$ 3.
  * **RF022:** Ver y descargar la tabla de amortización detallada de cada crédito.

---

## 2. Endpoints de la API REST

### 2.1. Simulación y Consulta de Líneas
* **Ruta:** `GET /api/socio/lineas?cooperativaId=:id`
* Retorna las líneas disponibles con sus tasas vigentes, límites de plazo y montos autorizados.

### 2.2. Radicar Solicitud de Crédito
* **Ruta:** `POST /api/socio/solicitar`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Cuerpo de la Solicitud:**
```json
{
  "id_socio": 5,
  "id_linea": 1,
  "monto": 4000000.00,
  "plazo": 12,
  "proposito": "Adquisición de equipo de cómputo para trabajo"
}
```
* **Validación en Backend:** Si el socio no cumple alguna de las 5 reglas de negocio, la API rechaza la solicitud con HTTP 400 y detalla el motivo exacto (ej: *"El ahorro actual (\$500.000) no cubre el 15% requerido (\$600.000) para el monto solicitado"*).

### 2.3. Consultar Tabla de Amortización
* **Ruta:** `GET /api/socio/credito/:idCredito/pagos`
* Retorna el cronograma proyectado de todas las cuotas fijas (método francés), discriminando capital, interés corriente y estado de pago.

---

## 3. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-socio.html` (Sección "Simulador y Solicitud de Crédito").
* Validador visual en tiempo real con checks dinámicos de cumplimiento antes del envío.
