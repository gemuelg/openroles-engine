import { Pool } from 'pg';

// Safely load .env file ONLY when running locally in Node.js
if (typeof process !== 'undefined' && process.env && !process.env.CLOUDFLARE_WORKER) {
  try {
    // Dynamic import prevents Cloudflare from trying to bundle Node's 'fs' module
    const dotenv = require('dotenv');
    dotenv.config();
  } catch {
    // Silently ignore if running in an environment without dotenv
  }
}

// Verify DATABASE_URL exists in the current environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from environment variables');
}

// Create connection pool retaining your max: 5 memory limit
export const db = new Pool({
  connectionString: databaseUrl,
  max: 5,
  // Enable SSL in production for cloud-hosted databases
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});