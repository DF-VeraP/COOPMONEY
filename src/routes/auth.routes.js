const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middlewares/rateLimiter');

// POST /api/auth/login protegido con Rate Limiting (máximo 5 intentos / 15 min)
router.post('/login', loginLimiter, AuthController.login);

// POST /api/auth/recuperar-contrasena protegido con Rate Limiting
router.post('/recuperar-contrasena', loginLimiter, AuthController.recuperarContrasena);

module.exports = router;
