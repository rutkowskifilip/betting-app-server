require("dotenv").config();
const { Client } = require("pg");
const dbConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  port: 5432, // Default PostgreSQL port
  ssl: { rejectUnauthorized: true },
};
const db = new Client(dbConfig);
module.exports = db;
