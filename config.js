// config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwtSecret: process.env.JWT_SECRET,
  port: parseInt(process.env.PORT, 10) || 3000,
  emailService: {
    service: process.env.EMAIL_SERVICE, // for eg: 'gmail'
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  }
};

// db
if (!config.db.host || !config.db.user || !config.db.password || !config.db.database) {
  console.error("Critical Error: Database configuration is incomplete in .env. Please ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_DATABASE are set");
  process.exit(1);
}

// JWT-Secrets
if (!config.jwtSecret) {
  console.error("Critical Error: JWT_SECRET is not set in .env. This is required for token generation and validation");
  process.exit(1);
}

// E-Mail-Service config
if (!config.emailService.service || !config.emailService.user || !config.emailService.password) {
  console.warn("Warning: Email service configuration is incomplete in .env. Password reset functionality may not work correctly");
}