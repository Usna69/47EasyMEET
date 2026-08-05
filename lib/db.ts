// lib/db.ts
import sql from "mssql";

// Custom error class for database issues
export class DatabaseError extends Error {
  constructor(message = "Database is unreachable") {
    super(message);
    this.name = "DatabaseError";
  }
}

// Create a new connection pool
const pool = new sql.ConnectionPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // set true if using Azure or SSL
    trustServerCertificate: true, // allow self-signed certs in dev
  },
});

// Connect to the pool (ensure connection is established)
const poolConnect = pool.connect().catch((err) => {
  console.error("Database connection failed:", err);
  throw new DatabaseError();
});

// Safe query wrapper for executing SQL queries
export async function safeQuery<T>(
  text: string,
  params: unknown[] = [],
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    await poolConnect; // ensure connection

    const request = pool.request();
    params.forEach((param, i) => {
      request.input(`p${i + 1}`, param);
    });

    // Convert $1, $2 to @p1, @p2
    const sql = text.replace(/\$(\d+)/g, (_, i) => `@p${i}`);
    const result = await request.query(sql);

    return {
      rows: result.recordset as T[],
      rowCount: result.rowsAffected?.[0] ?? 0,
    };
  } catch (err) {
    console.error("DB query failed:", err);
    throw new DatabaseError();
  }
}

export { pool, poolConnect };
