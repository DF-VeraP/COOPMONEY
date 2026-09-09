# Módulo: Reportes de Cartera (Gerente)

## 1. Identificación y Alcance
* **Rol Responsable:** `gerente`
* **Requerimientos Asociados:**
  * **RF037:** Ver reporte de cartera vigente (créditos al día con cuotas regulares).
  * **RF038:** Ver reporte de cartera vencida clasificada por franjas de mora:
    * 1 a 10 días: *Mora Leve*
    * 11 a 30 días: *Mora Preocupante*
    * 31 a 60 días: *Mora Crítica*
    * 61 o más días: *Mora Severa / Pre-castigo*
  * **RF039:** Ver reporte de cartera castigada (créditos provisionados o declarados incobrables).
  * **RF044:** Filtrar reportes por rango de fechas y líneas de crédito.

---

## 2. Endpoints de la API REST

### 2.1. Resumen Consolidado de Cartera
* **Ruta:** `GET /api/gerente/cartera/resumen?cooperativaId=:id`
* **Permisos:** Requiere Token JWT con rol `gerente`.
* **Respuesta Exitosa (200 OK):**
```json
{
  "cartera_vigente": {
    "total_creditos": 32,
    "saldo_capital": 142500000.00,
    "porcentaje": 78.5
  },
  "cartera_vencida": {
    "total_creditos": 8,
    "saldo_capital": 34800000.00,
    "porcentaje": 19.2,
    "desglose_mora": {
      "rango_1_10_dias": { "creditos": 4, "saldo": 15000000.00 },
      "rango_11_30_dias": { "creditos": 2, "saldo": 11200000.00 },
      "rango_31_60_dias": { "creditos": 1, "saldo": 5100000.00 },
      "rango_61_mas_dias": { "creditos": 1, "saldo": 3500000.00 }
    }
  },
  "cartera_castigada": {
    "total_creditos": 1,
    "saldo_capital": 4200000.00,
    "porcentaje": 2.3
  }
}
```

---

## 3. Modelo de Clasificación de Cartera

El sistema evalúa el atraso en base a la fecha de vencimiento de las cuotas de cada crédito:

```sql
SELECT 
    cr.id_credito,
    s.nombre_socio,
    s.documento_socio,
    cr.monto_aprobado,
    cr.saldo_pendiente,
    COALESCE(MAX(CURRENT_DATE - cc.fecha_vencimiento) FILTER (WHERE cc.estado_cuota = 'pendiente' AND cc.fecha_vencimiento < CURRENT_DATE), 0) AS dias_mora_maximo
FROM credito cr
JOIN socio s ON cr.id_socio_credito = s.id_socio
LEFT JOIN cuota_credito cc ON cc.id_credito_cuota = cr.id_credito
WHERE s.id_cooperativa_socio = $1
GROUP BY cr.id_credito, s.nombre_socio, s.documento_socio;
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-gerente.html`
* Muestra gráficos de torta y barras con la distribución porcentual de cartera y tablas dinámicas de socios morosos.
