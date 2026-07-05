const defaultData = {
  companies: [
    { id: "co1", name: "Sierra Fishing Company", whatsapp: "23276000000", active: "yes" },
    { id: "co2", name: "Sierra Sea Food Processing", whatsapp: "23276000000", active: "yes" }
  ],
  customers: [],
  products: [],
  analytics: []
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.DB) return json({ error: "D1 binding DB is missing" }, 500);

  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)"
  ).run();

  if (url.pathname === "/api/data" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT value FROM app_state WHERE key = ?").bind("main").first();
    if (!row) return json(defaultData);
    try { return json(JSON.parse(row.value)); }
    catch (e) { return json(defaultData); }
  }

  if (url.pathname === "/api/data" && request.method === "POST") {
    const body = await request.json();
    await env.DB.prepare(
      "INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP"
    ).bind("main", JSON.stringify(body)).run();
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}