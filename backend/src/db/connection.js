const fs = require("fs");
const path = require("path");

const DATABASE_URL = process.env.DATABASE_URL || "";
const usePostgres = Boolean(DATABASE_URL && DATABASE_URL.startsWith("postgres"));

function nowIso() {
  return new Date().toISOString();
}

function createSqlite() {
  const Database = require("better-sqlite3");
  const dbPath =
    process.env.SQLITE_PATH ||
    path.join(__dirname, "../../data/support.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const raw = new Database(dbPath);
  raw.pragma("journal_mode = WAL");
  raw.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  raw.exec(schema);

  return {
    dialect: "sqlite",
    all(sql, params = []) {
      return raw.prepare(sql).all(...params);
    },
    get(sql, params = []) {
      return raw.prepare(sql).get(...params);
    },
    run(sql, params = []) {
      const info = raw.prepare(sql).run(...params);
      return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    },
    transaction(fn) {
      return raw.transaction(fn)();
    },
    raw,
  };
}

function createPostgres() {
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const toPg = (sql) => {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  };

  return {
    dialect: "postgres",
    async all(sql, params = []) {
      const result = await pool.query(toPg(sql), params);
      return result.rows;
    },
    async get(sql, params = []) {
      const result = await pool.query(toPg(sql), params);
      return result.rows[0] || null;
    },
    async run(sql, params = []) {
      const result = await pool.query(toPg(sql), params);
      return { changes: result.rowCount, lastInsertRowid: null };
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const tx = {
          dialect: "postgres",
          async all(sql, params = []) {
            const result = await client.query(toPg(sql), params);
            return result.rows;
          },
          async get(sql, params = []) {
            const result = await client.query(toPg(sql), params);
            return result.rows[0] || null;
          },
          async run(sql, params = []) {
            const result = await client.query(toPg(sql), params);
            return { changes: result.rowCount, lastInsertRowid: null };
          },
        };
        const value = await fn(tx);
        await client.query("COMMIT");
        return value;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    pool,
  };
}

const db = usePostgres ? createPostgres() : createSqlite();

async function ensurePostgresSchema() {
  if (db.dialect !== "postgres") return;
  const schema = fs.readFileSync(path.join(__dirname, "schema.pg.sql"), "utf8");
  await db.pool.query(schema);
}

module.exports = { db, nowIso, usePostgres, ensurePostgresSchema };
