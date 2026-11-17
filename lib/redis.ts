import { Redis } from "@upstash/redis";

/**
 * O Redis só serve ao rate limit e ao bloqueio de login. Se ele estiver fora do ar, cada comando
 * com o retry padrão (5 tentativas, ~4 s) deixaria o login e as inscrições lentos; aqui uma nova
 * tentativa curta absorve um soluço de rede e o restante falha rápido (o rate limit "deixa passar").
 */
export const redis = Redis.fromEnv({
  retry: { retries: 1, backoff: () => 150 },
});
