/**
 * Formatea un número como moneda colombiana (COP).
 * @param {number} value - El valor numérico a formatear.
 * @returns {string} El valor formateado (ej. $ 5.000.000).
 */
export function formatCurrencyCOP(value) {
  if (isNaN(value)) return '$ 0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Limpia un input de texto para dejar solo números.
 * @param {string} value - El valor del input.
 * @returns {number} El número extraído.
 */
export function extractNumber(value) {
  const cleanStr = value.replace(/\D/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
}
