# Módulo: Motor de Amortización y Cálculo de Mora (Sistema / Core)

## 1. Identificación y Alcance
* **Módulo:** Core Matemático y Reglas Automáticas
* **Requerimientos Asociados:**
  * **RF062:** Cálculo automático de la tabla de amortización con cuota fija utilizando el **Sistema Francés**.
  * **RF063 / RF04:** Cálculo exacto de intereses corrientes devengados e intereses moratorios por días de retraso.
  * **RF064:** Validación algorítmica de preaprobación de créditos.
  * **RF066:** Débito atómico de aportes/ahorros en operaciones de pago voluntario.

---

## 2. Modelos Matemáticos Implementados

### 2.1. Conversión de Tasas (Efectiva Anual a Mensual Vencida)
Dado que las líneas de crédito se pactan en tasa **Efectiva Anual (EA)**, el sistema la convierte a la tasa periódica **Mes Vencido (MV)** mediante equivalencia financiera compuesta:

$$i_{mv} = (1 + EA)^{\frac{1}{12}} - 1$$

*Ejemplo: Para una tasa del 18% EA:*
$$i_{mv} = (1 + 0.18)^{0.083333} - 1 \approx 0.013888 \quad (1.3888\% \text{ MV})$$

---

### 2.2. Fórmula de Cuota Fija (Método Francés)
Para un monto principal $P$, una tasa periódica $i_{mv}$ y un plazo de $n$ meses, el valor de la cuota mensual fija $C$ se calcula como:

$$C = \frac{P \cdot i_{mv}}{1 - (1 + i_{mv})^{-n}}$$

Para cada período $t \in [1, n]$:
1. **Interés del período:** $I_t = \text{Saldo}_{t-1} \cdot i_{mv}$
2. **Abono a capital:** $A_t = C - I_t$
3. **Nuevo saldo:** $\text{Saldo}_t = \text{Saldo}_{t-1} - A_t$

---

### 2.3. Cálculo de Intereses de Mora
Si la cuota $t$ no es cancelada antes o en su fecha de vencimiento $\text{F}_{\text{venc}}$, y han transcurrido $d$ días de mora:

$$\text{Interés Mora} = \text{Abono Capital Vencido} \times \left( \frac{\text{Tasa Mora Anual}}{360} \right) \times d$$

*Clasificación de riesgo por días de retraso:*
* $1 \le d \le 10$: **Mora Leve** (Recordatorio preventivo)
* $11 \le d \le 30$: **Mora Preocupante** (Gestión activa de cobranza)
* $31 \le d \le 60$: **Mora Crítica** (Suspensión de nuevos créditos)
* $d \ge 61$: **Mora Severa / Cartera Castigada**

---

## 3. Matriz de Validación Automática de Créditos (RF064)

```
                              ┌─────────────────────────┐
                              │ Solicitud de Préstamo   │
                              └────────────┬────────────┘
                                           │
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │ ¿Antigüedad como socio >= 2 meses?        │ ── NO ──► RECHAZO
                     └─────────────────────┬─────────────────────┘
                                           │ SÍ
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │ ¿Ahorro >= 15% del monto solicitado?      │ ── NO ──► RECHAZO
                     └─────────────────────┬─────────────────────┘
                                           │ SÍ
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │ ¿Tiene cuotas actualmente en mora?        │ ── SÍ ──► RECHAZO
                     └─────────────────────┬─────────────────────┘
                                           │ NO
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │ ¿Créditos activos <= 2?                   │ ── NO ──► RECHAZO
                     └─────────────────────┬─────────────────────┘
                                           │ SÍ
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │ ¿Monto solicitado <= (Ahorros * 3)?       │ ── NO ──► RECHAZO
                     └─────────────────────┬─────────────────────┘
                                           │ SÍ
                                           ▼
                              ┌─────────────────────────┐
                              │   CRÉDITO PREAPROBADO   │
                              │   Pasa a desembolso     │
                              └─────────────────────────┘
```

---

## 4. Implementación en Código
* **Frontend:** `public/js/controllers/simulator.controller.js`
* **Backend:** Lógica centralizada en `src/routes/api.routes.js`
