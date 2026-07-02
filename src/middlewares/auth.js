const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el entorno');
  }
  return secret;
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h', ...options });
}

function authenticateJWT(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const token = header.slice('Bearer '.length).trim();
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireSameUserParam(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id) return res.status(400).json({ error: `Falta parámetro ${paramName}` });
    if (String(id) !== String(req.user.id_usuario)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireSameUserBody(bodyField = 'id_usuario') {
  return (req, res, next) => {
    const id = req.body?.[bodyField];
    if (!id) return res.status(400).json({ error: `Falta ${bodyField}` });
    if (String(id) !== String(req.user.id_usuario)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireSameSocioParam(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id) return res.status(400).json({ error: `Falta parámetro ${paramName}` });
    if (String(id) !== String(req.user.id_socio)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireSameSocioBody(bodyField = 'id_socio') {
  return (req, res, next) => {
    const id = req.body?.[bodyField];
    if (!id) return res.status(400).json({ error: `Falta ${bodyField}` });
    if (String(id) !== String(req.user.id_socio)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireCooperativaFromQuery(queryField = 'cooperativaId') {
  return (req, res, next) => {
    if (req.user.rol === 'super_admin') return next();
    const coopId = req.query?.[queryField];
    if (!coopId) return res.status(400).json({ error: `Falta ${queryField}` });
    if (String(coopId) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

function requireCooperativaFromBody(bodyField = 'id_cooperativa') {
  return (req, res, next) => {
    if (req.user.rol === 'super_admin') return next();
    const coopId = req.body?.[bodyField];
    if (!coopId) return res.status(400).json({ error: `Falta ${bodyField}` });
    if (String(coopId) !== String(req.user.id_cooperativa)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = {
  signToken,
  authenticateJWT,
  authorizeRoles,
  requireSameUserParam,
  requireSameUserBody,
  requireSameSocioParam,
  requireSameSocioBody,
  requireCooperativaFromQuery,
  requireCooperativaFromBody,
};

