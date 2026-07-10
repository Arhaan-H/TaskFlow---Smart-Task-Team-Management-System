const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/config');

/**
 * TaskFlow Backend Entry Point
 * Starts database connection and Express HTTP server.
 */

// Handle uncaught exceptions (e.g. referencing an undefined variable)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB Database
connectDB();

// Start the HTTP Server
const PORT = config.port || 5000;
const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Server running in ${config.nodeEnv} mode`);
  console.log(`🔌 Listening on Port ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});

// Handle unhandled promise rejections (e.g. database connection failures)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
