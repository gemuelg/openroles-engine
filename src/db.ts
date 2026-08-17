import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from environment variables');
}

// Create connection pool retaining max: 5 memory limit
export const db = new Pool({
  connectionString: databaseUrl,
  max: 5,
  // Enable SSL in production for cloud-hosted databases
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});