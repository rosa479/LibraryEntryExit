// db.js
require('dotenv').config()
const { Pool } = require('pg')

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000, // 30s before idle connections are closed
  connectionTimeoutMillis: 2000 // 2s to establish new connection
})

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
  process.exit(-1)
})

module.exports = pool

