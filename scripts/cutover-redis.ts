/**
 * Virada do Redis: remove os dados do sistema antigo (inscrições, participantes, usuários e sessões).
 *
 * Uso (de um terminal interativo, com UPSTASH_REDIS_REST_URL/TOKEN no .env):
 *   npm run cutover:redis                              → simulação: só conta as chaves (padrão)
 *   npm run cutover:redis -- --export <arquivo.json>   → grava uma cópia local antes de qualquer exclusão
 *   npm run cutover:redis -- --confirm                 → exclui, depois de digitar EXCLUIR
 *   npm run cutover:redis -- --export <arquivo> --confirm   → exporta e só então exclui
 *
 * Nunca toca nas chaves de limite de requisições (`salt:rl:*`). É idempotente: rodar de novo
 * depois de excluir só mostra 0 chaves. O arquivo exportado contém dados pessoais e de saúde:
 * guarde fora do repositório e apague quando não for mais necessário.
 */
import { Redis } from "@upstash/redis";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

import { getDb } from "../lib/db";
import { auditLog } from "../lib/db/schema";

/** Prefixos do sistema antigo (inscrições, participantes, importação, login do /admin-camp e estatísticas). */
const PATTERNS = [
  "acampa:*",
  "festa-roca:*",
  "projeto-missionario:*",
  "salt:participant:*",
  "salt:participants:*",
  "salt:import:*",
  "salt:auth:*",
  "salt:stats:*",
];

/** Chaves que NUNCA são exportadas nem excluídas (rate limit da API pública e do login). */
const PROTECTED_PREFIXES = ["salt:rl:", "@upstash/ratelimit"];
const CONFIRM_WORD = "EXCLUIR";
const DELETE_BATCH = 100;
const EXPORT_CONCURRENCY = 20;

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const valueOf = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const confirm = flag("--confirm");
const exportPath = valueOf("--export");
const isProtected = (key: string) => PROTECTED_PREFIXES.some((p) => key.startsWith(p));

function die(message: string): never {
  console.error(`\nERRO: ${message}`);
  process.exit(1);
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) die("Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN (no .env).");
  return new Redis({ url, token });
}

async function scanPattern(redis: Redis, pattern: string): Promise<string[]> {
  const found = new Set<string>();
  let cursor: string | number = 0;
  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, { match: pattern, count: 500 });
    for (const key of keys) if (!isProtected(key)) found.add(key);
    cursor = next;
  } while (String(cursor) !== "0");
  return [...found];
}

async function collect(redis: Redis) {
  const byPattern = new Map<string, string[]>();
  const all = new Set<string>();
  for (const pattern of PATTERNS) {
    const keys = await scanPattern(redis, pattern);
    byPattern.set(pattern, keys);
    for (const k of keys) all.add(k);
  }
  return { byPattern, all: [...all].sort() };
}

function printCounts(title: string, byPattern: Map<string, string[]>) {
  console.log(`\n${title}`);
  for (const [pattern, keys] of byPattern) console.log(`  ${pattern.padEnd(26)} ${String(keys.length).padStart(6)} chave(s)`);
}

async function readValue(redis: Redis, key: string) {
  const type = await redis.type(key);
  const ttl = await redis.ttl(key);
  let value: unknown = null;
  switch (type) {
    case "string":
      value = await redis.get(key);
      break;
    case "list":
      value = await redis.lrange(key, 0, -1);
      break;
    case "set":
      value = await redis.smembers(key);
      break;
    case "hash":
      value = await redis.hgetall(key);
      break;
    case "zset":
      value = await redis.zrange(key, 0, -1, { withScores: true });
      break;
    default:
      value = null;
  }
  return { type, ttl: ttl >= 0 ? ttl : null, value };
}

/** O arquivo exportado tem dados pessoais: se ficar dentro do repositório, precisa estar no .gitignore. */
function assertSafeExportPath(file: string) {
  const resolved = path.resolve(file);
  const root = process.cwd();
  const inside = resolved === root || resolved.startsWith(root + path.sep);
  if (!inside) return resolved;
  const ignored = spawnSync("git", ["check-ignore", "-q", resolved], { cwd: root }).status === 0;
  if (!ignored) {
    die(`"${file}" fica dentro do repositório e não está no .gitignore. Use um caminho fora do projeto (ex.: ../cutover-redis.json) para não commitar dados pessoais.`);
  }
  return resolved;
}

async function exportKeys(redis: Redis, keys: string[], file: string) {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < keys.length; i += EXPORT_CONCURRENCY) {
    const chunk = keys.slice(i, i + EXPORT_CONCURRENCY);
    const values = await Promise.all(chunk.map((k) => readValue(redis, k)));
    chunk.forEach((k, j) => (out[k] = values[j]));
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ exportedAt: new Date().toISOString(), total: keys.length, keys: out }, null, 2), { mode: 0o600 });
  console.log(`\nExportadas ${keys.length} chave(s) para ${file}`);
  console.log("ATENÇÃO: o arquivo contém dados pessoais e de saúde. Mantenha fora do repositório e apague quando não precisar mais.");
}

async function deleteKeys(redis: Redis, keys: string[]) {
  let deleted = 0;
  for (let i = 0; i < keys.length; i += DELETE_BATCH) {
    const batch = keys.slice(i, i + DELETE_BATCH);
    deleted += await redis.del(...batch);
    process.stdout.write(`\r  excluídas ${Math.min(i + DELETE_BATCH, keys.length)}/${keys.length}`);
  }
  process.stdout.write("\n");
  return deleted;
}

async function recordAudit(metadata: Record<string, unknown>) {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL não definido: a execução não foi registrada em audit_log.");
    return;
  }
  try {
    await getDb()
      .insert(auditLog)
      .values({
        actorUserId: null,
        actorLabel: "script cutover-redis",
        action: "cutover.redis",
        entityType: "system",
        entityId: null,
        summary: `Virada do Redis: ${metadata.deleted} chave(s) excluída(s), ${metadata.remaining} restante(s)`,
        metadata,
        ip: null,
      });
    console.log("Execução registrada em audit_log (cutover.redis).");
  } catch (error) {
    console.error("Não foi possível registrar em audit_log:", error instanceof Error ? error.message : error);
  }
}

async function askConfirmation(total: number): Promise<boolean> {
  if (!process.stdin.isTTY) die("--confirm só funciona em um terminal interativo (a confirmação é digitada).");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`\nIsto exclui DEFINITIVAMENTE ${total} chave(s) do Redis (inscrições, participantes, fichas de saúde, usuários e sessões antigos).\nDigite ${CONFIRM_WORD} para continuar: `);
    return answer.trim() === CONFIRM_WORD;
  } finally {
    rl.close();
  }
}

async function main() {
  if (flag("--export") && !exportPath) die("Informe o arquivo: --export <arquivo.json>");
  const redis = getRedis();

  console.log(confirm ? "Modo: EXCLUSÃO (com confirmação)" : "Modo: simulação (nada é alterado)");
  const before = await collect(redis);
  printCounts("Chaves encontradas:", before.byPattern);
  console.log(`\nTotal: ${before.all.length} chave(s). Chaves de rate limit (salt:rl:*) são preservadas.`);

  if (exportPath) {
    const file = assertSafeExportPath(exportPath);
    await exportKeys(redis, before.all, file);
  }

  if (!confirm) {
    console.log(`\nSimulação concluída. Para excluir: npm run cutover:redis -- ${exportPath ? "" : "--export <arquivo> "}--confirm`);
    return;
  }

  if (!before.all.length) {
    console.log("\nNada a excluir (já estava limpo).");
    await recordAudit({ deleted: 0, remaining: 0, patterns: PATTERNS, exported: Boolean(exportPath) });
    return;
  }
  if (!exportPath) console.log("\nAviso: você não pediu --export; os dados excluídos não poderão ser recuperados.");
  if (!(await askConfirmation(before.all.length))) die("Confirmação não digitada. Nada foi excluído.");

  const deleted = await deleteKeys(redis, before.all);
  const after = await collect(redis);
  printCounts("Restantes:", after.byPattern);
  console.log(`\nExcluídas: ${deleted}. Restantes: ${after.all.length}.`);
  await recordAudit({ deleted, remaining: after.all.length, patterns: PATTERNS, exported: Boolean(exportPath) });
  if (after.all.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
