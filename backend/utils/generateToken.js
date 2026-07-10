// ============================================================
// FILE: backend/utils/generateToken.js
// PURPOSE: Create and sign a JSON Web Token (JWT) for a user
// ============================================================
// A JWT is a compact, self-contained token that:
//   1. Identifies who the user is (contains their userId)
//   2. Has an expiry date (so old tokens stop working)
//   3. Is cryptographically signed (so it can't be tampered with)
//
// Flow:
//   User logs in → server creates JWT → client stores it
//   → client sends JWT with every request → server verifies it
// ============================================================

const jwt     = require('jsonwebtoken');
const config  = require('../config/config');

/**
 * generateToken - Creates a signed JWT for a given user
 *
 * @param {string|ObjectId} userId - The MongoDB _id of the user
 * @returns {string} - A signed JWT string (send this to the client)
 *
 * The payload (data inside the token) only contains the userId.
 * We look up the full user from the DB in the auth middleware
 * so we always have up-to-date user data.
 *
 * NEVER put sensitive info (passwords, credit cards) in a JWT —
 * the payload is base64-encoded, not encrypted! Anyone can decode it,
 * but only the server can VERIFY its signature.
 */
const generateToken = (userId) => {
  return jwt.sign(
    // Payload — the data encoded inside the token
    { id: userId },

    // Secret key — used to sign the token. Must be kept private!
    config.jwtSecret,

    // Options
    {
      expiresIn: config.jwtExpiresIn, // e.g. '7d' means token expires in 7 days
    }
  );
};

module.exports = generateToken;
