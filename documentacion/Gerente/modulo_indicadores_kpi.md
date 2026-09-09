# Módulo: Indicadores KPI y Exportación (Gerente)

## 1. Identificación y Alcance
* **Rol Responsable:** `gerente`
* **Requerimientos Asociados:**
  * **RF040:** Ver indicadores gerenciales: índice de morosidad total (ICV), cobertura de cartera y nivel de riesgo.
  * **RF041:** Exportar reportes financieros a formato Excel.
  * **RF042:** Exportar reportes e informes de auditoría a formato PDF.
  * **RF043:** Consultar estado global crediticio de cualquier socio específico.

---

## 2. Indicadores Clave de Desempeño (KPIs)

1. **Índice de Calidad de Cartera (Morosidad):**
   $$\text{ICV} = \left( \frac{\text{Saldo en Cartera Vencida}}{\text{Saldo Total de la Cartera Activa}} \right) \times 100$$
2. **Índice de Cobertura de Ahorro:**
   $$\text{ICA} = \left( \frac{\text{Total Ahorros Disponibles de Socios}}{\text{Total Cartera Colocada}} \right) \times 100$$
3. **Eficiencia en Recaudo:** Porcentaje de cuotas pagadas a tiempo en el mes corriente versus cuotas emitidas.

---

## 3. Endpoints de la API REST

* **Dashboard de KPIs:** `GET /api/gerente/dashboard?cooperativaId=:id`
* **Exportación de Reporte:**
  * PDF: `GET /api/gerente/reportes/pdf?tipo=cartera&cooperativaId=:id`
  * Excel (CSV): `GET /api/gerente/reportes/excel?tipo=cartera&cooperativaId=:id`

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-gerente.html`
* Tarjetas métricas superiores, botones de descarga de reportes y tabla de consulta individual de asociados.
