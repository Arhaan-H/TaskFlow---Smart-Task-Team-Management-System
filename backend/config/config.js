// ============================================================
// FILE: backend/config/config.js
// PURPOSE: Centralized configuration object for the entire app
// ============================================================
// Instead of scattering process.env.SOMETHING calls throughout
// the codebase, we gather all config values in ONE place.
// This makes it easy to see all configuration at a glance,
// set defaults, and swap values without hunting through files.
// ============================================================

// Load environment variables from .env so process.env is populated
require('dotenv').config();

// path module is used to build the upload directory path safely
// path.join works on both Windows (backslash) and Linux (forward slash)
const path = require('path');

/**
 * config - Centralized configuration object
 *
 * All app-wide settings live here. Import this object wherever
 * you need a config value, e.g.:
 *   const config = require('./config/config');
 *   console.log(config.port);
 */
const config = {
  // ── Server Settings ──────────────────────────────────────
  // The TCP port Express will listen on. Defaults to 5000 if not set.
  port: process.env.PORT || 5000,

  // ── Database Settings ─────────────────────────────────────
  // Full MongoDB connection URI (local or Atlas cloud)
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow',

  // ── Authentication Settings ───────────────────────────────
  // Secret key for signing & verifying JWTs. MUST stay private!
  jwtSecret: process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production',

  // How long a token is valid — e.g. '7d', '1h', '30m'
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // ── Environment ───────────────────────────────────────────
  // 'development' shows stack traces; 'production' hides them
  nodeEnv: process.env.NODE_ENV || 'development',

  // ── File Upload Settings ──────────────────────────────────
  // Absolute path to the folder where uploaded avatar images are stored
  // __dirname is the directory of THIS file (config/), so we go up one level
  uploadPath: path.join(__dirname, '..', 'uploads'),
};

// Export the config object to be used anywhere in the project
module.exports = config;
