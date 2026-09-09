# Módulo: Métricas Globales Multi-Cooperativa (Superadmin)

## 1. Identificación y Alcance
* **Rol Responsable:** `super_admin`
* **Requerimientos Asociados:**
  * **RF004:** Ver métricas globales consolidadas: total de cooperativas registradas, total de socios activos por cooperativa y total de créditos aprobados por cooperativa.
  * **RNF03:** Restricción estricta de métricas consolidadas únicamente para el Super Administrador global.

---

## 2. Endpoints de la API REST

### 2.1. Obtener KPIs Globales
* **Ruta:** `GET /api/superadmin/metricas`
* **Permisos:** Requiere Token JWT con rol `super_admin`.
* **Respuesta Exitosa (200 OK):**
```json
{
  "total_cooperativas": 4,
  "cooperativas_activas": 4,
  "total_socios_sistema": 128,
  "total_creditos_aprobados": 45,
  "volumen_total_colocado": 358000000.00,
  "desglose_por_cooperativa": [
    {
      "id_cooperativa": 1,
      "nombre": "Cooperativa Demo Huila",
      "total_socios": 65,
      "creditos_aprobados": 24,
      "cartera_activa": 185000000.00
    },
    {
      "id_cooperativa": 2,
      "nombre": "Cooperativa ALOHA",
      "total_socios": 63,
      "creditos_aprobados": 21,
      "cartera_activa": 173000000.00
    }
  ]
}
```

---

## 3. Consultas SQL Agregadas

El cálculo se realiza mediante subconsultas y `LEFT JOIN` para garantizar un tiempo de respuesta óptimo:

```sql
SELECT 
    c.id_cooperativa,
    c.nombre_cooperativa,
    c.estado_cooperativa,
    COUNT(DISTINCT s.id_socio) AS total_socios,
    COUNT(DISTINCT cr.id_credito) FILTER (WHERE cr.estado_credito IN ('aprobado', 'activo', 'finalizado')) AS creditos_aprobados,
    COALESCE(SUM(cr.monto_aprobado) FILTER (WHERE cr.estado_credito IN ('aprobado', 'activo')), 0) AS total_colocado
FROM cooperativa c
LEFT JOIN socio s ON s.id_cooperativa_socio = c.id_cooperativa
LEFT JOIN credito cr ON cr.id_socio_credito = s.id_socio
GROUP BY c.id_cooperativa, c.nombre_cooperativa, c.estado_cooperativa;
```

---

## 4. Interfaz de Usuario
* **Archivo Vista:** `public/dashboard-superadmin.html`
* Tarjetas superiores con estadísticas visuales en tiempo real y gráficos comparativos de volumen de cartera por entidad.
