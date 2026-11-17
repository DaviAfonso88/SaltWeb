import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

type Database = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não está definida. Configure a string de conexão do Neon em .env.local.",
    );
  }
  const pool = new Pool({ connectionString: url });
  return drizzle({ client: pool, schema });
}

const globalForDb = globalThis as unknown as { __saltDb?: Database };

/**
 * Cliente criado sob demanda para que `next build` funcione sem DATABASE_URL.
 * O driver WebSocket do Neon suporta transações interativas.
 */
export function getDb(): Database {
  if (!globalForDb.__saltDb) {
    globalForDb.__saltDb = createDb();
  }
  return globalForDb.__saltDb;
}

export type Db = Database;
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
export { schema };
