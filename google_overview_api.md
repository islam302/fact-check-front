# API — الواجهة الأمامية

ثلاث نقاط نهاية: **(1) التحقّق**، **(2) إنشاء الخبر**، **(3) إنشاء التغريدة**.
الترميز UTF-8. الرد بلغة النص المُرسَل.

---

## 1) التحقّق من الخبر

```
POST /fact_check/google_overview_api/
Content-Type: application/json
```

**Request**
```json
{ "query": "ألمانيا تودع المونديال بخسارة أمام باراغواي" }
```

**Response 200**
```json
{
  "ok": true,
  "query": "...",
  "case": "حقيقي",
  "talk": "التحليل...",
  "sources": [ { "title": "...", "url": "https://...", "snippet": "..." } ]
}
```

| الحقل | الوصف |
|---|---|
| `case` | الحالة: `حقيقي` / `غير مؤكد` / `غير صحيح` (بلغة الاستعلام). |
| `talk` | التحليل. |
| `sources` | حتى 6 مصادر `{ title, url, snippet }`. |

> استخدم `case` + `talk` + `sources` في نداءي الخبر/التغريدة أدناه.

---

## 2) إنشاء الخبر

```
POST /fact_check/compose_news/
Content-Type: application/json
```

**Request** (مرّر نتيجة التحقّق)
```json
{
  "claim_text": "ألمانيا تودع المونديال بخسارة أمام باراغواي",
  "case": "حقيقي",
  "talk": "التحليل...",
  "sources": [ { "title": "...", "url": "...", "snippet": "..." } ]
}
```

**Response 200**
```json
{ "ok": true, "news_article": "نص المقال الخبري..." }
```

---

## 3) إنشاء التغريدة

```
POST /fact_check/compose_tweet/
Content-Type: application/json
```

**Request** (نفس جسم إنشاء الخبر)
```json
{
  "claim_text": "ألمانيا تودع المونديال بخسارة أمام باراغواي",
  "case": "حقيقي",
  "talk": "التحليل...",
  "sources": [ { "title": "...", "url": "...", "snippet": "..." } ]
}
```

**Response 200**
```json
{ "ok": true, "x_tweet": "نص التغريدة... #هاشتاغ" }
```