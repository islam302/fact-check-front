export default async function handler(req, res) {
  try {
    const upstream = await fetch("http://62.72.22.223/fact_checker/fact_check/compose_tweet/", {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "nra_ce35c0f17f8ab7e1446eb14af61baf247e17aca000693b4ee4a0984e",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, detail: err.message });
  }
}
