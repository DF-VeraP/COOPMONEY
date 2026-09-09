const express = require('express');
const router = express.Router();
const SuperadminController = require('../controllers/superadmin.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

// Todas las rutas de este router requieren rol super_admin
router.use(authenticateJWT, authorizeRoles('super_admin'));

// Estadísticas y métricas generales
router.get('/stats', SuperadminController.getStats);

// Gestión de cooperativas y solicitudes
router.get('/cooperativas', SuperadminController.getCooperativas);
router.post('/cooperativas', SuperadminController.createCooperativa);
router.get('/cooperativas/:id/detalles', SuperadminController.getCooperativaDetalles);
router.get('/cooperativas/:id', SuperadminController.getCooperativaForEdit);
router.put('/cooperativas/:id', SuperadminController.updateCooperativa);

// Aprobación y rechazo de solicitudes
router.post('/solicitudes/:id/aprobar', SuperadminController.aprobarSolicitud);
router.post('/solicitudes/:id/rechazar', SuperadminController.rechazarSolicitud);

// Dashboards y reportes
router.get('/dashboard/cooperativas-por-mes', SuperadminController.getCooperativasPorMes);
router.get('/dashboard/top-socios', SuperadminController.getTopSocios);
router.get('/reportes/resumen', SuperadminController.getReportesResumen);
router.get('/reportes/cartera-mensual', SuperadminController.getCarteraMensual);
router.get('/reportes/morosidad', SuperadminController.getMorosidad);

module.exports = router;
