const bcrypt = require('bcryptjs');
const db = require('../config/db');
const CooperativaModel = require('../models/cooperativa.model');

/**
 * Controlador de Super Administrador
 */
class SuperadminController {
  /**
   * Métricas generales del sistema
   */
  static async getStats(req, res) {
    try {
      const stats = await CooperativaModel.getGlobalStats();
      res.json(stats);
    } catch (err) {
      console.error("Error en superadmin/stats:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

  /**
   * Listar cooperativas registradas y solicitudes pendientes
   */
  static async getCooperativas(req, res) {
    try {
      const cooperativas = await CooperativaModel.getAllWithSolicitudes();
      res.json(cooperativas);
    } catch (err) {
      console.error("Error en superadmin/cooperativas:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

  /**
   * Aprobar solicitud de afiliación de cooperativa
   */
  static async aprobarSolicitud(req, res) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const sol = await CooperativaModel.getSolicitudById(req.params.id, client);
      if (!sol) throw new Error("Solicitud no encontrada");

      // Insertar en cooperativa
      const newCoop = await CooperativaModel.insertCooperativa({
        nombre: sol.nombre_cooperativa,
        nit: sol.nit_cooperativa,
        direccion: sol.direccion_cooperativa,
        telefono: sol.telefono_cooperativa,
        correo: sol.correo_cooperativa
      }, client);

      // Insertar admin_local
      await CooperativaModel.insertAdminLocal({
        idCooperativa: newCoop.id_cooperativa,
        nombre: sol.nombre_representante,
        documento: sol.cedula_representante,
        correo: sol.correo_representante,
        contrasenaHash: sol.contrasena_admin,
        telefono: sol.telefono_representante
      }, client);

      // Eliminar solicitud
      await CooperativaModel.deleteSolicitud(sol.id_solicitud, client);

      await client.query('COMMIT');
      res.json({ success: true, message: "Cooperativa aprobada y registrada correctamente." });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error al aprobar solicitud:", err);
      res.status(500).json({ error: err.message || "Error interno" });
    } finally {
      client.release();
    }
  }

  /**
   * Rechazar solicitud de afiliación
   */
  static async rechazarSolicitud(req, res) {
    try {
      await CooperativaModel.deleteSolicitud(req.params.id);
      res.json({ success: true, message: "Solicitud rechazada y eliminada." });
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

  /**
   * Crear cooperativa directamente
   */
  static async createCooperativa(req, res) {
    const client = await db.connect();
    try {
      const { nit, nombre, correo, telefono, direccion, web, nombre_rep, cedula_rep, cargo_rep, tel_rep, correo_rep, pass_rep } = req.body;

      if (!nit || !nombre || !correo || !telefono || !direccion || !nombre_rep || !cedula_rep || !cargo_rep || !tel_rep || !correo_rep || !pass_rep) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }

      await client.query('BEGIN');

      const isDuplicate = await CooperativaModel.checkDuplicate(nit, correo, client);
      if (isDuplicate) {
        throw new Error("El NIT o correo de la cooperativa ya están registrados.");
      }

      const newCoop = await CooperativaModel.insertCooperativa({
        nombre, nit, direccion, telefono, correo
      }, client);

      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(pass_rep, salt);

      await CooperativaModel.insertAdminLocal({
        idCooperativa: newCoop.id_cooperativa,
        nombre: nombre_rep,
        documento: cedula_rep,
        correo: correo_rep,
        contrasenaHash: hash,
        telefono: tel_rep
      }, client);

      await client.query('COMMIT');
      res.json({ success: true, message: "Cooperativa y administrador local registrados exitosamente." });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error al crear cooperativa:", err);
      res.status(500).json({ error: err.message || "Error interno del servidor" });
    } finally {
      client.release();
    }
  }

  /**
   * Detalles avanzados y métricas de una cooperativa
   */
  static async getCooperativaDetalles(req, res) {
    try {
      const { id } = req.params;
      const detalles = await CooperativaModel.getDetalles(id);

      if (!detalles) {
        return res.status(404).json({ error: "Cooperativa no encontrada" });
      }

      res.json(detalles);
    } catch (err) {
      console.error("Error en superadmin/cooperativas/:id/detalles:", err);
      res.status(500).json({ error: "Error interno obteniendo detalles" });
    }
  }

  /**
   * Datos de cooperativa para formulario de edición
   */
  static async getCooperativaForEdit(req, res) {
    try {
      const { id } = req.params;
      const coop = await CooperativaModel.findForEdit(id);

      if (!coop) {
        return res.status(404).json({ error: "Cooperativa no encontrada" });
      }

      res.json(coop);
    } catch (err) {
      console.error("Error en superadmin/cooperativas/:id:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

  /**
   * Actualizar datos de cooperativa y su administrador local
   */
  static async updateCooperativa(req, res) {
    const client = await db.connect();
    try {
      const { id } = req.params;
      const { nombre, correo, telefono, direccion, estado, admin_nombre, admin_correo, pass_rep } = req.body;

      await client.query('BEGIN');

      await client.query(`
        UPDATE cooperativa
        SET nombre_cooperativa = $1, correo_cooperativa = $2, telefono_cooperativa = $3, direccion_cooperativa = $4, estado_cooperativa = $5
        WHERE id_cooperativa = $6
      `, [nombre, correo, telefono, direccion, estado, id]);

      let queryAdmin = `
        UPDATE usuario
        SET nombre_usuario = $1, correo_usuario = $2
      `;
      let paramsAdmin = [admin_nombre, admin_correo, id];

      if (pass_rep && pass_rep.trim().length > 0) {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(pass_rep, salt);
        queryAdmin += `, contrasena_usuario = $4 WHERE id_cooperativa_usuario = $3 AND rol_usuario = 'admin_local'`;
        paramsAdmin = [admin_nombre, admin_correo, id, hash];
      } else {
        queryAdmin += ` WHERE id_cooperativa_usuario = $3 AND rol_usuario = 'admin_local'`;
      }

      await client.query(queryAdmin, paramsAdmin);

      await client.query('COMMIT');
      res.json({ success: true, message: "Datos de cooperativa actualizados correctamente." });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error al actualizar cooperativa:", err);
      res.status(500).json({ error: "Error interno al actualizar cooperativa" });
    } finally {
      client.release();
    }
  }

  /**
   * Reporte: Cooperativas registradas por mes
   */
  static async getCooperativasPorMes(req, res) {
    try {
      const rows = await CooperativaModel.getCooperativasPorMes();
      res.json(rows);
    } catch (err) {
      console.error("Error en dashboard/cooperativas-por-mes:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Reporte: Top cooperativas con más socios y ahorros
   */
  static async getTopSocios(req, res) {
    try {
      const rows = await CooperativaModel.getTopSocios();
      res.json(rows);
    } catch (err) {
      console.error("Error en dashboard/top-socios:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Reporte: Resumen ejecutivo general
   */
  static async getReportesResumen(req, res) {
    try {
      const data = await CooperativaModel.getReportesResumen();
      res.json(data);
    } catch (err) {
      console.error("Error en reportes/resumen:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Reporte: Cartera mensual desembolsada
   */
  static async getCarteraMensual(req, res) {
    try {
      const rows = await CooperativaModel.getCarteraMensual();
      res.json(rows);
    } catch (err) {
      console.error("Error en reportes/cartera-mensual:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Reporte: Morosidad por cooperativa
   */
  static async getMorosidad(req, res) {
    try {
      const rows = await CooperativaModel.getMorosidad();
      res.json(rows);
    } catch (err) {
      console.error("Error en reportes/morosidad:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = SuperadminController;
