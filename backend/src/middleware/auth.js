const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireTokens = (req, res, next) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Google access token required' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireTokens
}; 