const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Limitador para intentos de inicio de sesión
 * Mitiga ataques de fuerza bruta y credential stuffing.
 * En desarrollo permite hasta 100 intentos para pruebas. En producción restringe a 5.
 * skipSuccessfulRequests: true evita penalizar o bloquear inicios de sesión exitosos.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 100 : 5, // 100 en desarrollo / 5 en producción
  skipSuccessfulRequests: true, // Logins exitosos no consumen intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos fallidos de inicio de sesión desde esta dirección. Por seguridad, intente de nuevo en 15 minutos."
  }
});

/**
 * Limitador general para el resto de endpoints de la API pública
 * Permite hasta 100 peticiones por minuto por IP.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Límite de peticiones excedido. Por favor espere un momento."
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
