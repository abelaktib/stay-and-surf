/**
 * Limiteur de débit en mémoire (fenêtre glissante par clé).
 *
 * Sur Vercel, chaque instance serverless a sa propre mémoire : la limite est donc
 * approximative (une par instance) mais suffit à freiner un script qui bloquerait
 * toutes les dates en ouvrant des paiements en boucle. Pour une limite stricte et
 * partagée, brancher Vercel KV / Upstash Redis à la place de `hits`.
 */
export function createLimiter({ limit, windowMs, max = 5000 }) {
  const hits = new Map();
  return function check(key, now = Date.now()) {
    const since = now - windowMs;
    const list = (hits.get(key) || []).filter((t) => t > since);
    if (list.length >= limit) {
      hits.set(key, list);
      return { ok: false, retryAfter: Math.ceil((list[0] + windowMs - now) / 1000) };
    }
    list.push(now);
    hits.set(key, list);
    // Évite une croissance illimitée de la mémoire
    if (hits.size > max) hits.delete(hits.keys().next().value);
    return { ok: true, remaining: limit - list.length };
  };
}

/** Adresse IP du client derrière le proxy Vercel */
export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "local").trim();
}
