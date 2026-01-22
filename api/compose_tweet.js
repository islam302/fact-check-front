export default async function handler(req, res) {
  try {
    const upstream = await fetch("http://62.72.22.223/fact_checker/fact_check/compose_tweet/", {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "fck_cFOg6H-1gharZEP-a2zKj3HLyKINRscueP12MMFUvpf1FYXL",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, detail: err.message });
  }
}
