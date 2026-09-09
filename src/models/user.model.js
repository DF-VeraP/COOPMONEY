const db = require('../config/db');

class UserModel {
  /**
   * Buscar usuario super administrador por correo, documento o nombre de usuario
   */
  static async findSuperAdminByCredential(credential) {
    const { rows } = await db.query(`
      SELECT id_usuario, nombre_usuario, contrasena_usuario, rol_usuario, estado_usuario 
      FROM usuario 
      WHERE (LOWER(TRIM(correo_usuario)) = LOWER(TRIM($1)) 
          OR documento_usuario = $1 
          OR LOWER(TRIM(nombre_usuario)) = LOWER(TRIM($1))) 
        AND rol_usuario = 'super_admin'
    `, [credential]);
    return rows[0] || null;
  }

  /**
   * Buscar usuario de cooperativa por correo, documento o nombre de usuario
   */
  static async findInCooperativaByCredential(idCooperativa, credential) {
    const { rows } = await db.query(`
      SELECT id_usuario, nombre_usuario, contrasena_usuario, rol_usuario, estado_usuario, correo_usuario, documento_usuario, telefono_usuario 
      FROM usuario 
      WHERE id_cooperativa_usuario = $1 
        AND (LOWER(TRIM(correo_usuario)) = LOWER(TRIM($2)) 
          OR documento_usuario = $2 
          OR LOWER(TRIM(nombre_usuario)) = LOWER(TRIM($2)))
    `, [idCooperativa, credential]);
    return rows[0] || null;
  }

  /**
   * Obtener el id_socio vinculado a un id_usuario si existe
   */
  static async findSocioIdByUserId(idUsuario) {
    const { rows } = await db.query(`
      SELECT id_socio FROM socio WHERE id_usuario_socio = $1 LIMIT 1
    `, [idUsuario]);
    return rows.length > 0 ? rows[0].id_socio : null;
  }

  /**
   * Buscar cualquier usuario por correo electrónico (incluyendo nombre de su cooperativa)
   */
  static async findByEmail(email) {
    const { rows } = await db.query(`
      SELECT u.id_usuario, u.nombre_usuario, u.correo_usuario, u.rol_usuario, u.estado_usuario,
             c.nombre_cooperativa
      FROM usuario u
      LEFT JOIN cooperativa c ON u.id_cooperativa_usuario = c.id_cooperativa
      WHERE LOWER(TRIM(u.correo_usuario)) = LOWER(TRIM($1))
      LIMIT 1
    `, [email]);
    return rows[0] || null;
  }

  /**
   * Buscar usuario con su cooperativa asociada por correo, documento o nombre de usuario (para auto-detección)
   */
  static async findUserWithCooperativaByCredential(credential) {
    const { rows } = await db.query(`
      SELECT u.id_usuario, u.id_cooperativa_usuario, u.nombre_usuario, u.documento_usuario,
             u.correo_usuario, u.contrasena_usuario, u.rol_usuario, u.estado_usuario,
             u.telefono_usuario, c.nombre_cooperativa, c.estado_cooperativa
      FROM usuario u
      JOIN cooperativa c ON u.id_cooperativa_usuario = c.id_cooperativa
      WHERE (LOWER(TRIM(u.correo_usuario)) = LOWER(TRIM($1)) 
          OR u.documento_usuario = $1 
          OR LOWER(TRIM(u.nombre_usuario)) = LOWER(TRIM($1)))
      LIMIT 1
    `, [credential]);
    return rows[0] || null;
  }

  /**
   * Actualizar la contraseña de un usuario
   */
  static async updatePassword(idUsuario, hashContrasena) {
    await db.query(`
      UPDATE usuario
      SET contrasena_usuario = $1
      WHERE id_usuario = $2
    `, [hashContrasena, idUsuario]);
  }
}

module.exports = UserModel;
