import { formatCurrencyCOP, extractNumber } from '../utils/formatters.js';

export function initSimulator() {
  const form = document.getElementById('simulator-form');
  const amountInput = document.getElementById('sim-amount');
  const termSelect = document.getElementById('sim-term');
  const lineSelect = document.getElementById('sim-line');
  const rateInput = document.getElementById('sim-rate');
  
  const resultQuota = document.getElementById('result-quota');
  const resultTotal = document.getElementById('result-total');
  
  // Tasas de interés según línea de crédito (Efectivo Anual)
  const rates = {
    'consumo': 18,
    'vivienda': 12,
    'educativo': 10
  };

  // Formateo en tiempo real del input de monto
  if (amountInput) {
    amountInput.addEventListener('input', (e) => {
      const num = extractNumber(e.target.value);
      if (num > 0) {
        e.target.value = formatCurrencyCOP(num);
      } else {
        e.target.value = '';
      }
    });
  }

  // Actualización automática de la tasa visible al cambiar la línea
  if (lineSelect && rateInput) {
    lineSelect.addEventListener('change', (e) => {
      const line = e.target.value;
      rateInput.value = `${rates[line]}% EA`;
    });
  }

  // Lógica de cálculo al hacer submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const amount = extractNumber(amountInput.value);
      const months = parseInt(termSelect.value, 10);
      const line = lineSelect.value;
      
      if (!amount || amount <= 0) {
        alert('Por favor, ingresa un monto válido mayor a 0.');
        return;
      }
      
      // Cálculo de cuota fija (método francés)
      // Convertir Tasa Efectiva Anual (EA) a Tasa Mes Vencida (MV) aproximada
      const eaRate = rates[line] / 100;
      const mvRate = Math.pow(1 + eaRate, 1/12) - 1;
      
      // Fórmula cuota fija: C = (P * i) / (1 - (1 + i)^-n)
      const numerator = amount * mvRate;
      const denominator = 1 - Math.pow(1 + mvRate, -months);
      
      const monthlyQuota = numerator / denominator;
      const totalPayment = monthlyQuota * months;
      
      // Mostrar resultados
      resultQuota.textContent = formatCurrencyCOP(monthlyQuota);
      resultTotal.textContent = formatCurrencyCOP(totalPayment);
    });
  }
}
