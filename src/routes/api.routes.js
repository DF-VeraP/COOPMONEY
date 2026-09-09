const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const ReceiptService = require('../services/receipt.service');
const CertificateService = require('../services/certificate.service');
const {
  signToken,
  authenticateJWT,
  authorizeRoles,
  requireSameUserParam,
  requireSameUserBody,
  requireSameSocioParam,
  requireSameSocioBody,
  requireCooperativaFromQuery,
  requireCooperativaFromBody,
} = require('../middlewares/auth');

// GET /api/cooperativas/activas
router.get('/cooperativas/activas', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id_cooperativa, nombre_cooperativa, nit_cooperativa 
      FROM cooperativa 
      WHERE estado_cooperativa = 'activo'
    `);
    
    // Formatear para el frontend
    const cooperativas = rows.map(c => ({
      id_cooperativa: c.id_cooperativa,
      nombre: c.nombre_cooperativa,
      nit: c.nit_cooperativa,
      display: `${c.nombre_cooperativa} (${c.nit_cooperativa})`
    }));
    
    res.json(cooperativas);
  } catch (err) {
    console.error("Error obteniendo cooperativas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/cooperativas/solicitud
router.post('/cooperativas/solicitud', async (req, res) => {
  try {
    const data = req.body;
    
    // Hash de la contraseña del administrador local
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(data.contrasena_admin, salt);

    const query = `
      INSERT INTO solicitud_afiliacion (
        nit_cooperativa, nombre_cooperativa, correo_cooperativa, telefono_cooperativa, 
        direccion_cooperativa, sitio_web, nombre_representante, cedula_representante, 
        cargo_representante, correo_representante, telefono_representante, lineas_credito, 
        cantidad_socios, necesita_migracion, contrasena_admin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id_solicitud;
    `;
    
    const values = [
      data.nit_cooperativa, data.nombre_cooperativa, data.correo_cooperativa, data.telefono_cooperativa,
      data.direccion_cooperativa, data.sitio_web, data.nombre_representante, data.cedula_representante,
      data.cargo_representante, data.correo_representante, data.telefono_representante, data.lineas_credito,
      data.cantidad_socios, data.necesita_migracion, hash
    ];

    await db.query(query, values);
    
    res.json({ success: true, message: "Solicitud de afiliación registrada correctamente." });
  } catch (err) {
    console.error("Error registrando la solicitud:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
  }
});

// ==========================================
// MÓDULOS MODULARIZADOS (ARQUITECTURA EN CAPAS)
// ==========================================
const authRoutes = require('./auth.routes');
const superadminRoutes = require('./superadmin.routes');

router.use('/auth', authRoutes);
router.use('/superadmin', superadminRoutes);

// ==========================================
// MÓDULO ADMINISTRADOR LOCAL
// ==========================================

// GET /api/admin/usuarios
router.get('/admin/usuarios', authenticateJWT, authorizeRoles('admin_local'), requireCooperativaFromQuery('cooperativaId'), async (req, res) => {
  try {
    const { cooperativaId } = req.query;
    if (!cooperativaId) {
      return res.status(400).json({ error: "Falta cooperativaId" });
    }

    // Si se filtra por socio, hacer JOIN con la tabla socio
    const { rows } = await db.query(`
      SELECT
        u.id_usuario,
        u.nombre_usuario,
        u.documento_usuario,
        u.correo_usuario,
        u.telefono_usuario,
        u.rol_usuario,
        u.estado_usuario,
        u.fecha_creacion_usuario
      FROM usuario u
      WHERE u.id_cooperativa_usuario = $1
        AND u.rol_usuario != 'super_admin'
        AND u.rol_usuario != 'admin_local'
      ORDER BY u.id_usuario DESC
    `, [cooperativaId]);

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo usuarios locales:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/admin/usuarios
router.post('/admin/usuarios', authenticateJWT, authorizeRoles('admin_local'), requireCooperativaFromBody('id_cooperativa'), async (req, res) => {
  try {
    const { id_cooperativa, nombre, correo, documento, telefono, rol, contrasena } = req.body;
    
    if (!id_cooperativa || !nombre || !correo || !documento || !rol || !contrasena) {
      return res.status(400).json({ error: "Todos los campos obligatorios (*) deben ser completados." });
    }

    // Sanitizar documento (eliminar puntos y espacios)
    const documentoSanitizado = documento.toString().trim().replace(/[\.\s]/g, '');
    if (!/^\d+$/.test(documentoSanitizado)) {
      return res.status(400).json({ error: "El documento de identidad solo debe contener números." });
    }
    
    // Verificar duplicados de correo o documento
    const dupCheck = await db.query(`
      SELECT id_usuario FROM usuario WHERE correo_usuario = $1 OR documento_usuario = $2
    `, [correo.trim().toLowerCase(), documentoSanitizado]);
    
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: "El correo o documento ya se encuentra registrado." });
    }

    const validRoles = ['analista', 'cajero', 'gerente', 'gestor_financiero'];
    if (!validRoles.includes(rol.toLowerCase().trim())) {
      return res.status(400).json({ error: "Rol no válido." });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(contrasena, salt);

    const query = `
      INSERT INTO usuario (id_cooperativa_usuario, nombre_usuario, documento_usuario, correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, telefono_usuario)
      VALUES ($1, $2, $3, $4, $5, $6, 'activo', $7)
      RETURNING id_usuario;
    `;
    const values = [id_cooperativa, nombre.trim(), documentoSanitizado, correo.trim().toLowerCase(), hash, rol.toLowerCase().trim(), telefono ? telefono.trim() : null];
    await db.query(query, values);

    res.json({ success: true, message: "Usuario creado exitosamente." });
  } catch (err) {
    console.error("Error registrando usuario manual:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT /api/admin/usuarios/:id
router.put('/admin/usuarios/:id', authenticateJWT, authorizeRoles('admin_local'), async (req, res) => {
  try {
    const { nombre, correo, documento, telefono } = req.body;
    const userId = req.params.id;

    if (!nombre || !correo || !documento) {
      return res.status(400).json({ error: "Nombre, correo y documento son obligatorios." });
    }

    const scopeRes = await db.query(`SELECT id_cooperativa_usuario FROM usuario WHERE id_usuario = $1`, [userId]);
    if (scopeRes.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    if (String(scopeRes.rows[0].id_cooperativa_usuario) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado." });
    }

    // Verificar duplicados para otros usuarios
    const dupCheck = await db.query(`
      SELECT id_usuario FROM usuario 
      WHERE (correo_usuario = $1 OR documento_usuario = $2) AND id_usuario != $3
    `, [correo.trim().toLowerCase(), documento.trim(), userId]);

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: "El correo o documento ya pertenece a otro usuario." });
    }

    await db.query(`
      UPDATE usuario 
      SET nombre_usuario = $1, correo_usuario = $2, documento_usuario = $3, telefono_usuario = $4
      WHERE id_usuario = $5
    `, [nombre.trim(), correo.trim().toLowerCase(), documento.trim(), telefono ? telefono.trim() : null, userId]);

    res.json({ success: true, message: "Usuario actualizado exitosamente." });
  } catch (err) {
    console.error("Error editando usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PATCH /api/admin/usuarios/:id/rol
router.patch('/admin/usuarios/:id/rol', authenticateJWT, authorizeRoles('admin_local'), async (req, res) => {
  try {
    const { rol } = req.body;
    const userId = req.params.id;

    const scopeRes = await db.query(`SELECT id_cooperativa_usuario FROM usuario WHERE id_usuario = $1`, [userId]);
    if (scopeRes.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    if (String(scopeRes.rows[0].id_cooperativa_usuario) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado." });
    }

    const validRoles = ['analista', 'cajero', 'gerente', 'gestor_financiero'];
    if (!rol || !validRoles.includes(rol.toLowerCase().trim())) {
      return res.status(400).json({ error: "Rol no válido." });
    }

    await db.query(`
      UPDATE usuario 
      SET rol_usuario = $1
      WHERE id_usuario = $2
    `, [rol.toLowerCase().trim(), userId]);

    res.json({ success: true, message: "Rol de usuario actualizado." });
  } catch (err) {
    console.error("Error cambiando rol de usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PATCH /api/admin/usuarios/:id/estado
router.patch('/admin/usuarios/:id/estado', authenticateJWT, authorizeRoles('admin_local'), async (req, res) => {
  try {
    const { estado } = req.body;
    const userId = req.params.id;

    const scopeRes = await db.query(`SELECT id_cooperativa_usuario FROM usuario WHERE id_usuario = $1`, [userId]);
    if (scopeRes.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    if (String(scopeRes.rows[0].id_cooperativa_usuario) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado." });
    }

    if (!estado || (estado !== 'activo' && estado !== 'inactivo')) {
      return res.status(400).json({ error: "Estado no válido." });
    }

    await db.query(`
      UPDATE usuario 
      SET estado_usuario = $1
      WHERE id_usuario = $2
    `, [estado, userId]);

    res.json({ success: true, message: `Usuario marcado como ${estado} con éxito.` });
  } catch (err) {
    console.error("Error cambiando estado de usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/admin/usuarios/bulk
router.post('/admin/usuarios/bulk', authenticateJWT, authorizeRoles('admin_local'), requireCooperativaFromBody('id_cooperativa'), async (req, res) => {
  const client = await db.connect();
  try {
    const { id_cooperativa, usuarios } = req.body;
    if (!id_cooperativa || !Array.isArray(usuarios)) {
      return res.status(400).json({ error: "Faltan datos requeridos." });
    }

    await client.query('BEGIN');

    let importados = 0;
    let errores = 0;
    const errorDetails = [];
    const processedEmails = new Set();
    const processedDocuments = new Set();

    for (let i = 0; i < usuarios.length; i++) {
      const u = usuarios[i];
      const rowNum = i + 1;
      const nombre = (u.nombre || '').toString().trim();
      const correo = (u.correo || '').toString().trim();
      const rawDocumento = (u.documento || '').toString().trim();
      const telefono = u.telefono ? u.telefono.toString().trim() : '';
      let rol = (u.rol || '').toLowerCase().trim();

      // Sanitizar documento: quitar puntos (.) y espacios
      const documento = rawDocumento.replace(/[\.\s]/g, '');

      // 1. Validar campos obligatorios
      if (!nombre || !correo || !rawDocumento || !rol) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Faltan campos obligatorios (nombre, correo, documento, rol).`);
        continue;
      }

      // 2. Validar que el documento sea estrictamente numérico (sin letras)
      if (!/^\d+$/.test(documento)) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Documento "${rawDocumento}" inválido (solo debe contener números).`);
        continue;
      }

      // 3. Validar longitud del documento
      if (documento.length < 5 || documento.length > 15) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Documento debe tener entre 5 y 15 dígitos.`);
        continue;
      }

      // 4. Validar formato de correo electrónico
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Correo electrónico "${correo}" inválido.`);
        continue;
      }

      // 5. Validar y normalizar rol (ej: "gestor_financiero" o "gestor financiero" o "analista")
      let rolNormalizado = rol.replace(/\s+/g, '_');
      const validRoles = ['analista', 'cajero', 'gerente', 'gestor_financiero'];
      if (!validRoles.includes(rolNormalizado)) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Rol no válido "${u.rol}".`);
        continue;
      }

      // 6. Validar duplicados dentro de este lote/archivo
      if (processedEmails.has(correo.toLowerCase())) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Correo electrónico duplicado en el mismo lote.`);
        continue;
      }
      if (processedDocuments.has(documento)) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Documento duplicado en el mismo lote.`);
        continue;
      }

      // 7. Validar duplicados en la Base de Datos
      const dupCheck = await client.query(`
        SELECT id_usuario FROM usuario WHERE correo_usuario = $1 OR documento_usuario = $2
      `, [correo.trim().toLowerCase(), documento]);

      if (dupCheck.rows.length > 0) {
        errores++;
        errorDetails.push(`Fila ${rowNum}: Correo o documento ya registrado en el sistema.`);
        continue;
      }

      processedEmails.add(correo.toLowerCase());
      processedDocuments.add(documento);

      const contrasenaTemporal = documento;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(contrasenaTemporal, salt);

      const query = `
        INSERT INTO usuario (id_cooperativa_usuario, nombre_usuario, documento_usuario, correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, telefono_usuario)
        VALUES ($1, $2, $3, $4, $5, $6, 'activo', $7)
      `;
      const values = [
        id_cooperativa,
        nombre.trim(),
        documento,
        correo.trim().toLowerCase(),
        hash,
        rolNormalizado,
        telefono ? telefono.trim() : null
      ];

      await client.query(query, values);
      importados++;
    }

    await client.query('COMMIT');
    res.json({ success: true, importados, errores, errorDetails });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error en importación masiva:", err);
    res.status(500).json({ error: "Error interno del servidor durante la importación masiva." });
  } finally {
    client.release();
  }
});

// POST /api/admin/perfil/contrasena
router.post('/admin/perfil/contrasena', authenticateJWT, requireSameUserBody('id_usuario'), async (req, res) => {
  try {
    const { id_usuario, contrasenaActual, contrasenaNueva } = req.body;
    if (!id_usuario || !contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const { rows } = await db.query(`
      SELECT contrasena_usuario FROM usuario WHERE id_usuario = $1
    `, [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(contrasenaActual, user.contrasena_usuario);
    if (!isValid) {
      return res.status(401).json({ error: "La contraseña actual no es correcta." });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(contrasenaNueva, salt);

    await db.query(`
      UPDATE usuario SET contrasena_usuario = $1 WHERE id_usuario = $2
    `, [hash, id_usuario]);

    res.json({ success: true, message: "Contraseña actualizada exitosamente." });
  } catch (err) {
    console.error("Error actualizando contraseña:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// MÓDULOS DE ROLES ADICIONALES (LIVE DB)
// ==========================================

// GET /api/socio/resumen/:userId
router.get('/socio/resumen/:userId', authenticateJWT, authorizeRoles('socio'), requireSameUserParam('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Obtener socio y datos de usuario
    const socioRes = await db.query(`
      SELECT s.*, u.nombre_usuario, u.documento_usuario, u.correo_usuario 
      FROM socio s
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      WHERE u.id_usuario = $1
    `, [userId]);

    if (socioRes.rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    const socio = socioRes.rows[0];

    // 2. Obtener TODOS los créditos (activos + pagados) con su línea
    const creditosRes = await db.query(`
      SELECT c.*, lc.nombre_linea 
      FROM credito c
      LEFT JOIN linea_credito lc ON c.id_linea_credito = lc.id_linea_credito
      WHERE c.id_socio_credito = $1 AND c.estado_credito IN ('activo', 'pagado')
      ORDER BY c.estado_credito ASC, c.fecha_creacion_credito DESC
    `, [socio.id_socio]);

    // Para compatibilidad: mantener credito (primero) y cuotas del primero
    let credito = null;
    let cuotas = [];
    let moraInfo = { inMora: false, diasMora: 0, montoMora: 0, interesMora: 0 };

    // Construir array de créditos con sus cuotas individuales
    const creditos = [];
    for (const cred of creditosRes.rows) {
      const cuotasRes = await db.query(`
        SELECT * FROM cuota WHERE id_credito_cuota = $1 ORDER BY numero_cuota
      `, [cred.id_credito]);
      
      creditos.push({
        ...cred,
        cuotas: cuotasRes.rows
      });
    }

    if (creditos.length > 0) {
      credito = creditos[0]; // Compatibilidad con frontend existente
      cuotas = creditos[0].cuotas;

      // Calcular mora global (solo de créditos activos)
      const creditosActivos = creditos.filter(c => c.estado_credito === 'activo');
      const allCuotas = creditosActivos.flatMap(c => c.cuotas);
      const overdueCuotas = allCuotas.filter(c => c.estado_cuota === 'pendiente' && new Date(c.fecha_vencimiento_cuota) < new Date());
      if (overdueCuotas.length > 0) {
        moraInfo.inMora = true;
        
        // Suma de cuotas vencidas
        const totalVencido = overdueCuotas.reduce((acc, c) => acc + parseFloat(c.valor_cuota), 0);
        moraInfo.montoMora = totalVencido;

        // Calcular días de mora del vencimiento más antiguo
        const earliestVencimiento = new Date(Math.min(...overdueCuotas.map(c => new Date(c.fecha_vencimiento_cuota))));
        const diffTime = Math.abs(new Date() - earliestVencimiento);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        moraInfo.diasMora = diffDays;

        // Interés moratorio acumulado
        const tasaMora = parseFloat(credito.tasa_moratoria_credito || 2.5);
        const interesCalculado = totalVencido * (tasaMora / 100) * (diffDays / 30.0);
        moraInfo.interesMora = parseFloat(interesCalculado.toFixed(2));
      }
    }

    // 3. Verificar si el ahorro del mes actual ya fue pagado
    // Buscamos un depósito en el mes corriente
    const ahorroMesRes = await db.query(`
      SELECT id_movimiento FROM movimiento_ahorro 
      WHERE id_socio_movimiento = $1 
        AND tipo_movimiento = 'deposito' 
        AND fecha_movimiento >= DATE_TRUNC('month', CURRENT_DATE)
      LIMIT 1
    `, [socio.id_socio]);
    const ahorroMesPagado = ahorroMesRes.rows.length > 0;

    // 4. Contar notificaciones no leídas
    const notifCountRes = await db.query(`
      SELECT COUNT(*)::int AS unread 
      FROM notificacion 
      WHERE id_socio_notificacion = $1 AND enviada_notificacion = false
    `, [socio.id_socio]);
    const unreadNotifications = notifCountRes.rows[0] ? notifCountRes.rows[0].unread : 0;

    res.json({ 
      socio, 
      credito, 
      creditos,  // NUEVO: array completo de créditos con cuotas
      cuotas, 
      moraInfo, 
      ahorroMesPagado, 
      unreadNotifications 
    });
  } catch (err) {
    console.error("Error en resumen socio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/socio/resumen/doc/:doc
router.get('/socio/resumen/doc/:doc', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  try {
    const { doc } = req.params;
    const socioRes = await db.query(`
      SELECT s.*, u.nombre_usuario, u.documento_usuario 
      FROM socio s
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      WHERE u.documento_usuario = $1 LIMIT 1
    `, [doc]);

    if (socioRes.rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    const socio = socioRes.rows[0];

    if (String(socio.id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado." });
    }

    const creditosRes = await db.query(`
      SELECT
        cr.*,
        cu.id_cuota AS next_id_cuota,
        cu.numero_cuota AS next_numero_cuota,
        cu.valor_cuota AS next_valor_cuota,
        cu.interes_corriente_cuota AS next_interes_corriente_cuota,
        cu.fecha_vencimiento_cuota AS next_fecha_vencimiento_cuota
      FROM credito cr
      LEFT JOIN LATERAL (
        SELECT id_cuota, numero_cuota, valor_cuota, interes_corriente_cuota, fecha_vencimiento_cuota
        FROM cuota
        WHERE id_credito_cuota = cr.id_credito AND estado_cuota = 'pendiente'
        ORDER BY numero_cuota
        LIMIT 1
      ) cu ON true
      WHERE cr.id_socio_credito = $1 AND cr.estado_credito = 'activo'
      ORDER BY cr.id_credito
    `, [socio.id_socio]);
    const creditos = creditosRes.rows || [];
    const credito = creditos.length > 0 ? creditos[0] : null;

    res.json({ socio, credito, creditos });
  } catch (err) {
    console.error("Error buscando socio por doc:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/socio/solicitar
router.post('/socio/solicitar', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  try {
    const { id_socio, id_linea, monto, plazo, proposito } = req.body;

    if (!id_socio || !monto || !plazo || !proposito) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // 1. Obtener socio y validar ahorros
    const socioRes = await db.query(`
      SELECT saldo_ahorros_socio, id_cooperativa_socio FROM socio WHERE id_socio = $1
    `, [id_socio]);

    if (socioRes.rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    const socio = socioRes.rows[0];
    const saldoAhorros = parseFloat(socio.saldo_ahorros_socio || 0);
    const montoRequeridoAhorro = parseFloat(monto) * 0.15;

    if (saldoAhorros < montoRequeridoAhorro) {
      return res.status(400).json({ 
        error: `Tu saldo de ahorros actual ($${saldoAhorros.toLocaleString('es-CO')}) es inferior al 15% del monto solicitado. Requieres un ahorro mínimo de $${montoRequeridoAhorro.toLocaleString('es-CO')} para radicar este crédito.` 
      });
    }

    let idLinea = id_linea ? parseInt(id_linea) : null;
    if (idLinea && !Number.isFinite(idLinea)) idLinea = null;

    const lineRes = await db.query(`
      SELECT id_linea_credito FROM linea_credito 
      WHERE id_cooperativa_linea = $1
      ORDER BY id_linea_credito ASC
    `, [socio.id_cooperativa_socio]);

    if (lineRes.rows.length === 0) {
      return res.status(400).json({ error: "No hay líneas de crédito activas registradas para tu cooperativa." });
    }
    const lineIds = lineRes.rows.map(r => parseInt(r.id_linea_credito));
    if (!idLinea) idLinea = lineIds[0];
    if (!lineIds.includes(idLinea)) {
      return res.status(400).json({ error: "Línea de crédito inválida para tu cooperativa." });
    }

    const configRes = await db.query(`
      SELECT id_config FROM config_linea 
      WHERE id_linea_config = $1
      ORDER BY fecha_actualizacion_config DESC
      LIMIT 1
    `, [idLinea]);

    if (configRes.rows.length === 0) {
      return res.status(400).json({ error: "No hay una configuración financiera activa para la línea de crédito seleccionada." });
    }
    const id_config = configRes.rows[0].id_config;

    const query = `
      INSERT INTO solicitud_credito (
        id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
        monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
        estado_solicitud, fecha_solicitud
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', NOW()) RETURNING id_solicitud
    `;

    const { rows } = await db.query(query, [id_socio, idLinea, id_config, monto, plazo, proposito]);
    
    // Crear notificación del sistema automática
    await db.query(`
      INSERT INTO notificacion (
        id_socio_notificacion, tipo_notificacion, asunto_notificacion,
        mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
      ) VALUES ($1, 'credito_solicitado', 'Solicitud Radicada', 'Tu solicitud de estudio para crédito por valor de $' || $2 || ' ha sido radicada y se encuentra en revisión.', false, NOW())
    `, [id_socio, parseFloat(monto).toLocaleString('es-CO')]);

    res.json({ success: true, id: rows[0].id_solicitud });

  } catch (err) {
    console.error("Error registrando solicitud:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la solicitud de crédito." });
  }
});

// POST /api/socio/pagar-ahorro
router.post('/socio/pagar-ahorro', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  try {
    const { id_socio, monto } = req.body;
    if (!id_socio || !monto || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: "Monto inválido para realizar el ahorro." });
    }

    const { rows } = await db.query(`
      UPDATE socio 
      SET saldo_ahorros_socio = saldo_ahorros_socio + $1 
      WHERE id_socio = $2 
      RETURNING saldo_ahorros_socio
    `, [monto, id_socio]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }

    const movRes = await db.query(`
      INSERT INTO movimiento_ahorro (
        id_socio_movimiento, monto_movimiento, tipo_movimiento, 
        descripcion_movimiento, fecha_movimiento
      ) VALUES ($1, $2, 'deposito', 'Pago de cuota de ahorro mensual (Pasarela Nequi)', NOW())
      RETURNING id_movimiento
    `, [id_socio, monto]);
    const id_movimiento = movRes.rows[0] ? movRes.rows[0].id_movimiento : null;

    // Crear notificación del sistema
    await db.query(`
      INSERT INTO notificacion (
        id_socio_notificacion, tipo_notificacion, asunto_notificacion,
        mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
      ) VALUES ($1, 'deposito', 'Depósito Registrado', 'Has depositado $' || $2 || ' a tu cuenta de ahorros a través de Nequi.', false, NOW())
    `, [id_socio, parseFloat(monto).toLocaleString('es-CO')]);

    res.json({ success: true, message: "Ahorro registrado exitosamente.", nuevoSaldo: rows[0].saldo_ahorros_socio, id_movimiento });
  } catch (err) {
    console.error("Error al registrar ahorro:", err);
    res.status(500).json({ error: "Error interno al procesar el depósito." });
  }
});

// POST /api/socio/retirar-ahorro
router.post('/socio/retirar-ahorro', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  try {
    const { id_socio, monto } = req.body;
    if (!id_socio || !monto || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: "Monto inválido para realizar el retiro." });
    }

    const socioRes = await db.query(`SELECT saldo_ahorros_socio FROM socio WHERE id_socio = $1`, [id_socio]);
    if (socioRes.rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }

    const saldoAhorros = parseFloat(socioRes.rows[0].saldo_ahorros_socio || 0);
    const montoRetirar = parseFloat(monto);

    if (saldoAhorros < montoRetirar) {
      return res.status(400).json({ error: "Saldo de ahorros insuficiente para realizar este retiro." });
    }

    const { rows } = await db.query(`
      UPDATE socio 
      SET saldo_ahorros_socio = saldo_ahorros_socio - $1 
      WHERE id_socio = $2 
      RETURNING saldo_ahorros_socio
    `, [montoRetirar, id_socio]);

    await db.query(`
      INSERT INTO movimiento_ahorro (
        id_socio_movimiento, monto_movimiento, tipo_movimiento, 
        descripcion_movimiento, fecha_movimiento
      ) VALUES ($1, $2, 'retiro', 'Retiro de ahorros solicitado por el socio', NOW())
    `, [id_socio, montoRetirar]);

    // Crear notificación del sistema
    await db.query(`
      INSERT INTO notificacion (
        id_socio_notificacion, tipo_notificacion, asunto_notificacion,
        mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
      ) VALUES ($1, 'retiro', 'Retiro Procesado', 'Has retirado $' || $2 || ' de tu cuenta de ahorros.', false, NOW())
    `, [id_socio, parseFloat(montoRetirar).toLocaleString('es-CO')]);

    res.json({ success: true, message: "Retiro procesado exitosamente.", nuevoSaldo: rows[0].saldo_ahorros_socio });
  } catch (err) {
    console.error("Error al retirar ahorros:", err);
    res.status(500).json({ error: "Error interno al procesar el retiro." });
  }
});

// GET /api/socio/historial/:socioId  (SOLO movimientos de ahorro — usado por gráfica y tab Ahorros)
router.get('/socio/historial/:socioId', authenticateJWT, authorizeRoles('socio'), requireSameSocioParam('socioId'), async (req, res) => {
  try {
    const { socioId } = req.params;
    
    // Obtener movimientos de ahorro ordenados
    const { rows } = await db.query(`
      SELECT 
        fecha_movimiento AS fecha,
        tipo_movimiento AS tipo,
        monto_movimiento AS monto,
        descripcion_movimiento AS descripcion
      FROM movimiento_ahorro
      WHERE id_socio_movimiento = $1
      ORDER BY fecha_movimiento DESC
    `, [socioId]);

    res.json(rows);
  } catch (err) {
    console.error("Error al cargar historial del socio:", err);
    res.status(500).json({ error: "Error interno del servidor al cargar el historial." });
  }
});

// GET /api/socio/historial-completo/:socioId  (Ahorros + Pagos de crédito — usado por tab Historial)
router.get('/socio/historial-completo/:socioId', authenticateJWT, authorizeRoles('socio'), requireSameSocioParam('socioId'), async (req, res) => {
  try {
    const { socioId } = req.params;
    
    const { rows } = await db.query(`
      SELECT 
        fecha_movimiento AS fecha,
        tipo_movimiento::TEXT AS tipo,
        monto_movimiento AS monto,
        descripcion_movimiento AS descripcion
      FROM movimiento_ahorro
      WHERE id_socio_movimiento = $1

      UNION ALL

      SELECT 
        p.fecha_pago AS fecha,
        'pago_credito' AS tipo,
        p.monto_total_pago AS monto,
        'Pago de crédito — Recibo #' || p.numero_recibo_pago || ' (' || p.canal_pago || ')' AS descripcion
      FROM pago p
      WHERE p.id_socio_pago = $1

      ORDER BY fecha DESC
    `, [socioId]);

    res.json(rows);
  } catch (err) {
    console.error("Error al cargar historial completo del socio:", err);
    res.status(500).json({ error: "Error interno del servidor al cargar el historial." });
  }
});

// GET /api/socio/credito/:idCredito/pagos
router.get('/socio/credito/:idCredito/pagos', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const { idCredito } = req.params;
    const scopeRes = await db.query(`SELECT id_socio_credito FROM credito WHERE id_credito = $1`, [idCredito]);
    if (scopeRes.rows.length === 0) {
      return res.status(404).json({ error: "Crédito no encontrado." });
    }
    if (String(scopeRes.rows[0].id_socio_credito) !== String(req.user.id_socio)) {
      return res.status(403).json({ error: "No autorizado." });
    }

    const { rows } = await db.query(`
      SELECT 
        p.id_pago AS id_pago,
        p.fecha_pago AS fecha,
        p.numero_recibo_pago AS recibo,
        p.canal_pago AS canal,
        pd.monto_aplicado_pagodetalle AS monto,
        c.numero_cuota AS cuota_num
      FROM pago_detalle pd
      JOIN pago p ON pd.id_pago_pagodetalle = p.id_pago
      JOIN cuota c ON pd.id_cuota_pagodetalle = c.id_cuota
      WHERE c.id_credito_cuota = $1
      ORDER BY p.fecha_pago DESC
    `, [idCredito]);

    res.json(rows);
  } catch (err) {
    console.error("Error al cargar historial de pagos del crédito:", err);
    res.status(500).json({ error: "Error interno al cargar el historial de pagos." });
  }
});

// POST /api/socio/pagar-cuota
router.post('/socio/pagar-cuota', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  const client = await db.connect();
  try {
    const { id_cuota, id_socio, metodo, tipo_pago, monto_pago, accion_extra } = req.body;
    if (!id_cuota || !id_socio || !metodo || !tipo_pago || !monto_pago) {
      return res.status(400).json({ error: "Parámetros insuficientes para realizar el pago." });
    }

    await client.query('BEGIN');

    // 1. Obtener detalles de la cuota y del crédito
    const cuotaRes = await client.query(`
      SELECT c.*, cr.id_credito, cr.saldo_pendiente_credito, cr.tasa_interes_credito, cr.tasa_moratoria_credito, cr.id_socio_credito
      FROM cuota c
      JOIN credito cr ON c.id_credito_cuota = cr.id_credito
      WHERE c.id_cuota = $1 AND c.estado_cuota = 'pendiente'
    `, [id_cuota]);

    if (cuotaRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Cuota no encontrada o ya se encuentra pagada." });
    }
    const cuota = cuotaRes.rows[0];
    if (String(cuota.id_socio_credito) !== String(id_socio)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: "No autorizado." });
    }

    const oldestRes = await client.query(
      `
        SELECT id_cuota, numero_cuota
        FROM cuota
        WHERE id_credito_cuota = $1 AND estado_cuota = 'pendiente'
        ORDER BY numero_cuota
        LIMIT 1
      `,
      [cuota.id_credito]
    );
    if (oldestRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "No hay cuotas pendientes para este crédito." });
    }
    if (String(oldestRes.rows[0].id_cuota) !== String(id_cuota)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Debes pagar primero la cuota más antigua pendiente (#${oldestRes.rows[0].numero_cuota}).` });
    }

    const valorPago = parseFloat(monto_pago);
    const valorCuota = parseFloat(cuota.valor_cuota);

    const dueDate = cuota.fecha_vencimiento_cuota ? new Date(cuota.fecha_vencimiento_cuota) : null;
    let diasMora = 0;
    if (dueDate) {
      const diffMs = Date.now() - dueDate.getTime();
      if (diffMs > 0) diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
    const tasaMora = parseFloat(cuota.tasa_moratoria_credito || 2.5);
    const interesMora = parseFloat((valorCuota * (tasaMora / 100) * (diasMora / 30)).toFixed(2));
    const baseCuotaConMora = valorCuota + interesMora;

    const saldoPendiente = parseFloat(cuota.saldo_pendiente_credito);
    const interesCorriente = parseFloat(cuota.interes_corriente_cuota || 0);
    const maximoPermitido = saldoPendiente + interesCorriente + interesMora;

    // Si excede el máximo permitido para liquidar la obligación completa
    if (valorPago > maximoPermitido + 0.05) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
            error: `El monto a pagar ($${valorPago.toLocaleString('es-CO')}) excede el valor total necesario para liquidar el crédito ($${maximoPermitido.toLocaleString('es-CO')}).` 
        });
    }

    // Si el pago extraordinario es exactamente igual al total necesario para liquidar, forzamos liquidación total
    let tipoPagoEfectivo = tipo_pago;
    if (tipo_pago === 'extra' && Math.abs(valorPago - maximoPermitido) <= 0.05) {
        tipoPagoEfectivo = 'total';
    }

    if (tipo_pago === 'normal') {
      if (Math.abs(valorPago - baseCuotaConMora) > 0.05) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "El monto debe ser igual al valor de la cuota (incluyendo mora) para un pago normal." });
      }
    } else if (tipoPagoEfectivo === 'total') {
      if (valorPago < maximoPermitido - 0.05) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "El monto es insuficiente para realizar el pago total del crédito." });
      }
    } else if (tipo_pago === 'extra') {
      if (valorPago <= baseCuotaConMora + 0.05) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Para 'otro valor' el monto debe ser mayor al valor de la cuota (incluyendo mora)." });
      }
      if (accion_extra !== 'cuota' && accion_extra !== 'plazo') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Debes seleccionar si deseas reducir 'cuota' o reducir 'plazo'." });
      }
    }

    // 2. Cobrar de ahorros si aplica
    if (metodo === 'ahorros') {
      const socioRes = await client.query(`SELECT saldo_ahorros_socio FROM socio WHERE id_socio = $1`, [id_socio]);
      if (socioRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Socio no encontrado." });
      }
      const saldoAhorros = parseFloat(socioRes.rows[0].saldo_ahorros_socio || 0);
      if (saldoAhorros < valorPago) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Saldo de ahorros insuficiente para realizar el pago." });
      }

      await client.query(`UPDATE socio SET saldo_ahorros_socio = saldo_ahorros_socio - $1 WHERE id_socio = $2`, [valorPago, id_socio]);

      await client.query(`
        INSERT INTO movimiento_ahorro (
          id_socio_movimiento, monto_movimiento, tipo_movimiento, 
          descripcion_movimiento, fecha_movimiento
        ) VALUES ($1, $2, 'retiro', $3, NOW())
      `, [id_socio, valorPago, `Débito por pago de crédito (Cuota #${cuota.numero_cuota})`]);
    }

    // 3. Registrar tabla pago
    const canal = 'virtual';
    const ref = `PAG-${Math.floor(100000 + Math.random() * 900000)}`;
    const pagoRes = await client.query(`
      INSERT INTO pago (
        id_socio_pago, monto_total_pago, canal_pago, uso_ahorros_pago, 
        monto_ahorros_usado_pago, numero_recibo_pago, fecha_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id_pago
    `, [id_socio, valorPago, canal, metodo === 'ahorros', metodo === 'ahorros' ? valorPago : 0, ref]);
    const id_pago = pagoRes.rows[0].id_pago;

    await client.query(`
      INSERT INTO pago_detalle (
        id_pago_pagodetalle, id_cuota_pagodetalle, monto_aplicado_pagodetalle,
        dias_mora_pagodetalle, interes_mora_pagodetalle
      ) VALUES ($1, $2, $3, $4, $5)
    `, [id_pago, id_cuota, valorPago, diasMora, interesMora]);

    // 4. Procesar la Lógica Financiera según el Tipo de Pago
    let nuevoSaldoPendiente = parseFloat(cuota.saldo_pendiente_credito);

    if (tipoPagoEfectivo === 'total') {
        // LIQUIDACIÓN TOTAL
        nuevoSaldoPendiente = 0;
        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_credito_cuota = $1 AND estado_cuota = 'pendiente'`, [cuota.id_credito]);
        await client.query(`UPDATE credito SET saldo_pendiente_credito = 0, estado_credito = 'pagado' WHERE id_credito = $1`, [cuota.id_credito]);
        
    } else if (tipoPagoEfectivo === 'normal') {
        // PAGO NORMAL
        nuevoSaldoPendiente = Math.max(0, nuevoSaldoPendiente - parseFloat(cuota.abono_capital_cuota));
        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_cuota = $1`, [id_cuota]);
        await client.query(`UPDATE credito SET saldo_pendiente_credito = $1, estado_credito = $2 WHERE id_credito = $3`, [nuevoSaldoPendiente, nuevoSaldoPendiente <= 0.05 ? 'pagado' : 'activo', cuota.id_credito]);
        
    } else if (tipoPagoEfectivo === 'extra') {
        // ABONO EXTRAORDINARIO
        const excedente = valorPago - baseCuotaConMora;
        const abonoCapitalTotal = parseFloat(cuota.abono_capital_cuota) + excedente;
        nuevoSaldoPendiente = Math.max(0, nuevoSaldoPendiente - abonoCapitalTotal);
        
        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_cuota = $1`, [id_cuota]);
        await client.query(`UPDATE credito SET saldo_pendiente_credito = $1, estado_credito = $2 WHERE id_credito = $3`, [nuevoSaldoPendiente, nuevoSaldoPendiente <= 0.05 ? 'pagado' : 'activo', cuota.id_credito]);

        if (nuevoSaldoPendiente > 0.05) {
            // Eliminar todas las cuotas pendientes futuras para regenerarlas
            await client.query(`DELETE FROM cuota WHERE id_credito_cuota = $1 AND estado_cuota = 'pendiente'`, [cuota.id_credito]);
            
            // Obtener cuántas cuotas faltaban originalmente
            const cuotasRes = await client.query(`SELECT COUNT(*) as count FROM cuota WHERE id_credito_cuota = $1 AND estado_cuota = 'pagada'`, [cuota.id_credito]);
            const cuotasPagadas = parseInt(cuotasRes.rows[0].count);
            
            const credRes = await client.query(`SELECT plazo_meses_credito FROM credito WHERE id_credito = $1`, [cuota.id_credito]);
            const plazoTotal = parseInt(credRes.rows[0].plazo_meses_credito);
            let cuotasRestantes = plazoTotal - cuotasPagadas;

            const mvRate = parseFloat(cuota.tasa_interes_credito) / 100;
            let nuevoValorCuota = parseFloat(cuota.valor_cuota);
            let nuevoPlazoMeses = cuotasRestantes;

            if (accion_extra === 'cuota') {
                // REDUCIR CUOTA: Mantiene el plazo, recalcula PMT
                nuevoValorCuota = (nuevoSaldoPendiente * mvRate) / (1 - Math.pow(1 + mvRate, -cuotasRestantes));
            } else {
                // REDUCIR PLAZO: Mantiene valor de cuota actual, calcula cuántos meses alcanza
                const logNumerator = 1 - ((mvRate * nuevoSaldoPendiente) / nuevoValorCuota);
                if (logNumerator <= 0) {
                     nuevoPlazoMeses = 1;
                } else {
                     nuevoPlazoMeses = Math.ceil(-Math.log(logNumerator) / Math.log(1 + mvRate));
                }
            }

            // Regenerar tabla de amortización para el futuro
            let saldoRestanteLoop = nuevoSaldoPendiente;
            const baseDate = new Date(cuota.fecha_vencimiento_cuota);

            for (let i = 1; i <= nuevoPlazoMeses; i++) {
                const interesCorriente = saldoRestanteLoop * mvRate;
                let abonoCapital = nuevoValorCuota - interesCorriente;
                
                // Ajustar última cuota si se pasa
                if (abonoCapital >= saldoRestanteLoop || i === nuevoPlazoMeses) {
                    abonoCapital = saldoRestanteLoop;
                    nuevoValorCuota = abonoCapital + interesCorriente;
                }

                const saldoRestanteCuota = Math.max(0, saldoRestanteLoop - abonoCapital);
                const fechaVence = new Date(baseDate);
                fechaVence.setMonth(fechaVence.getMonth() + i);

                await client.query(`
                    INSERT INTO cuota (
                        id_credito_cuota, numero_cuota, fecha_vencimiento_cuota,
                        valor_cuota, abono_capital_cuota, interes_corriente_cuota,
                        saldo_restante_cuota, estado_cuota
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
                `, [cuota.id_credito, cuotasPagadas + i, fechaVence, nuevoValorCuota, abonoCapital, interesCorriente, saldoRestanteCuota]);

                saldoRestanteLoop = saldoRestanteCuota;
                if (saldoRestanteLoop <= 0) break;
            }
        }
    }

    // 5. Notificación
    await client.query(`
      INSERT INTO notificacion (
        id_socio_notificacion, tipo_notificacion, asunto_notificacion,
        mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
      ) VALUES ($1, 'pago_cuota', 'Pago de Crédito Registrado', $2, false, NOW())
    `, [id_socio, `Has realizado un pago por $${valorPago.toLocaleString('es-CO')} para tu crédito.`]);

    await client.query('COMMIT');
    res.json({ success: true, message: "Pago registrado exitosamente.", referencia: ref, id_pago });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error al procesar el pago de cuota:", err);
    res.status(500).json({ error: "Error interno al procesar el pago de la cuota." });
  } finally {
    client.release();
  }
});

// GET /api/socio/notificaciones/:socioId
router.get('/socio/notificaciones/:socioId', authenticateJWT, authorizeRoles('socio'), requireSameSocioParam('socioId'), async (req, res) => {
  try {
    const { socioId } = req.params;
    const { rows } = await db.query(`
      SELECT * FROM notificacion 
      WHERE id_socio_notificacion = $1 
      ORDER BY fecha_envio_notificacion DESC
    `, [socioId]);
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo notificaciones:", err);
    res.status(500).json({ error: "Error interno al obtener notificaciones." });
  }
});

// POST /api/socio/notificaciones/leer
router.post('/socio/notificaciones/leer', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  try {
    const { id_socio } = req.body;
    await db.query(`
      UPDATE notificacion 
      SET enviada_notificacion = true 
      WHERE id_socio_notificacion = $1
    `, [id_socio]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marcando notificaciones:", err);
    res.status(500).json({ error: "Error interno al marcar notificaciones." });
  }
});

// POST /api/socio/configurar-ahorro
router.post('/socio/configurar-ahorro', authenticateJWT, authorizeRoles('socio'), requireSameSocioBody('id_socio'), async (req, res) => {
  try {
    const { id_socio, monto } = req.body;
    if (!id_socio || !monto || parseFloat(monto) < 10000) {
      return res.status(400).json({ error: "Monto inválido para cuota de ahorro mensual (mínimo $10,000)." });
    }
    await db.query(`
      UPDATE socio 
      SET cuota_ahorro_socio = $1 
      WHERE id_socio = $2
    `, [monto, id_socio]);
    res.json({ success: true, message: "Cuota de ahorro mensual configurada exitosamente." });
  } catch (err) {
    console.error("Error configurando cuota de ahorro:", err);
    res.status(500).json({ error: "Error interno al configurar cuota de ahorro." });
  }
});

// POST /cajero/recaudar
router.post('/cajero/recaudar', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  const client = await db.connect();
  try {
    const { id_socio, id_credito, id_cuota, tipo, monto, operador, metodo, usar_ahorros, tipo_pago, accion_extra } = req.body;
    const valor = parseFloat(monto);
    if (!id_socio || !tipo || !monto || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: "Parámetros inválidos para recaudar." });
    }

    await client.query('BEGIN');
    const socioScope = await client.query(`SELECT id_cooperativa_socio FROM socio WHERE id_socio = $1`, [id_socio]);
    if (socioScope.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    if (String(socioScope.rows[0].id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: "No autorizado." });
    }

    const referencia = `REC-${Math.floor(100000 + Math.random() * 900000)}`;

    if (tipo === 'deposito_ahorros') {
      const ahRes = await client.query(
        `UPDATE socio SET saldo_ahorros_socio = saldo_ahorros_socio + $1 WHERE id_socio = $2 RETURNING saldo_ahorros_socio`,
        [valor, id_socio]
      );
      const movRes = await client.query(`
        INSERT INTO movimiento_ahorro (
          id_socio_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento
        ) VALUES ($1, $2, 'deposito', $3, NOW())
        RETURNING id_movimiento
      `, [id_socio, valor, `Depósito presencial registrado por ${operador || 'cajero'}`]);
      const id_movimiento = movRes.rows[0] ? movRes.rows[0].id_movimiento : null;
      const saldo_ahorros_socio = ahRes.rows[0]?.saldo_ahorros_socio ?? null;

      await client.query('COMMIT');
      return res.json({ success: true, referencia, id_movimiento, saldo_ahorros_socio });
    }

    if (tipo === 'pago_cuota') {
      if (!id_credito) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Falta id_credito para pago de cuota." });
      }

      const credRes = await client.query(`
        SELECT id_credito FROM credito WHERE id_credito = $1 AND id_socio_credito = $2
      `, [id_credito, id_socio]);
      if (credRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Crédito no encontrado para el socio." });
      }

      const cuotaRes = await client.query(`
        SELECT c.*, cr.id_credito, cr.saldo_pendiente_credito, cr.tasa_interes_credito, cr.tasa_moratoria_credito, cr.plazo_meses_credito
        FROM cuota c
        JOIN credito cr ON c.id_credito_cuota = cr.id_credito
        WHERE c.id_credito_cuota = $1
          AND c.estado_cuota = 'pendiente'
        ORDER BY c.numero_cuota
        LIMIT 1
      `, [id_credito]);
      if (cuotaRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "No hay cuotas pendientes para este crédito." });
      }
      const cuota = cuotaRes.rows[0];
      if (id_cuota && String(id_cuota) !== String(cuota.id_cuota)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Debes pagar primero la cuota más antigua pendiente (#${cuota.numero_cuota}).` });
      }
      const metodoEfectivo = metodo || (usar_ahorros ? 'ahorros' : 'efectivo');
      const tipoPagoEfectivo = tipo_pago || 'normal';
      let saldo_ahorros_socio = null;
      let saldo_pendiente_credito = null;

      if (metodoEfectivo === 'ahorros') {
        const socioRes = await client.query(`SELECT saldo_ahorros_socio FROM socio WHERE id_socio = $1`, [id_socio]);
        if (socioRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: "Socio no encontrado." });
        }
        const saldoAhorros = parseFloat(socioRes.rows[0].saldo_ahorros_socio || 0);
        if (saldoAhorros < valor) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Saldo de ahorros insuficiente para realizar el pago." });
        }
        const ahRes = await client.query(
          `UPDATE socio SET saldo_ahorros_socio = saldo_ahorros_socio - $1 WHERE id_socio = $2 RETURNING saldo_ahorros_socio`,
          [valor, id_socio]
        );
        saldo_ahorros_socio = ahRes.rows[0]?.saldo_ahorros_socio ?? null;
        await client.query(`
          INSERT INTO movimiento_ahorro (
            id_socio_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento
          ) VALUES ($1, $2, 'retiro', $3, NOW())
        `, [id_socio, valor, `Débito presencial por pago de crédito (Cuota #${cuota.numero_cuota}) registrado por ${operador || 'cajero'}`]);
      }

      const valorCuota = parseFloat(cuota.valor_cuota);
      const abonoCapital = parseFloat(cuota.abono_capital_cuota || cuota.valor_cuota);
      const saldoPendiente = parseFloat(cuota.saldo_pendiente_credito || 0);
      const interesCorriente = parseFloat(cuota.interes_corriente_cuota || 0);
      const dueDate = cuota.fecha_vencimiento_cuota ? new Date(cuota.fecha_vencimiento_cuota) : null;
      let diasMora = 0;
      if (dueDate) {
        const diffMs = Date.now() - dueDate.getTime();
        if (diffMs > 0) diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }
      const tasaMora = parseFloat(cuota.tasa_moratoria_credito || 2.5);
      const interesMora = parseFloat((valorCuota * (tasaMora / 100) * (diasMora / 30)).toFixed(2));
      const baseCuotaConMora = valorCuota + interesMora;
      const maximoPermitido = saldoPendiente + interesCorriente + interesMora;

      if (valor > maximoPermitido + 0.05) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "El monto excede el valor total necesario para liquidar el crédito." });
      }

      let tipoPagoFinal = tipoPagoEfectivo;
      if (tipoPagoFinal === 'extra' && Math.abs(valor - maximoPermitido) <= 0.05) {
        tipoPagoFinal = 'total';
      }

      if (tipoPagoFinal === 'normal') {
        if (Math.abs(valor - baseCuotaConMora) > 0.05) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "El monto debe ser igual al valor de la cuota (incluyendo mora) para un pago normal." });
        }
        const nuevoSaldoPendiente = Math.max(0, saldoPendiente - abonoCapital);
        saldo_pendiente_credito = nuevoSaldoPendiente;
        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_cuota = $1`, [cuota.id_cuota]);
        await client.query(
          `UPDATE credito SET saldo_pendiente_credito = $1, estado_credito = $2 WHERE id_credito = $3`,
          [nuevoSaldoPendiente, nuevoSaldoPendiente <= 0.05 ? 'pagado' : 'activo', id_credito]
        );
      } else if (tipoPagoFinal === 'total') {
        if (valor < maximoPermitido - 0.05) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "El monto es insuficiente para realizar el pago total del crédito." });
        }
        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_credito_cuota = $1 AND estado_cuota = 'pendiente'`, [id_credito]);
        await client.query(`UPDATE credito SET saldo_pendiente_credito = 0, estado_credito = 'pagado' WHERE id_credito = $1`, [id_credito]);
        saldo_pendiente_credito = 0;
      } else if (tipoPagoFinal === 'extra') {
        if (valor <= baseCuotaConMora + 0.05) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Para 'otro valor' el monto debe ser mayor al valor de la cuota (incluyendo mora)." });
        }
        if (accion_extra !== 'cuota' && accion_extra !== 'plazo') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Debes seleccionar si deseas reducir 'cuota' o reducir 'plazo'." });
        }

        const excedente = valor - baseCuotaConMora;
        const abonoCapitalTotal = abonoCapital + excedente;
        let nuevoSaldoPendiente = Math.max(0, saldoPendiente - abonoCapitalTotal);
        saldo_pendiente_credito = nuevoSaldoPendiente;

        await client.query(`UPDATE cuota SET estado_cuota = 'pagada' WHERE id_cuota = $1`, [cuota.id_cuota]);
        await client.query(
          `UPDATE credito SET saldo_pendiente_credito = $1, estado_credito = $2 WHERE id_credito = $3`,
          [nuevoSaldoPendiente, nuevoSaldoPendiente <= 0.05 ? 'pagado' : 'activo', id_credito]
        );

        if (nuevoSaldoPendiente > 0.05) {
          await client.query(`DELETE FROM cuota WHERE id_credito_cuota = $1 AND estado_cuota = 'pendiente'`, [id_credito]);

          const cuotasRes = await client.query(
            `SELECT COUNT(*) as count FROM cuota WHERE id_credito_cuota = $1 AND estado_cuota = 'pagada'`,
            [id_credito]
          );
          const cuotasPagadas = parseInt(cuotasRes.rows[0].count);

          const plazoTotal = parseInt(cuota.plazo_meses_credito);
          let cuotasRestantes = plazoTotal - cuotasPagadas;
          if (cuotasRestantes < 1) cuotasRestantes = 1;

          const mvRate = parseFloat(cuota.tasa_interes_credito) / 100;
          let nuevoValorCuota = valorCuota;
          let nuevoPlazoMeses = cuotasRestantes;

          if (accion_extra === 'cuota') {
            nuevoValorCuota = (nuevoSaldoPendiente * mvRate) / (1 - Math.pow(1 + mvRate, -cuotasRestantes));
          } else {
            const logNumerator = 1 - ((mvRate * nuevoSaldoPendiente) / nuevoValorCuota);
            if (logNumerator <= 0) {
              nuevoPlazoMeses = 1;
            } else {
              nuevoPlazoMeses = Math.ceil(-Math.log(logNumerator) / Math.log(1 + mvRate));
            }
          }

          let saldoRestanteLoop = nuevoSaldoPendiente;
          const baseDate = new Date(cuota.fecha_vencimiento_cuota);

          for (let i = 1; i <= nuevoPlazoMeses; i++) {
            const interesCorrienteLoop = saldoRestanteLoop * mvRate;
            let abonoCapitalLoop = nuevoValorCuota - interesCorrienteLoop;

            if (abonoCapitalLoop >= saldoRestanteLoop || i === nuevoPlazoMeses) {
              abonoCapitalLoop = saldoRestanteLoop;
              nuevoValorCuota = abonoCapitalLoop + interesCorrienteLoop;
            }

            const saldoRestanteCuota = Math.max(0, saldoRestanteLoop - abonoCapitalLoop);
            const fechaVence = new Date(baseDate);
            fechaVence.setMonth(fechaVence.getMonth() + i);

            await client.query(
              `
                INSERT INTO cuota (
                  id_credito_cuota, numero_cuota, fecha_vencimiento_cuota,
                  valor_cuota, abono_capital_cuota, interes_corriente_cuota,
                  saldo_restante_cuota, estado_cuota
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
              `,
              [id_credito, cuotasPagadas + i, fechaVence, nuevoValorCuota, abonoCapitalLoop, interesCorrienteLoop, saldoRestanteCuota]
            );

            saldoRestanteLoop = saldoRestanteCuota;
            if (saldoRestanteLoop <= 0) break;
          }
        }
      } else {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "tipo_pago no soportado para recaudo presencial. Usa 'normal', 'total' o 'extra'." });
      }

      const pagoRes = await client.query(`
        INSERT INTO pago (
          id_socio_pago, monto_total_pago, canal_pago, uso_ahorros_pago,
          monto_ahorros_usado_pago, numero_recibo_pago, fecha_pago
        ) VALUES ($1, $2, 'presencial', $3, $4, $5, NOW())
        RETURNING id_pago
      `, [id_socio, valor, metodoEfectivo === 'ahorros', metodoEfectivo === 'ahorros' ? valor : 0, referencia]);
      const id_pago = pagoRes.rows[0].id_pago;

      await client.query(`
        INSERT INTO pago_detalle (
          id_pago_pagodetalle, id_cuota_pagodetalle, monto_aplicado_pagodetalle,
          dias_mora_pagodetalle, interes_mora_pagodetalle
        ) VALUES ($1, $2, $3, $4, $5)
      `, [id_pago, cuota.id_cuota, valor, diasMora, interesMora]);

      await client.query('COMMIT');
      return res.json({ success: true, referencia, id_pago, saldo_ahorros_socio, saldo_pendiente_credito });
    }

    await client.query('ROLLBACK');
    return res.status(400).json({ error: "Tipo de recaudo no válido." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error procesando recaudo:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
});

router.get('/pagos/:idPago/recibo', authenticateJWT, authorizeRoles('socio', 'cajero'), async (req, res) => {
  try {
    const { idPago } = req.params;
    const pagoRes = await db.query(`
      SELECT
        p.id_pago,
        p.numero_recibo_pago,
        p.fecha_pago,
        p.canal_pago,
        p.monto_total_pago,
        p.id_socio_pago,
        u.nombre_usuario,
        u.documento_usuario,
        s.id_cooperativa_socio,
        co.nombre_cooperativa,
        co.nit_cooperativa,
        cr.id_credito,
        cu.numero_cuota,
        pd.dias_mora_pagodetalle,
        pd.interes_mora_pagodetalle
      FROM pago p
      JOIN socio s ON p.id_socio_pago = s.id_socio
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      JOIN cooperativa co ON s.id_cooperativa_socio = co.id_cooperativa
      LEFT JOIN pago_detalle pd ON pd.id_pago_pagodetalle = p.id_pago
      LEFT JOIN cuota cu ON pd.id_cuota_pagodetalle = cu.id_cuota
      LEFT JOIN credito cr ON cu.id_credito_cuota = cr.id_credito
      WHERE p.id_pago = $1
      LIMIT 1
    `, [idPago]);
    if (pagoRes.rows.length === 0) {
      return res.status(404).json({ error: "Pago no encontrado." });
    }
    const row = pagoRes.rows[0];

    if (req.user.rol === 'socio') {
      if (String(row.id_socio_pago) !== String(req.user.id_socio)) {
        return res.status(403).json({ error: "No autorizado." });
      }
    } else if (req.user.rol === 'cajero') {
      if (String(row.id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
        return res.status(403).json({ error: "No autorizado." });
      }
    } else {
      return res.status(403).json({ error: "No autorizado." });
    }

    ReceiptService.streamPagoReciboPdf(res, {
      id_pago: row.id_pago,
      numero_recibo_pago: row.numero_recibo_pago,
      fecha_pago: row.fecha_pago ? new Date(row.fecha_pago).toLocaleString('es-CO') : '',
      canal_pago: row.canal_pago,
      monto_total_pago: row.monto_total_pago,
      mora: {
        dias_mora: row.dias_mora_pagodetalle,
        interes_mora: row.interes_mora_pagodetalle,
      },
      socio: {
        nombre: row.nombre_usuario,
        documento: row.documento_usuario,
      },
      cooperativa: {
        nombre_cooperativa: row.nombre_cooperativa,
        nit_cooperativa: row.nit_cooperativa,
      },
      credito: {
        id_credito: row.id_credito,
        numero_cuota: row.numero_cuota,
      },
    });
  } catch (err) {
    console.error("Error generando recibo de pago:", err);
    res.status(500).json({ error: "Error interno al generar el recibo." });
  }
});

router.get('/ahorros/movimientos/:idMovimiento/recibo', authenticateJWT, authorizeRoles('socio', 'cajero'), async (req, res) => {
  try {
    const { idMovimiento } = req.params;
    const movRes = await db.query(`
      SELECT
        m.id_movimiento,
        m.fecha_movimiento,
        m.tipo_movimiento,
        m.monto_movimiento,
        m.descripcion_movimiento,
        m.id_socio_movimiento AS id_socio,
        s.id_cooperativa_socio,
        u.nombre_usuario,
        u.documento_usuario,
        co.nombre_cooperativa,
        co.nit_cooperativa
      FROM movimiento_ahorro m
      JOIN socio s ON m.id_socio_movimiento = s.id_socio
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      JOIN cooperativa co ON s.id_cooperativa_socio = co.id_cooperativa
      WHERE m.id_movimiento = $1
      LIMIT 1
    `, [idMovimiento]);
    if (movRes.rows.length === 0) {
      return res.status(404).json({ error: "Movimiento no encontrado." });
    }
    const row = movRes.rows[0];

    if (req.user.rol === 'socio') {
      if (String(row.id_socio) !== String(req.user.id_socio)) {
        return res.status(403).json({ error: "No autorizado." });
      }
    } else if (req.user.rol === 'cajero') {
      if (String(row.id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
        return res.status(403).json({ error: "No autorizado." });
      }
    } else {
      return res.status(403).json({ error: "No autorizado." });
    }

    ReceiptService.streamMovimientoReciboPdf(res, {
      id_movimiento: row.id_movimiento,
      fecha_movimiento: row.fecha_movimiento ? new Date(row.fecha_movimiento).toLocaleString('es-CO') : '',
      tipo_movimiento: row.tipo_movimiento,
      monto_movimiento: row.monto_movimiento,
      descripcion_movimiento: row.descripcion_movimiento,
      socio: {
        nombre: row.nombre_usuario,
        documento: row.documento_usuario,
      },
      cooperativa: {
        nombre_cooperativa: row.nombre_cooperativa,
        nit_cooperativa: row.nit_cooperativa,
      },
    });
  } catch (err) {
    console.error("Error generando recibo de movimiento:", err);
    res.status(500).json({ error: "Error interno al generar el recibo." });
  }
});

function buildCertificateCoop(row) {
  return { nombre: row.nombre_cooperativa, nit: row.nit_cooperativa };
}

function buildCertificateSocio(row) {
  return { id_socio: row.id_socio, nombre: row.nombre_usuario, documento: row.documento_usuario };
}

function toEsCoDateTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('es-CO');
  } catch (_) {
    return '';
  }
}

async function loadSocioCertContext({ socioId }) {
  const socioRes = await db.query(
    `
      SELECT
        s.id_socio,
        s.id_cooperativa_socio,
        s.saldo_ahorros_socio,
        u.nombre_usuario,
        u.documento_usuario,
        co.nombre_cooperativa,
        co.nit_cooperativa
      FROM socio s
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      JOIN cooperativa co ON s.id_cooperativa_socio = co.id_cooperativa
      WHERE s.id_socio = $1
      LIMIT 1
    `,
    [socioId]
  );
  if (socioRes.rows.length === 0) return null;

  const row = socioRes.rows[0];

  const creditosRes = await db.query(
    `
      SELECT
        cr.id_credito,
        cr.estado_credito,
        cr.saldo_pendiente_credito,
        cr.tasa_moratoria_credito,
        cu.id_cuota AS next_id_cuota,
        cu.numero_cuota AS next_numero_cuota,
        cu.valor_cuota AS next_valor_cuota,
        cu.interes_corriente_cuota AS next_interes_corriente_cuota,
        cu.fecha_vencimiento_cuota AS next_fecha_vencimiento_cuota
      FROM credito cr
      LEFT JOIN LATERAL (
        SELECT id_cuota, numero_cuota, valor_cuota, interes_corriente_cuota, fecha_vencimiento_cuota
        FROM cuota
        WHERE id_credito_cuota = cr.id_credito AND estado_cuota = 'pendiente'
        ORDER BY numero_cuota
        LIMIT 1
      ) cu ON true
      WHERE cr.id_socio_credito = $1 AND cr.estado_credito = 'activo'
      ORDER BY cr.id_credito
    `,
    [socioId]
  );

  const deudaRes = await db.query(
    `
      SELECT COUNT(*)::int AS pendientes,
             COUNT(*) FILTER (WHERE fecha_vencimiento_cuota < NOW())::int AS vencidas
      FROM cuota
      WHERE id_credito_cuota IN (SELECT id_credito FROM credito WHERE id_socio_credito = $1 AND estado_credito = 'activo')
        AND estado_cuota = 'pendiente'
    `,
    [socioId]
  );

  return {
    row,
    creditos: creditosRes.rows || [],
    cuotasPendientes: deudaRes.rows[0]?.pendientes ?? 0,
    cuotasVencidas: deudaRes.rows[0]?.vencidas ?? 0,
  };
}

function assertCertAccess(req, socioRow) {
  if (req.user.rol === 'socio') {
    if (String(req.user.id_socio) !== String(socioRow.id_socio)) return false;
    return true;
  }
  if (req.user.rol === 'cajero') {
    if (String(req.user.id_cooperativa) !== String(socioRow.id_cooperativa_socio)) return false;
    return true;
  }
  return false;
}

function isPazYSalvo(ctx) {
  const creditosActivos = (ctx.creditos || []).filter(c => Number(c.saldo_pendiente_credito || 0) > 0.05);
  if (creditosActivos.length > 0) return false;
  if (Number(ctx.cuotasPendientes || 0) > 0) return false;
  if (Number(ctx.cuotasVencidas || 0) > 0) return false;
  return true;
}

router.get('/socio/certificados/pazysalvo', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const ctx = await loadSocioCertContext({ socioId: req.user.id_socio });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });
    if (!isPazYSalvo(ctx)) return res.status(400).json({ error: 'El socio no se encuentra a paz y salvo.' });

    CertificateService.streamPazYSalvoPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
    });
  } catch (err) {
    console.error('Error generando paz y salvo:', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/socio/certificados/afiliacion', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const ctx = await loadSocioCertContext({ socioId: req.user.id_socio });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamAfiliacionPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
    });
  } catch (err) {
    console.error('Error generando certificado afiliación:', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/socio/certificados/ahorros', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const ctx = await loadSocioCertContext({ socioId: req.user.id_socio });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamAhorrosPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
      ahorros: { saldo: ctx.row.saldo_ahorros_socio, fecha_corte: toEsCoDateTime(new Date()) },
    });
  } catch (err) {
    console.error('Error generando certificado ahorros:', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/socio/certificados/estado-cuenta', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const ctx = await loadSocioCertContext({ socioId: req.user.id_socio });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamEstadoCuentaPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
      creditos: ctx.creditos,
    });
  } catch (err) {
    console.error('Error generando estado de cuenta:', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/cajero/socios/:socioId/certificados/pazysalvo', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  try {
    const { socioId } = req.params;
    const ctx = await loadSocioCertContext({ socioId });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });
    if (!isPazYSalvo(ctx)) return res.status(400).json({ error: 'El socio no se encuentra a paz y salvo.' });

    CertificateService.streamPazYSalvoPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
    });
  } catch (err) {
    console.error('Error generando paz y salvo (cajero):', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/cajero/socios/:socioId/certificados/afiliacion', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  try {
    const { socioId } = req.params;
    const ctx = await loadSocioCertContext({ socioId });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamAfiliacionPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
    });
  } catch (err) {
    console.error('Error generando afiliación (cajero):', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/cajero/socios/:socioId/certificados/ahorros', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  try {
    const { socioId } = req.params;
    const ctx = await loadSocioCertContext({ socioId });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamAhorrosPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
      ahorros: { saldo: ctx.row.saldo_ahorros_socio, fecha_corte: toEsCoDateTime(new Date()) },
    });
  } catch (err) {
    console.error('Error generando ahorros (cajero):', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

router.get('/cajero/socios/:socioId/certificados/estado-cuenta', authenticateJWT, authorizeRoles('cajero'), async (req, res) => {
  try {
    const { socioId } = req.params;
    const ctx = await loadSocioCertContext({ socioId });
    if (!ctx) return res.status(404).json({ error: 'Socio no encontrado.' });
    if (!assertCertAccess(req, ctx.row)) return res.status(403).json({ error: 'No autorizado.' });

    CertificateService.streamEstadoCuentaPdf(res, {
      fecha_expedicion: toEsCoDateTime(new Date()),
      cooperativa: buildCertificateCoop(ctx.row),
      socio: buildCertificateSocio(ctx.row),
      creditos: ctx.creditos,
    });
  } catch (err) {
    console.error('Error generando estado de cuenta (cajero):', err);
    res.status(500).json({ error: 'Error interno al generar el certificado.' });
  }
});

// ==========================================
// MÓDULOS DE SOLICITUDES Y ASPIRANTES (LIVE DB)
// ==========================================

// GET /api/cooperativas/buscar
router.get('/cooperativas/buscar', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const { rows } = await db.query(`
      SELECT id_cooperativa, nombre_cooperativa 
      FROM cooperativa 
      WHERE nombre_cooperativa ILIKE $1 AND estado_cooperativa = 'activa'
      LIMIT 10
    `, [`%${query}%`]);

    res.json(rows);
  } catch (err) {
    console.error("Error buscando cooperativas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/aspirantes/registrar
router.post('/aspirantes/registrar', async (req, res) => {
  const client = await db.connect(); // Obtener cliente de pool para transacción
  try {
    await client.query('BEGIN');
    const { id_cooperativa, nombre, documento, correo, telefono, direccion, ocupacion, ingresos } = req.body;

    if (!id_cooperativa || !nombre || !documento || !correo) {
      return res.status(400).json({ error: "Los campos cooperativa, nombre, documento y correo son obligatorios." });
    }

    // 1. Obtener analistas activos de la cooperativa
    const analistasRes = await client.query(`
      SELECT id_usuario 
      FROM usuario 
      WHERE id_cooperativa_usuario = $1 AND rol_usuario = 'analista' AND estado_usuario = 'activo'
      ORDER BY id_usuario
    `, [id_cooperativa]);

    const analistas = analistasRes.rows;

    // 2. Validar que la cooperativa tenga al menos un analista operativo
    if (analistas.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: "La cooperativa seleccionada aún no se encuentra operativa para recibir solicitudes de asociación. Por favor, intente más tarde o comuníquese directamente con la cooperativa." 
      });
    }

    // 3. Contar solicitudes previas en esta cooperativa
    const countRes = await client.query(`
      SELECT COUNT(*) FROM aspirante WHERE id_cooperativa_aspirante = $1
    `, [id_cooperativa]);

    const countVal = parseInt(countRes.rows[0].count);

    // 4. Round-Robin: Calcular analista asignado
    let analistaId = null;
    if (analistas.length > 0) {
      const idx = countVal % analistas.length;
      analistaId = analistas[idx].id_usuario;
    }

    // 5. Registrar el aspirante
    const insertQuery = `
      INSERT INTO aspirante (
        id_cooperativa_aspirante, nombre_aspirante, documento_aspirante, 
        correo_aspirante, telefono_aspirante, direccion_aspirante, 
        ocupacion_aspirante, ingresos_aspirante, estado_aspirante, 
        id_analista_aspirante, fecha_solicitud_aspirante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente', $9, NOW())
      RETURNING id_aspirante
    `;

    const insertValues = [
      id_cooperativa, nombre.trim(), documento.trim(), 
      correo.trim().toLowerCase(), telefono ? telefono.trim() : null, 
      direccion ? direccion.trim() : null, ocupacion ? ocupacion.trim() : null, 
      ingresos || 0, analistaId
    ];

    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');

    res.json({ success: true, id: result.rows[0].id_aspirante });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error registrando aspirante:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
  } finally {
    client.release();
  }
});

// GET /api/analista/aspirantes/:analistaId
router.get('/analista/aspirantes/:analistaId', authenticateJWT, authorizeRoles('analista'), requireSameUserParam('analistaId'), async (req, res) => {
  try {
    const { analistaId } = req.params;
    const { rows } = await db.query(`
      SELECT * FROM aspirante 
      WHERE id_analista_aspirante = $1 AND estado_aspirante = 'pendiente'
      ORDER BY fecha_solicitud_aspirante DESC
    `, [analistaId]);
    res.json(rows);
  } catch (err) {
    console.error("Error listando aspirantes asignados:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/analista/aspirantes/:id/resolver
router.post('/analista/aspirantes/:id/resolver', authenticateJWT, authorizeRoles('analista'), async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { decision, motivo_rechazo } = req.body;

     if (decision === 'rechazar') {
      // 1. Obtener datos del aspirante antes de rechazar
      const aspRes = await client.query(`
        SELECT * FROM aspirante WHERE id_aspirante = $1
      `, [id]);

      if (aspRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Solicitante no encontrado." });
      }

      const asp = aspRes.rows[0];
      if (String(asp.id_analista_aspirante) !== String(req.user.id_usuario)) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: "No autorizado." });
      }

      // 2. Obtener el nombre de la cooperativa
      const coopRes = await client.query(`
        SELECT nombre_cooperativa FROM cooperativa WHERE id_cooperativa = $1
      `, [asp.id_cooperativa_aspirante]);
      const coopName = coopRes.rows.length > 0 ? coopRes.rows[0].nombre_cooperativa : 'Tu Cooperativa';

      // 3. Actualizar estado
      const motivo = motivo_rechazo || 'No cumple con los requisitos mínimos de admisión.';
      await client.query(`
        UPDATE aspirante 
        SET estado_aspirante = 'rechazado', motivo_rechazo_aspirante = $1, fecha_revision_aspirante = NOW()
        WHERE id_aspirante = $2
      `, [motivo, id]);

      await client.query('COMMIT');

      // 4. Enviar notificación por correo de rechazo
      try {
        const EmailService = require('../services/email.service');
        await EmailService.enviarRechazoAspirante({
          correo: asp.correo_aspirante,
          nombre: asp.nombre_aspirante,
          motivoRechazo: motivo,
          nombreCooperativa: coopName
        });
      } catch (mailErr) {
        console.error("Error al despachar el correo de rechazo:", mailErr);
      }

      return res.json({ success: true, message: "Solicitud rechazada con éxito." });
    }

    if (decision === 'aprobar') {
      // 1. Obtener datos del aspirante
      const aspRes = await client.query(`
        SELECT * FROM aspirante WHERE id_aspirante = $1
      `, [id]);

      if (aspRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Solicitante no encontrado." });
      }

      const asp = aspRes.rows[0];
      if (String(asp.id_analista_aspirante) !== String(req.user.id_usuario)) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: "No autorizado." });
      }

      // 2. Comprobar si ya existe un usuario con el mismo correo o documento
      const duplRes = await client.query(`
        SELECT id_usuario FROM usuario WHERE correo_usuario = $1 OR documento_usuario = $2
      `, [asp.correo_aspirante, asp.documento_aspirante]);

      if (duplRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: "Ya existe un usuario registrado con el mismo correo o documento en el sistema." });
      }

      // 3. Generar hash para contraseña inicial '123456'
      const salt = await client.query("SELECT 1"); // Dummy
      const saltB = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash('123456', saltB);

      // 4. Crear Usuario en tabla usuario
      const userInsert = await client.query(`
        INSERT INTO usuario (
          id_cooperativa_usuario, nombre_usuario, documento_usuario, 
          correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, telefono_usuario
        ) VALUES ($1, $2, $3, $4, $5, 'socio', 'activo', $6)
        RETURNING id_usuario
      `, [
        asp.id_cooperativa_aspirante, asp.nombre_aspirante, asp.documento_aspirante,
        asp.correo_aspirante, hash, asp.telefono_aspirante
      ]);

      const userId = userInsert.rows[0].id_usuario;

      // 5. Crear Socio en tabla socio
      await client.query(`
        INSERT INTO socio (
          id_usuario_socio, id_cooperativa_socio, saldo_ahorros_socio, 
          estado_socio, empresa_socio, cargo_socio, tipo_contrato_socio, 
          antiguedad_meses_socio, ingresos_mensuales_socio, egresos_mensuales_socio, 
          otros_ingresos_socio, patrimonio_socio
        ) VALUES ($1, $2, 0.0, 'activo', 'Independiente', $3, 'indefinido', 1, $4, 0.0, 0.0, 0.0)
      `, [userId, asp.id_cooperativa_aspirante, asp.ocupacion_aspirante || 'Independiente', asp.ingresos_aspirante || 0]);

      // 6. Actualizar estado del aspirante
      await client.query(`
        UPDATE aspirante 
        SET estado_aspirante = 'aprobado', fecha_revision_aspirante = NOW()
        WHERE id_aspirante = $1
      `, [id]);

      // 6b. Obtener el nombre de la cooperativa para el correo
      const coopRes = await client.query(`
        SELECT nombre_cooperativa FROM cooperativa WHERE id_cooperativa = $1
      `, [asp.id_cooperativa_aspirante]);
      const coopName = coopRes.rows.length > 0 ? coopRes.rows[0].nombre_cooperativa : 'Tu Cooperativa';

      await client.query('COMMIT');

      // 7. Enviar notificación de bienvenida por correo electrónico
      try {
        const EmailService = require('../services/email.service');
        await EmailService.enviarBienvenidaSocio({
          correo: asp.correo_aspirante,
          nombre: asp.nombre_aspirante,
          contrasenaTemp: '123456',
          nombreCooperativa: coopName
        });
      } catch (mailErr) {
        console.error("Error al despachar el correo de bienvenida:", mailErr);
      }

      return res.json({ success: true, message: "Aspirante aprobado y dado de alta como socio con éxito." });
    }

    await client.query('ROLLBACK');
    res.status(400).json({ error: "Decisión no válida." });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error resolviendo solicitud de aspirante:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la resolución." });
  } finally {
    client.release();
  }
});

// ==========================================
// MÓDULO ESTUDIO DE SOLICITUDES DE CRÉDITO (ANALISTA)
// ==========================================

// GET /api/analista/solicitudes
router.get('/analista/solicitudes', authenticateJWT, authorizeRoles('analista'), async (req, res) => {
  try {
    const { cooperativaId } = req.query;
    if (!cooperativaId) {
      return res.status(400).json({ error: "Falta cooperativaId" });
    }
    if (String(cooperativaId) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { rows } = await db.query(`
      SELECT 
          sc.id_solicitud,
          sc.fecha_solicitud,
          sc.monto_solicitado_solicitud AS monto,
          sc.plazo_meses_solicitud AS plazo,
          sc.proposito_solicitud AS proposito,
          u.nombre_usuario AS asociado_nombre,
          u.documento_usuario AS asociado_documento,
          lc.nombre_linea AS linea_nombre,
          s.id_socio,
          s.ingresos_mensuales_socio AS ingresos,
          s.egresos_mensuales_socio AS egresos,
          s.otros_ingresos_socio AS otros_ingresos,
          s.saldo_ahorros_socio AS saldo_ahorros,
          s.antiguedad_meses_socio AS antiguedad,
          s.tipo_contrato_socio AS tipo_contrato,
          s.fecha_ingreso_socio
      FROM solicitud_credito sc
      JOIN socio s ON sc.id_socio_solicitud = s.id_socio
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      JOIN linea_credito lc ON sc.id_linea_solicitud = lc.id_linea_credito
      WHERE sc.estado_solicitud = 'pendiente' AND s.id_cooperativa_socio = $1
      ORDER BY sc.id_solicitud DESC
    `, [cooperativaId]);

    // Para cada solicitud, obtener datos financieros extra
    const formatted = [];
    for (const r of rows) {
      const monto = parseFloat(r.monto);
      const saldoAhorros = parseFloat(r.saldo_ahorros || 0);
      const porcentajeAhorro = monto > 0 ? ((saldoAhorros / monto) * 100).toFixed(0) : 0;
      const cumple15 = saldoAhorros >= monto * 0.15;

      // Créditos activos y mora
      const creditosRes = await db.query(`
        SELECT id_credito, estado_credito FROM credito WHERE id_socio_credito = $1
      `, [r.id_socio]);
      const creditosActivos = creditosRes.rows.filter(c => c.estado_credito === 'activo').length;

      // Días de mora máxima
      let diasMora = 0;
      let cuotasAtrasadas = 0;
      if (creditosActivos > 0) {
        const moraRes = await db.query(`
          SELECT fecha_vencimiento_cuota FROM cuota 
          WHERE id_credito_cuota IN (SELECT id_credito FROM credito WHERE id_socio_credito = $1 AND estado_credito = 'activo')
            AND estado_cuota = 'pendiente' AND fecha_vencimiento_cuota < NOW()
        `, [r.id_socio]);
        cuotasAtrasadas = moraRes.rows.length;
        if (cuotasAtrasadas > 0) {
          const oldest = new Date(Math.min(...moraRes.rows.map(c => new Date(c.fecha_vencimiento_cuota))));
          diasMora = Math.ceil((new Date() - oldest) / (1000 * 60 * 60 * 24));
        }
      }

      // Historial de pagos (cuotas pagadas vs totales)
      const histRes = await db.query(`
        SELECT estado_cuota FROM cuota 
        WHERE id_credito_cuota IN (SELECT id_credito FROM credito WHERE id_socio_credito = $1)
      `, [r.id_socio]);
      const totalCuotas = histRes.rows.length;
      const cuotasPagadas = histRes.rows.filter(c => c.estado_cuota === 'pagada').length;
      
      let historialLabel = 'Sin historial';
      let historialColor = '#94a3b8';
      if (totalCuotas > 0) {
        if (cuotasAtrasadas === 0 && cuotasPagadas > 0) {
          historialLabel = 'Excelente (0 atrasos)';
          historialColor = '#10B981';
        } else if (cuotasAtrasadas <= 1) {
          historialLabel = 'Bueno (' + cuotasAtrasadas + ' atraso)';
          historialColor = '#3B82F6';
        } else {
          historialLabel = 'Riesgo (' + cuotasAtrasadas + ' atrasos)';
          historialColor = '#EF4444';
        }
      }

      // Antigüedad en meses
      let mesesSocio = parseInt(r.antiguedad || 0);
      if (r.fecha_ingreso_socio) {
        const diff = new Date() - new Date(r.fecha_ingreso_socio);
        mesesSocio = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      }

      // Scoring
      const ingresosTotales = parseFloat(r.ingresos || 0) + parseFloat(r.otros_ingresos || 0);
      const egresos = parseFloat(r.egresos || 0) || 1;
      const relacionIE = (ingresosTotales / egresos).toFixed(2);
      
      let score = 0;
      if (r.tipo_contrato === 'indefinido') score += 30;
      else if (r.tipo_contrato === 'termino_fijo' || r.tipo_contrato === 'fijo') score += 20;
      else score += 10;
      
      if (mesesSocio >= 24) score += 20;
      else if (mesesSocio >= 12) score += 15;
      else if (mesesSocio >= 6) score += 10;
      else score += 5;
      
      const relVal = parseFloat(relacionIE);
      if (relVal >= 2.5) score += 30;
      else if (relVal >= 1.8) score += 20;
      else if (relVal >= 1.0) score += 10;
      
      if (saldoAhorros >= 2000000) score += 20;
      else if (saldoAhorros >= 500000) score += 10;
      else score += 5;

      let scoringLabel = "C (Riesgo)";
      let scoringColor = "#EF4444";
      if (score >= 85) { scoringLabel = "A+ (Excelente)"; scoringColor = "#10B981"; }
      else if (score >= 70) { scoringLabel = "A (Bueno)"; scoringColor = "#3B82F6"; }
      else if (score >= 50) { scoringLabel = "B- (Aceptable)"; scoringColor = "#F59E0B"; }

      formatted.push({
        id_solicitud: r.id_solicitud,
        fecha_solicitud: r.fecha_solicitud,
        asociado: r.asociado_nombre,
        documento: r.asociado_documento,
        id_socio: r.id_socio,
        linea: r.linea_nombre,
        monto,
        plazo: r.plazo,
        proposito: r.proposito,
        saldo_ahorros: saldoAhorros,
        porcentaje_ahorro: parseInt(porcentajeAhorro),
        cumple_15: cumple15,
        creditos_activos: creditosActivos,
        dias_mora: diasMora,
        meses_socio: mesesSocio,
        historial_label: historialLabel,
        historial_color: historialColor,
        scoring: scoringLabel,
        scoring_color: scoringColor,
        score_numerico: score
      });
    }

    res.json(formatted);
  } catch (err) {
    console.error("Error obteniendo solicitudes de analista:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/analista/solicitudes
router.post('/analista/solicitudes', authenticateJWT, authorizeRoles('analista'), async (req, res) => {
  try {
    const { documento, id_linea, monto, plazo, proposito } = req.body;

    if (!documento || !id_linea || !monto || !plazo || !proposito) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // 1. Buscar el socio por documento
    const socioRes = await db.query(`
      SELECT s.id_socio 
      FROM socio s
      JOIN usuario u ON s.id_usuario_socio = u.id_usuario
      WHERE u.documento_usuario = $1 AND s.id_cooperativa_socio = $2
      LIMIT 1
    `, [documento.toString().trim(), req.user.id_cooperativa]);

    if (socioRes.rows.length === 0) {
      return res.status(404).json({ error: "No existe un socio registrado con el número de documento ingresado." });
    }
    const id_socio = socioRes.rows[0].id_socio;

    // 2. Buscar configuración de la línea de crédito
    const configRes = await db.query(`
      SELECT id_config 
      FROM config_linea 
      WHERE id_linea_config = $1
      ORDER BY fecha_actualizacion_config DESC
      LIMIT 1
    `, [id_linea]);

    if (configRes.rows.length === 0) {
      return res.status(400).json({ error: "No hay una configuración financiera activa para la línea de crédito seleccionada." });
    }
    const id_config = configRes.rows[0].id_config;

    // 3. Insertar la solicitud de crédito en estado pendiente
    const insertRes = await db.query(`
      INSERT INTO solicitud_credito (
        id_socio_solicitud, id_linea_solicitud, id_config_solicitud,
        monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud,
        estado_solicitud, fecha_solicitud
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', NOW())
      RETURNING id_solicitud
    `, [id_socio, id_linea, id_config, monto, plazo, proposito]);

    res.json({ success: true, id: insertRes.rows[0].id_solicitud });
  } catch (err) {
    console.error("Error radicando solicitud de analista:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
  }
});

// POST /api/analista/solicitudes/:id/resolver
router.post('/analista/solicitudes/:id/resolver', authenticateJWT, authorizeRoles('analista'), async (req, res) => {
  const client = await db.connect();
  try {
    const { id } = req.params;
    const { decision, motivo_rechazo } = req.body;

    if (decision !== 'aprobar' && decision !== 'rechazar') {
      return res.status(400).json({ error: "Decisión no válida." });
    }

    if (decision === 'rechazar' && (!motivo_rechazo || !motivo_rechazo.trim())) {
      return res.status(400).json({ error: "Debes especificar un motivo de rechazo." });
    }

    await client.query('BEGIN');

    // 1. Obtener datos de la solicitud
    const solRes = await client.query(`
      SELECT sc.*, s.id_socio, s.id_cooperativa_socio
      FROM solicitud_credito sc
      JOIN socio s ON sc.id_socio_solicitud = s.id_socio
      WHERE sc.id_solicitud = $1
    `, [id]);

    if (solRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }
    const solicitud = solRes.rows[0];
    if (String(solicitud.id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: "No autorizado." });
    }

    // Si es rechazar
    if (decision === 'rechazar') {
      await client.query(`
        UPDATE solicitud_credito 
        SET estado_solicitud = 'rechazada', fecha_resolucion_solicitud = NOW()
        WHERE id_solicitud = $1
      `, [id]);

      // Notificación al socio con motivo
      await client.query(`
        INSERT INTO notificacion (
          id_socio_notificacion, tipo_notificacion, asunto_notificacion,
          mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
        ) VALUES ($1, 'credito', 'Solicitud de Crédito Rechazada', $2, false, NOW())
      `, [solicitud.id_socio, `Tu solicitud de crédito por $${parseFloat(solicitud.monto_solicitado_solicitud).toLocaleString('es-CO')} ha sido rechazada. Motivo: ${motivo_rechazo.trim()}`]);

      await client.query('COMMIT');
      return res.json({ success: true, message: "Solicitud de crédito rechazada. Se notificó al socio." });
    }

    // Si es aprobar
    // 2. Obtener configuración de interés
    const configRes = await client.query(`
      SELECT tasa_interes_config, tasa_moratoria_config 
      FROM config_linea 
      WHERE id_config = $1
    `, [solicitud.id_config_solicitud]);

    const tasaInteres = configRes.rows.length > 0 ? parseFloat(configRes.rows[0].tasa_interes_config) : 1.8;
    const tasaMoratoria = configRes.rows.length > 0 ? parseFloat(configRes.rows[0].tasa_moratoria_config) : 2.5;

    // 3. Actualizar estado de la solicitud
    await client.query(`
      UPDATE solicitud_credito 
      SET estado_solicitud = 'aprobada', fecha_resolucion_solicitud = NOW()
      WHERE id_solicitud = $1
    `, [id]);

    const monto = parseFloat(solicitud.monto_solicitado_solicitud);
    const plazo = parseInt(solicitud.plazo_meses_solicitud);

    // 4. Crear el crédito activo
    const credInsert = await client.query(`
      INSERT INTO credito (
        id_socio_credito, id_solicitud_credito, id_linea_credito,
        monto_aprobado_credito, tasa_interes_credito, tasa_moratoria_credito,
        plazo_meses_credito, saldo_pendiente_credito, estado_credito,
        fecha_desembolso_credito, fecha_creacion_credito
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo', NOW(), NOW())
      RETURNING id_credito
    `, [
      solicitud.id_socio, solicitud.id_solicitud, solicitud.id_linea_solicitud,
      monto, tasaInteres, tasaMoratoria, plazo, monto
    ]);

    const id_credito = credInsert.rows[0].id_credito;

    // 5. Generar plan de pagos (amortización sistema francés)
    const mvRate = tasaInteres / 100;
    const valorCuota = (monto * mvRate) / (1 - Math.pow(1 + mvRate, -plazo));

    let saldoRestante = monto;

    for (let i = 1; i <= plazo; i++) {
      const interesCorriente = saldoRestante * mvRate;
      const abonoCapital = valorCuota - interesCorriente;
      const nuevoSaldo = Math.max(0, saldoRestante - abonoCapital);
      
      const vencimiento = new Date();
      vencimiento.setMonth(vencimiento.getMonth() + i);

      await client.query(`
        INSERT INTO cuota (
          id_credito_cuota, numero_cuota, fecha_vencimiento_cuota,
          valor_cuota, abono_capital_cuota, interes_corriente_cuota,
          saldo_restante_cuota, estado_cuota
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
      `, [
        id_credito, i, vencimiento, valorCuota, abonoCapital, interesCorriente, nuevoSaldo
      ]);

      saldoRestante = nuevoSaldo;
    }

    // 6. Notificación al socio
    await client.query(`
      INSERT INTO notificacion (
        id_socio_notificacion, tipo_notificacion, asunto_notificacion,
        mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion
      ) VALUES ($1, 'credito', 'Crédito Aprobado y Desembolsado', $2, false, NOW())
    `, [solicitud.id_socio, `¡Felicidades! Tu crédito por $${monto.toLocaleString('es-CO')} a ${plazo} meses ha sido aprobado y desembolsado exitosamente.`]);

    await client.query('COMMIT');
    res.json({ success: true, message: "Solicitud aprobada, crédito desembolsado y socio notificado." });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error aprobando solicitud de crédito:", err);
    res.status(500).json({ error: "Error interno del servidor al procesar la resolución." });
  } finally {
    client.release();
  }
});

// GET /api/analista/socio/:socioId/historial
// Retorna ahorros + pagos de crédito del socio — accesible solo por analistas de la misma cooperativa
router.get('/analista/socio/:socioId/historial', authenticateJWT, authorizeRoles('analista'), async (req, res) => {
  try {
    const { socioId } = req.params;

    // Verificar que el socio pertenece a la misma cooperativa del analista
    const scopeRes = await db.query(`
      SELECT id_cooperativa_socio FROM socio WHERE id_socio = $1
    `, [socioId]);

    if (scopeRes.rows.length === 0) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }
    if (String(scopeRes.rows[0].id_cooperativa_socio) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: "No autorizado. El socio no pertenece a tu cooperativa." });
    }

    // Ahorros + pagos de crédito unificados, ordenados por fecha DESC
    const { rows } = await db.query(`
      SELECT
        fecha_movimiento AS fecha,
        tipo_movimiento::TEXT AS tipo,
        monto_movimiento AS monto,
        descripcion_movimiento AS descripcion
      FROM movimiento_ahorro
      WHERE id_socio_movimiento = $1

      UNION ALL

      SELECT
        p.fecha_pago AS fecha,
        'pago_credito' AS tipo,
        p.monto_total_pago AS monto,
        'Pago de crédito — Recibo #' || p.numero_recibo_pago || ' (' || p.canal_pago || ')' AS descripcion
      FROM pago p
      WHERE p.id_socio_pago = $1

      ORDER BY fecha DESC
    `, [socioId]);

    res.json(rows);
  } catch (err) {
    console.error("Error al cargar historial del socio (analista):", err);
    res.status(500).json({ error: "Error interno del servidor al cargar el historial." });
  }
});

router.get('/gestor/lineas', authenticateJWT, authorizeRoles('gestor_financiero'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        l.id_linea_credito AS id,
        l.nombre_linea AS nombre,
        c.tasa_interes_config AS tasa,
        c.tasa_moratoria_config AS mora,
        c.monto_min_config AS "minMonto",
        c.monto_max_config AS "maxMonto",
        c.plazo_min_config AS "minPlazo",
        c.plazo_max_config AS "maxPlazo"
      FROM linea_credito l
      LEFT JOIN LATERAL (
        SELECT *
        FROM config_linea
        WHERE id_linea_config = l.id_linea_credito
        ORDER BY fecha_actualizacion_config DESC
        LIMIT 1
      ) c ON true
      WHERE l.id_cooperativa_linea = $1
      ORDER BY l.nombre_linea ASC
    `, [req.user.id_cooperativa]);

    res.json(rows || []);
  } catch (err) {
    console.error('Error obteniendo líneas (gestor):', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/gestor/lineas', authenticateJWT, authorizeRoles('gestor_financiero'), async (req, res) => {
  try {
    const { id, tasa, mora, minM, maxM, minP, maxP } = req.body || {};
    if (!id || tasa === undefined || mora === undefined || minM === undefined || maxM === undefined || minP === undefined || maxP === undefined) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const idLinea = parseInt(id);
    const tasaInteres = parseFloat(tasa);
    const tasaMoratoria = parseFloat(mora);
    const montoMin = parseFloat(minM);
    const montoMax = parseFloat(maxM);
    const plazoMin = parseInt(minP);
    const plazoMax = parseInt(maxP);

    if (!Number.isFinite(idLinea) || !Number.isFinite(tasaInteres) || !Number.isFinite(tasaMoratoria) || !Number.isFinite(montoMin) || !Number.isFinite(montoMax) || !Number.isFinite(plazoMin) || !Number.isFinite(plazoMax)) {
      return res.status(400).json({ error: 'Valores inválidos.' });
    }

    if (montoMin <= 0 || montoMax <= 0 || montoMin >= montoMax) {
      return res.status(400).json({ error: 'Rango de montos inválido.' });
    }
    if (plazoMin <= 0 || plazoMax <= 0 || plazoMin >= plazoMax) {
      return res.status(400).json({ error: 'Rango de plazos inválido.' });
    }
    if (tasaInteres <= 0 || tasaMoratoria <= 0) {
      return res.status(400).json({ error: 'Tasas inválidas.' });
    }

    const lineaRes = await db.query(`
      SELECT id_linea_credito
      FROM linea_credito
      WHERE id_linea_credito = $1 AND id_cooperativa_linea = $2
      LIMIT 1
    `, [idLinea, req.user.id_cooperativa]);

    if (lineaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Línea no encontrada.' });
    }

    await db.query(`
      INSERT INTO config_linea (
        id_linea_config, id_gestor_config, tasa_interes_config, tasa_moratoria_config,
        plazo_min_config, plazo_max_config, monto_min_config, monto_max_config,
        fecha_actualizacion_config
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [idLinea, req.user.id, tasaInteres, tasaMoratoria, plazoMin, plazoMax, montoMin, montoMax]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error guardando líneas (gestor):', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/socio/lineas', authenticateJWT, authorizeRoles('socio'), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        l.id_linea_credito AS id,
        l.nombre_linea AS nombre,
        c.tasa_interes_config AS tasa,
        c.tasa_moratoria_config AS mora,
        c.monto_min_config AS "minMonto",
        c.monto_max_config AS "maxMonto",
        c.plazo_min_config AS "minPlazo",
        c.plazo_max_config AS "maxPlazo"
      FROM linea_credito l
      LEFT JOIN LATERAL (
        SELECT *
        FROM config_linea
        WHERE id_linea_config = l.id_linea_credito
        ORDER BY fecha_actualizacion_config DESC
        LIMIT 1
      ) c ON true
      WHERE l.id_cooperativa_linea = $1
      ORDER BY l.nombre_linea ASC
    `, [req.user.id_cooperativa]);

    res.json(rows || []);
  } catch (err) {
    console.error('Error obteniendo líneas (socio):', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/gerente/dashboard', authenticateJWT, authorizeRoles('gerente'), async (req, res) => {
  try {
    const idCoop = req.user.id_cooperativa;

    const sociosRes = await db.query(`
      SELECT COUNT(*)::int AS total_socios
      FROM socio
      WHERE id_cooperativa_socio = $1 AND estado_socio::text = 'activo'
    `, [idCoop]);

    const ahorrosRes = await db.query(`
      SELECT COALESCE(SUM(saldo_ahorros_socio), 0)::numeric AS fondo_ahorros
      FROM socio
      WHERE id_cooperativa_socio = $1
    `, [idCoop]);

    const carteraBaseRes = await db.query(`
      SELECT
        cr.id_credito,
        cr.id_linea_credito,
        cr.saldo_pendiente_credito,
        COALESCE(m.dias_mora, 0)::int AS dias_mora,
        EXISTS (
          SELECT 1
          FROM castigo_cartera cc
          WHERE cc.id_credito_castigo = cr.id_credito AND cc.estado_castigo::text = 'aprobado'
        ) AS castigo_aprobado
      FROM credito cr
      JOIN socio s ON s.id_socio = cr.id_socio_credito
      LEFT JOIN LATERAL (
        SELECT MAX((CURRENT_DATE - fecha_vencimiento_cuota))::int AS dias_mora
        FROM cuota
        WHERE id_credito_cuota = cr.id_credito
          AND estado_cuota::text = 'pendiente'
          AND fecha_vencimiento_cuota < CURRENT_DATE
      ) m ON true
      WHERE s.id_cooperativa_socio = $1 AND cr.saldo_pendiente_credito > 0
    `, [idCoop]);

    const carteraRows = carteraBaseRes.rows || [];
    const carteraTotal = carteraRows.reduce((acc, r) => acc + parseFloat(r.saldo_pendiente_credito || 0), 0);

    let vigente = 0;
    let vencida = 0;
    let castigada = 0;

    for (const r of carteraRows) {
      const saldo = parseFloat(r.saldo_pendiente_credito || 0);
      const dias = parseInt(r.dias_mora || 0);
      const isCastigada = r.castigo_aprobado || dias >= 120;
      if (isCastigada) castigada += saldo;
      else if (dias > 0) vencida += saldo;
      else vigente += saldo;
    }

    const riesgoMora = carteraTotal > 0 ? ((vencida + castigada) / carteraTotal) * 100 : 0;

    const distribucionRes = await db.query(`
      SELECT
        lc.id_linea_credito AS id,
        lc.nombre_linea AS nombre,
        COALESCE(SUM(cr.saldo_pendiente_credito), 0)::numeric AS saldo
      FROM linea_credito lc
      LEFT JOIN credito cr ON cr.id_linea_credito = lc.id_linea_credito
      LEFT JOIN socio s ON s.id_socio = cr.id_socio_credito
      WHERE lc.id_cooperativa_linea = $1
        AND (s.id_cooperativa_socio = $1 OR s.id_cooperativa_socio IS NULL)
      GROUP BY lc.id_linea_credito, lc.nombre_linea
      ORDER BY saldo DESC
    `, [idCoop]);

    const creditosAprobadosRes = await db.query(`
      SELECT COALESCE(SUM(monto_aprobado_credito), 0)::numeric AS total_aprobado
      FROM credito cr
      JOIN socio s ON s.id_socio = cr.id_socio_credito
      WHERE s.id_cooperativa_socio = $1
    `, [idCoop]);

    const lineasRes = await db.query(`
      SELECT id_linea_credito AS id, nombre_linea AS nombre
      FROM linea_credito
      WHERE id_cooperativa_linea = $1
      ORDER BY nombre_linea ASC
    `, [idCoop]);

    res.json({
      socios: sociosRes.rows[0]?.total_socios || 0,
      aprobados_total: creditosAprobadosRes.rows[0]?.total_aprobado || 0,
      fondo_ahorros: ahorrosRes.rows[0]?.fondo_ahorros || 0,
      cartera_total: carteraTotal,
      cartera_vigente: vigente,
      cartera_vencida: vencida,
      cartera_castigada: castigada,
      riesgo_mora_pct: riesgoMora,
      distribucion_linea: distribucionRes.rows || [],
      lineas: lineasRes.rows || []
    });
  } catch (err) {
    console.error('Error gerente dashboard:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/gerente/cartera/resumen', authenticateJWT, authorizeRoles('gerente'), async (req, res) => {
  try {
    const idCoop = req.user.id_cooperativa;
    const { estado, id_linea, min_mora, max_mora, q } = req.query || {};

    const params = [idCoop];
    let pIdx = 2;
    let where = `WHERE s.id_cooperativa_socio = $1 AND cr.saldo_pendiente_credito > 0`;

    if (id_linea) {
      where += ` AND cr.id_linea_credito = $${pIdx++}`;
      params.push(parseInt(id_linea));
    }

    if (q && String(q).trim()) {
      where += ` AND (u.nombre_usuario ILIKE $${pIdx} OR u.documento_usuario ILIKE $${pIdx})`;
      params.push(`%${String(q).trim()}%`);
      pIdx++;
    }

    const { rows } = await db.query(`
      SELECT
        cr.id_credito,
        cr.id_linea_credito,
        lc.nombre_linea,
        u.nombre_usuario,
        u.documento_usuario,
        cr.monto_aprobado_credito,
        cr.saldo_pendiente_credito,
        cr.tasa_interes_credito,
        cr.tasa_moratoria_credito,
        COALESCE(m.dias_mora, 0)::int AS dias_mora,
        COALESCE(m.cuotas_vencidas, 0)::int AS cuotas_vencidas,
        COALESCE(m.valor_vencido, 0)::numeric AS valor_vencido,
        EXISTS (
          SELECT 1
          FROM castigo_cartera cc
          WHERE cc.id_credito_castigo = cr.id_credito AND cc.estado_castigo::text = 'aprobado'
        ) AS castigo_aprobado,
        nx.numero_cuota AS cuota_proxima_num,
        nx.fecha_vencimiento_cuota AS cuota_proxima_vence,
        nx.valor_cuota AS cuota_proxima_valor
      FROM credito cr
      JOIN socio s ON s.id_socio = cr.id_socio_credito
      JOIN usuario u ON u.id_usuario = s.id_usuario_socio
      JOIN linea_credito lc ON lc.id_linea_credito = cr.id_linea_credito
      LEFT JOIN LATERAL (
        SELECT
          MAX((CURRENT_DATE - fecha_vencimiento_cuota))::int AS dias_mora,
          COUNT(*)::int AS cuotas_vencidas,
          COALESCE(SUM(valor_cuota), 0)::numeric AS valor_vencido
        FROM cuota
        WHERE id_credito_cuota = cr.id_credito
          AND estado_cuota::text = 'pendiente'
          AND fecha_vencimiento_cuota < CURRENT_DATE
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT numero_cuota, fecha_vencimiento_cuota, valor_cuota
        FROM cuota
        WHERE id_credito_cuota = cr.id_credito
          AND estado_cuota::text = 'pendiente'
        ORDER BY numero_cuota ASC
        LIMIT 1
      ) nx ON true
      ${where}
      ORDER BY dias_mora DESC, cr.saldo_pendiente_credito DESC
    `, params);

    const rawItems = rows || [];
    const items = [];

    let carteraTotal = 0;
    let vigente = 0;
    let vencida = 0;
    let castigada = 0;

    for (const r of rawItems) {
      const saldo = parseFloat(r.saldo_pendiente_credito || 0);
      const dias = parseInt(r.dias_mora || 0);
      const isCastigada = r.castigo_aprobado || dias >= 120;
      const estadoCalc = isCastigada ? 'castigada' : (dias > 0 ? 'vencida' : 'vigente');

      const minM = min_mora !== undefined && min_mora !== null && String(min_mora).trim() !== '' ? parseInt(min_mora) : null;
      const maxM = max_mora !== undefined && max_mora !== null && String(max_mora).trim() !== '' ? parseInt(max_mora) : null;
      if (Number.isFinite(minM) && dias < minM) continue;
      if (Number.isFinite(maxM) && dias > maxM) continue;

      if (estado && String(estado).trim() && String(estado).trim() !== 'todas' && estadoCalc !== String(estado).trim()) continue;

      carteraTotal += saldo;
      if (estadoCalc === 'vigente') vigente += saldo;
      else if (estadoCalc === 'vencida') vencida += saldo;
      else castigada += saldo;

      items.push({
        id_credito: r.id_credito,
        socio: r.nombre_usuario,
        documento: r.documento_usuario,
        linea: r.nombre_linea,
        saldo_pendiente: saldo,
        monto_aprobado: parseFloat(r.monto_aprobado_credito || 0),
        dias_mora: dias,
        cuotas_vencidas: parseInt(r.cuotas_vencidas || 0),
        valor_vencido: parseFloat(r.valor_vencido || 0),
        estado: estadoCalc,
        cuota_proxima: r.cuota_proxima_num ? {
          numero: r.cuota_proxima_num,
          vence: r.cuota_proxima_vence,
          valor: parseFloat(r.cuota_proxima_valor || 0),
        } : null
      });
    }

    const riesgoMora = carteraTotal > 0 ? ((vencida + castigada) / carteraTotal) * 100 : 0;

    res.json({
      kpis: {
        cartera_total: carteraTotal,
        vigente,
        vencida,
        castigada,
        riesgo_mora_pct: riesgoMora,
        creditos: items.length
      },
      items
    });
  } catch (err) {
    console.error('Error gerente cartera:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
