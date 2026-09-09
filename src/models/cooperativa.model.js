const db = require('../config/db');

class CooperativaModel {
  /**
   * Obtener todas las cooperativas activas
   */
  static async findActive() {
    const { rows } = await db.query(`
      SELECT id_cooperativa, nombre_cooperativa, nit_cooperativa 
      FROM cooperativa 
      WHERE estado_cooperativa = 'activo'
    `);
    return rows;
  }

  /**
   * Buscar cooperativa por nombre compuesto o ID
   */
  static async findByIdentifier(identifier) {
    const { rows } = await db.query(`
      SELECT id_cooperativa, nombre_cooperativa, estado_cooperativa 
      FROM cooperativa 
      WHERE (nombre_cooperativa || ' (' || nit_cooperativa || ')') = $1 
         OR id_cooperativa::text = $1
    `, [identifier]);
    return rows[0] || null;
  }

  /**
   * Registrar una nueva solicitud de afiliación de cooperativa
   */
  static async createSolicitud(data, hashContrasenaAdmin) {
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
      data.cantidad_socios, data.necesita_migracion, hashContrasenaAdmin
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Estadísticas globales para el Super Administrador
   */
  static async getGlobalStats() {
    const cooperativasRes = await db.query("SELECT COUNT(*) FROM cooperativa WHERE estado_cooperativa = 'activo'");
    const sociosRes = await db.query("SELECT COUNT(*) FROM socio WHERE estado_socio = 'activo'");
    const creditosRes = await db.query("SELECT COALESCE(SUM(monto_aprobado_credito), 0) as total FROM credito");
    const carteraRes = await db.query("SELECT COALESCE(SUM(saldo_pendiente_credito), 0) as total FROM credito");

    return {
      total_cooperativas: parseInt(cooperativasRes.rows[0].count),
      total_socios: parseInt(sociosRes.rows[0].count),
      total_creditos: parseFloat(creditosRes.rows[0].total),
      total_cartera: parseFloat(carteraRes.rows[0].total)
    };
  }

  /**
   * Listado combinado de cooperativas registradas y solicitudes pendientes
   */
  static async getAllWithSolicitudes() {
    const { rows: coops } = await db.query(`
      SELECT id_cooperativa as id, nit_cooperativa as nit, nombre_cooperativa as nombre, 
             estado_cooperativa as estado, 
             (SELECT COUNT(*) FROM socio WHERE id_cooperativa_socio = c.id_cooperativa) as socios,
             (SELECT COALESCE(SUM(saldo_pendiente_credito), 0) FROM credito cr 
              JOIN socio s ON cr.id_socio_credito = s.id_socio 
              WHERE s.id_cooperativa_socio = c.id_cooperativa) as cartera,
             'registrada' as tipo
      FROM cooperativa c
      ORDER BY id_cooperativa DESC
    `);

    const { rows: solicitudes } = await db.query(`
      SELECT id_solicitud as id, nit_cooperativa as nit, nombre_cooperativa as nombre, 
             estado_solicitud as estado, cantidad_socios as socios_aprox,
             0 as cartera,
             'solicitud' as tipo
      FROM solicitud_afiliacion
      WHERE estado_solicitud = 'pendiente'
      ORDER BY id_solicitud DESC
    `);

    return [...solicitudes, ...coops];
  }

  /**
   * Obtener solicitud por ID
   */
  static async getSolicitudById(idSolicitud, runner = db) {
    const { rows } = await runner.query('SELECT * FROM solicitud_afiliacion WHERE id_solicitud = $1', [idSolicitud]);
    return rows[0] || null;
  }

  /**
   * Eliminar solicitud por ID
   */
  static async deleteSolicitud(idSolicitud, runner = db) {
    return runner.query('DELETE FROM solicitud_afiliacion WHERE id_solicitud = $1', [idSolicitud]);
  }

  /**
   * Crear cooperativa en tabla
   */
  static async insertCooperativa({ nombre, nit, direccion, telefono, correo, estado = 'activo' }, runner = db) {
    const { rows } = await runner.query(`
      INSERT INTO cooperativa (nombre_cooperativa, nit_cooperativa, direccion_cooperativa, telefono_cooperativa, correo_cooperativa, estado_cooperativa, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id_cooperativa
    `, [nombre, nit, direccion, telefono, correo, estado]);
    return rows[0];
  }

  /**
   * Insertar usuario admin local
   */
  static async insertAdminLocal({ idCooperativa, nombre, documento, correo, contrasenaHash, telefono }, runner = db) {
    const { rows } = await runner.query(`
      INSERT INTO usuario (id_cooperativa_usuario, nombre_usuario, documento_usuario, correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, telefono_usuario)
      VALUES ($1, $2, $3, $4, $5, 'admin_local', 'activo', $6)
      RETURNING id_usuario
    `, [idCooperativa, nombre, documento, correo, contrasenaHash, telefono]);
    return rows[0];
  }

  /**
   * Validar duplicados por NIT o Correo
   */
  static async checkDuplicate(nit, correo, runner = db) {
    const { rows } = await runner.query('SELECT id_cooperativa FROM cooperativa WHERE nit_cooperativa = $1 OR correo_cooperativa = $2', [nit, correo]);
    return rows.length > 0;
  }

  /**
   * Métricas detalladas de una cooperativa específica
   */
  static async getDetalles(idCooperativa) {
    const { rows: roles } = await db.query(`
      SELECT rol_usuario, COUNT(*) as cantidad 
      FROM usuario 
      WHERE id_cooperativa_usuario = $1 AND estado_usuario = 'activo'
      GROUP BY rol_usuario
    `, [idCooperativa]);

    const { rows: metrics } = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM socio WHERE id_cooperativa_socio = $1 AND estado_socio = 'activo') as socios,
        (SELECT COALESCE(SUM(saldo_ahorros_socio), 0) FROM socio WHERE id_cooperativa_socio = $1) as ahorros,
        (SELECT COALESCE(SUM(saldo_pendiente_credito), 0) FROM credito cr JOIN socio s ON cr.id_socio_credito = s.id_socio WHERE s.id_cooperativa_socio = $1 AND cr.estado_credito = 'activo') as cartera_vigente
    `, [idCooperativa]);

    const { rows: vencida } = await db.query(`
      SELECT COALESCE(SUM(c.saldo_restante_cuota), 0) as cartera_vencida
      FROM cuota c
      JOIN credito cr ON c.id_credito_cuota = cr.id_credito
      JOIN socio s ON cr.id_socio_credito = s.id_socio
      WHERE s.id_cooperativa_socio = $1 AND c.estado_cuota = 'pendiente' AND c.fecha_vencimiento_cuota < NOW()
    `, [idCooperativa]);

    const { rows: base } = await db.query(
      `SELECT nombre_cooperativa, estado_cooperativa FROM cooperativa WHERE id_cooperativa = $1`, 
      [idCooperativa]
    );

    if (base.length === 0) return null;

    return {
      cooperativa: base[0],
      empleados: roles,
      metricas: metrics[0],
      cartera_vencida: vencida[0].cartera_vencida
    };
  }

  /**
   * Buscar cooperativa con datos de su admin local para edición
   */
  static async findForEdit(idCooperativa) {
    const { rows } = await db.query(`
      SELECT c.*, 
             u.id_usuario as admin_id, u.nombre_usuario as admin_nombre, u.correo_usuario as admin_correo, u.documento_usuario as admin_cedula, u.telefono_usuario as admin_telefono
      FROM cooperativa c
      LEFT JOIN usuario u ON c.id_cooperativa = u.id_cooperativa_usuario AND u.rol_usuario = 'admin_local'
      WHERE c.id_cooperativa = $1
      LIMIT 1
    `, [idCooperativa]);
    return rows[0] || null;
  }

  /**
   * Métricas para gráficos de dashboard
   */
  static async getCooperativasPorMes() {
    const { rows } = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', fecha_registro), 'YYYY-MM')  AS mes,
        TO_CHAR(DATE_TRUNC('month', fecha_registro), 'Mon YY')   AS mes_label,
        COUNT(*)::int                                             AS total
      FROM cooperativa
      WHERE fecha_registro IS NOT NULL
        AND fecha_registro >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', fecha_registro)
      ORDER BY DATE_TRUNC('month', fecha_registro) ASC
    `);
    return rows;
  }

  static async getTopSocios() {
    const { rows } = await db.query(`
      SELECT
        co.nombre_cooperativa,
        COUNT(s.id_socio)::int AS total_socios,
        COALESCE(SUM(s.saldo_ahorros_socio), 0)::numeric AS total_ahorros
      FROM cooperativa co
      LEFT JOIN socio s ON s.id_cooperativa_socio = co.id_cooperativa
        AND s.estado_socio = 'activo'
      WHERE co.estado_cooperativa = 'activo'
      GROUP BY co.id_cooperativa, co.nombre_cooperativa
      ORDER BY total_socios DESC
      LIMIT 6
    `);
    return rows;
  }

  static async getReportesResumen() {
    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM cooperativa WHERE estado_cooperativa = 'activo')::int                                          AS total_cooperativas,
        (SELECT COUNT(*) FROM socio WHERE estado_socio = 'activo')::int                                                     AS total_socios,
        (SELECT COUNT(*) FROM credito WHERE estado_credito = 'activo')::int                                                 AS creditos_activos,
        (SELECT COALESCE(SUM(saldo_pendiente_credito), 0) FROM credito WHERE estado_credito = 'activo')::numeric            AS cartera_total,
        (SELECT COALESCE(SUM(saldo_restante_cuota), 0)   FROM cuota  WHERE estado_cuota = 'pendiente' AND fecha_vencimiento_cuota < NOW())::numeric AS cartera_vencida,
        (SELECT COALESCE(SUM(saldo_ahorros_socio), 0)    FROM socio)::numeric                                               AS total_ahorros,
        (SELECT COUNT(*) FROM cuota WHERE estado_cuota = 'pendiente')::int                                                  AS cuotas_pendientes_total,
        (SELECT COUNT(*) FROM cuota WHERE estado_cuota = 'pendiente' AND fecha_vencimiento_cuota < NOW())::int              AS cuotas_vencidas_total,
        ROUND(
          (SELECT COUNT(*) FROM cuota WHERE estado_cuota = 'pendiente' AND fecha_vencimiento_cuota < NOW())::numeric
          / NULLIF((SELECT COUNT(*) FROM cuota WHERE estado_cuota = 'pendiente'), 0) * 100
        , 2) AS tasa_morosidad_global_pct
    `);
    return rows[0];
  }

  static async getCarteraMensual() {
    const { rows } = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', cr.fecha_desembolso_credito), 'YYYY-MM')   AS mes,
        TO_CHAR(DATE_TRUNC('month', cr.fecha_desembolso_credito), 'Mon YYYY')  AS mes_label,
        COUNT(cr.id_credito)::int                                               AS total_creditos,
        COALESCE(SUM(cr.monto_aprobado_credito), 0)::numeric                   AS monto_desembolsado,
        COALESCE(SUM(cr.saldo_pendiente_credito), 0)::numeric                  AS saldo_pendiente
      FROM credito cr
      WHERE cr.fecha_desembolso_credito >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', cr.fecha_desembolso_credito)
      ORDER BY DATE_TRUNC('month', cr.fecha_desembolso_credito) ASC
    `);
    return rows;
  }

  static async getMorosidad() {
    const { rows } = await db.query(`
      SELECT
        co.id_cooperativa,
        co.nombre_cooperativa,
        COUNT(DISTINCT cu.id_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente')::int                                                              AS cuotas_pendientes_total,
        COUNT(DISTINCT cu.id_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente' AND cu.fecha_vencimiento_cuota < NOW())::int                       AS cuotas_vencidas,
        COALESCE(SUM(cu.saldo_restante_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente' AND cu.fecha_vencimiento_cuota < NOW()), 0)::numeric     AS valor_vencido,
        COALESCE(SUM(cr.saldo_pendiente_credito) FILTER (WHERE cr.estado_credito = 'activo'), 0)::numeric                                          AS cartera_vigente,
        COUNT(DISTINCT cr.id_credito) FILTER (WHERE cr.estado_credito = 'activo')::int                                                             AS creditos_activos,
        ROUND(
          CASE
            WHEN COUNT(cu.id_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente') = 0 THEN 0
            ELSE COUNT(cu.id_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente' AND cu.fecha_vencimiento_cuota < NOW())::numeric
                 / COUNT(cu.id_cuota) FILTER (WHERE cu.estado_cuota = 'pendiente')::numeric * 100
          END, 2
        ) AS tasa_morosidad_pct
      FROM cooperativa co
      LEFT JOIN socio s   ON s.id_cooperativa_socio  = co.id_cooperativa
      LEFT JOIN credito cr ON cr.id_socio_credito     = s.id_socio
      LEFT JOIN cuota cu   ON cu.id_credito_cuota     = cr.id_credito
      WHERE co.estado_cooperativa = 'activo'
      GROUP BY co.id_cooperativa, co.nombre_cooperativa
      ORDER BY tasa_morosidad_pct DESC
    `);
    return rows;
  }
}

module.exports = CooperativaModel;
