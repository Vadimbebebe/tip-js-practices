const API_URL = process.env.API_URL || "http://127.0.0.1:5505/api";

async function main() {
  const r = await fetch(`${API_URL}/health`);
  console.log("status:", r.status);
  console.log("ok:", r.ok);
  console.log("content-type:", r.headers.get("content-type"));
  console.log("body:", await r.json());
}

main().catch(console.error);