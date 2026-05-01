const jwt = require('jsonwebtoken');

// Token blacklist (in-memory)
const tokenBlacklist = new Set();

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    //check if the authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Check if the token is in the blacklist
   if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token has been revoked. Please login again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.token = token; // Store the token for potential blacklisting on logout
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function addToBlacklist(token) {
  tokenBlacklist.add(token);
}

module.exports = authMiddleware;
module.exports.addToBlacklist = addToBlacklist;