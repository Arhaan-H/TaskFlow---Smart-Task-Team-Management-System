const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize express app
const app = express();

// 1. Security Headers Middleware (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static files (like avatars) in front-end
}));

// 2. CORS Configuration (Allows sharing resources with Angular app)
app.use(cors({
  origin: 'http://localhost:4200', // Angular development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Logger Middleware (morgan)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiter Middleware (prevents brute-force/DDoS attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 5. Body Parsers (Parse incoming JSON & UrlEncoded payloads)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Serve Profile Picture uploads as static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// 8. 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Route ${req.originalUrl} does not exist.`
  });
});

// 9. Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
