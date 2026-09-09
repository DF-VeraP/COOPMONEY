const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken } = require('../middlewares/auth');
const UserModel = require('../models/user.model');
const CooperativaModel = require('../models/cooperativa.model');
const EmailService = require('../services/email.service');

/**
 * Controlador de Autenticación
 */
class AuthController {
  /**
   * Iniciar sesión en el sistema (Superadmin o usuarios de cooperativa)
   */
  static async login(req, res) {
    const { cooperativaId, usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios." });
    }

    try {
      // 1. Escenario sin cooperativa especificada (o Super Admin)
      if (!cooperativaId || cooperativaId.trim() === '') {
        // Intentar primero como Super Administrador
        const superAdminUser = await UserModel.findSuperAdminByCredential(usuario);

        if (superAdminUser) {
          if (superAdminUser.estado_usuario !== 'activo') {
            return res.status(403).json({ error: "El usuario está inactivo. Contacte a soporte." });
          }

          const isValid = await bcrypt.compare(password, superAdminUser.contrasena_usuario);

          if (!isValid) {
            return res.status(401).json({ error: "Credenciales inválidas." });
          }

          const token = signToken({
            id_usuario: superAdminUser.id_usuario,
            rol: superAdminUser.rol_usuario,
            id_cooperativa: null,
            id_socio: null,
          });

          return res.json({ 
            success: true, 
            message: "Bienvenido Super Administrador", 
            token, 
            user: { 
              id: superAdminUser.id_usuario, 
              nombre: superAdminUser.nombre_usuario, 
              rol: superAdminUser.rol_usuario 
            } 
          });
        }

        // Si no es Super Admin, resolver automáticamente la cooperativa del usuario
        const coopUser = await UserModel.findUserWithCooperativaByCredential(usuario);

        if (!coopUser) {
          return res.status(401).json({ error: "Credenciales inválidas." });
        }

        if (coopUser.estado_cooperativa !== 'activo') {
          return res.status(403).json({ error: "La cooperativa asociada está inactiva. Contacte al administrador." });
        }

        if (coopUser.estado_usuario !== 'activo') {
          return res.status(403).json({ error: "El usuario está inactivo." });
        }

        const isValid = await bcrypt.compare(password, coopUser.contrasena_usuario);

        if (!isValid) {
          return res.status(401).json({ error: "Credenciales inválidas." });
        }

        let socioId = null;
        if (coopUser.rol_usuario === 'socio') {
          socioId = await UserModel.findSocioIdByUserId(coopUser.id_usuario);
        }

        const token = signToken({
          id_usuario: coopUser.id_usuario,
          rol: coopUser.rol_usuario,
          id_cooperativa: coopUser.id_cooperativa_usuario,
          id_socio: socioId,
        });

        return res.json({ 
          success: true, 
          message: `Bienvenido ${coopUser.nombre_usuario}`, 
          token, 
          user: { 
            id: coopUser.id_usuario, 
            nombre: coopUser.nombre_usuario, 
            rol: coopUser.rol_usuario, 
            id_cooperativa: coopUser.id_cooperativa_usuario, 
            cooperativa: coopUser.nombre_cooperativa,
            correo: coopUser.correo_usuario,
            documento: coopUser.documento_usuario,
            telefono: coopUser.telefono_usuario
          } 
        });
      }

      // 2. Escenario Usuarios de Cooperativa
      const cooperativa = await CooperativaModel.findByIdentifier(cooperativaId);

      if (!cooperativa) {
        return res.status(404).json({ error: "La cooperativa seleccionada no existe en el sistema." });
      }

      if (cooperativa.estado_cooperativa !== 'activo') {
        return res.status(403).json({ error: "La cooperativa seleccionada está inactiva. Contacte al administrador." });
      }

      const user = await UserModel.findInCooperativaByCredential(cooperativa.id_cooperativa, usuario);

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      if (user.estado_usuario !== 'activo') {
        return res.status(403).json({ error: "El usuario está inactivo." });
      }

      // Validación estricta con bcrypt
      const isValid = await bcrypt.compare(password, user.contrasena_usuario);

      if (!isValid) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      let socioId = null;
      if (user.rol_usuario === 'socio') {
        socioId = await UserModel.findSocioIdByUserId(user.id_usuario);
      }

      const token = signToken({
        id_usuario: user.id_usuario,
        rol: user.rol_usuario,
        id_cooperativa: cooperativa.id_cooperativa,
        id_socio: socioId,
      });

      return res.json({ 
        success: true, 
        message: `Bienvenido ${user.nombre_usuario}`, 
        token, 
        user: { 
          id: user.id_usuario, 
          nombre: user.nombre_usuario, 
          rol: user.rol_usuario, 
          id_cooperativa: cooperativa.id_cooperativa, 
          cooperativa: cooperativa.nombre_cooperativa,
          correo: user.correo_usuario,
          documento: user.documento_usuario,
          telefono: user.telefono_usuario
        } 
      });

    } catch (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * Cumple con la regla anti-enumeración de usuarios de la Sección 2
   */
  static async recuperarContrasena(req, res) {
    const { correo } = req.body;

    if (!correo || !correo.trim()) {
      return res.status(400).json({ error: "El correo electrónico es obligatorio." });
    }

    try {
      const user = await UserModel.findByEmail(correo.trim());

      // Si el usuario existe y está activo, generamos contraseña temporal y enviamos correo
      if (user && user.estado_usuario === 'activo') {
        // Generar clave temporal segura de 8 caracteres alfanuméricos
        const contrasenaTemp = 'Tmp' + crypto.randomBytes(4).toString('hex');
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(contrasenaTemp, salt);

        // Actualizar en base de datos
        await UserModel.updatePassword(user.id_usuario, hash);

        // Enviar correo de recuperación
        await EmailService.enviarRecuperacionContrasena({
          correo: user.correo_usuario,
          nombre: user.nombre_usuario,
          contrasenaTemp,
          nombreCooperativa: user.nombre_cooperativa || 'COOPMONEY'
        });
      }

      // Respuesta genérica estándar (evita enumeración de usuarios)
      return res.json({
        success: true,
        message: "Si el correo ingresado se encuentra registrado en el sistema, recibirás las instrucciones en tu bandeja de entrada."
      });

    } catch (err) {
      console.error("Error en recuperarContrasena:", err);
      return res.status(500).json({ error: "Error interno al procesar la solicitud." });
    }
  }
}

module.exports = AuthController;
