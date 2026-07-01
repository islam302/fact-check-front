export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, detail: "Method not allowed" });
  }

  try {
    const upstream = await fetch("https://una-ai-tools-apis.una-oic.org/auth-api/api/auth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, detail: err.message });
  }
}
