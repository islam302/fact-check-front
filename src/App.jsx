import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ======= Config =======
const API_URL = "https://catch-the-thief.onrender.com/fact_check_with_openai/";

// ======= Helpers =======
const urlRegex =
  /((https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;

function toAbsoluteUrl(maybeUrl) {
  if (!/^https?:\/\//i.test(maybeUrl)) return `https://${maybeUrl}`;
  return maybeUrl;
}

function getDomain(u) {
  try {
    const url = new URL(toAbsoluteUrl(u));
    return url.hostname.replace(/^www\./i, "");
  } catch {
    return (u || "").replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./i, "");
  }
}

function faviconUrl(domain) {
  const d = (domain || "").trim();
  if (!d) return "";
  return `https://icons.duckduckgo.com/ip3/${d}.ico`;
}

// ========= New: List-aware renderer (fix numbers mess) =========
const ENUM_LINE = /^\s*([0-9\u0660-\u0669]+)[\.\):\-]\s+(.+)$/; // 1. , 1) , ١. , ١)
function splitIntoBlocks(text) {
  // يقسم النص إلى بلوكات: فقرة عادية أو قائمة مرقّمة متتالية
  const lines = (text || "").split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // تخطّي الأسطر الفارغة المتتالية
    if (!line.trim()) {
      i++;
      continue;
    }

    // لو بداية قائمة مرقّمة
    if (ENUM_LINE.test(line)) {
      const items = [];
      while (i < lines.length && ENUM_LINE.test(lines[i])) {
        const m = lines[i].match(ENUM_LINE);
        items.push(m[2]); // المحتوى بدون الرقم، هنربطه بعدين باللينكات
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // غير ذلك: اجمع لحد سطر فاضي أو لحد قائمة جديدة
    const buff = [];
    while (i < lines.length && lines[i].trim() && !ENUM_LINE.test(lines[i])) {
      buff.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: buff.join(" ") });
  }
  return blocks;
}

// يحوّل نص إلى عناصر React مع أزرار للروابط داخل الفقرات/العناصر
function linkifyText(txt) {
  if (!txt) return null;

  // 1) Markdown links [label](url)
  const md = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let last = 0, m;

  while ((m = md.exec(txt)) !== null) {
    const [full, label, href] = m;
    const start = m.index;
    if (start > last) parts.push(txt.slice(last, start));
    parts.push(<LinkChip key={`md-${start}`} href={href} label={label} />);
    last = start + full.length;
  }
  if (last < txt.length) parts.push(txt.slice(last));

  // 2) Raw URLs
  const out = [];
  parts.forEach((p, idx) => {
    if (typeof p !== "string") { out.push(p); return; }
    let l = 0, hit;
    while ((hit = urlRegex.exec(p)) !== null) {
      const raw = hit[0], s = hit.index;
      if (s > l) out.push(p.slice(l, s));
      out.push(<LinkChip key={`url-${idx}-${s}`} href={toAbsoluteUrl(raw)} />);
      l = s + raw.length;
    }
    if (l < p.length) out.push(p.slice(l));
  });

  return out.map((node, i) => typeof node === "string" ? <span key={`t-${i}`}>{node}</span> : node);
}

function renderTalkSmart(talk) {
  const blocks = splitIntoBlocks(talk || "");
  return blocks.map((b, idx) => {
    if (b.type === "ol") {
      return (
        <ol
          key={`b-${idx}`}
          dir="rtl"
          className="nice-ol ms-4 my-3 grid gap-2"
        >
          {b.items.map((it, j) => (
            <li key={`it-${j}`} className="leading-8 pe-2">
              {linkifyText(it)}
            </li>
          ))}
        </ol>
      );
    }
    // فقرة عادية
    return (
      <p key={`b-${idx}`} className="leading-8 my-2">
        {linkifyText(b.text)}
      </p>
    );
  });
}

// ======= Component =======
export default function AINeonFactChecker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleCheck() {
    setErr("");
    setResult(null);
    const q = query.trim();
    if (!q) {
      setErr("اكتب الادعاء أولًا.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "تعذر الحصول على النتيجة");

      setResult({
        case: data.case || "غير متوفر",
        talk: data.talk || "لا يوجد تفسير.",
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (e) {
      setErr(e.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result) return;
    const text =
      `الحالة: ${result.case}\n\n` +
      `التحليل: ${result.talk}\n\n` +
      `المصادر:\n` +
      (result.sources?.length
        ? result.sources.map((s) => `- ${s.title || getDomain(s?.url)} — ${s.url}`).join("\n")
        : "- لا يوجد");
    navigator.clipboard.writeText(text);
  }

  const renderedTalk = useMemo(() => renderTalkSmart(result?.talk || ""), [result?.talk]);

  return (
    <div dir="rtl" className="min-h-screen relative overflow-hidden bg-[#05070e] text-white">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(88,101,242,0.18),_transparent_60%)] animate-slow-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(24,182,155,0.18),_transparent_60%)] animate-slow-pulse delay-300" />
      </div>

      {/* AI orb / character */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto pt-10 flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-teal-300 shadow-[0_0_40px_rgba(99,102,241,.7)] animate-orb-float" />
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/5 backdrop-blur-[2px] ring-2 ring-white/10" />
          <div className="absolute -inset-2 rounded-full animate-spin-slow border-2 border-dashed border-white/10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
          التحقق من الأخبار
        </h1>
        <p className="text-white/70 text-sm md:text-base text-center max-w-2xl">
          أدخل الادعاء، وسنبحث ونحلل ونرجّع لك <span className="text-teal-300">الحالة</span>،
          <span className="text-indigo-300"> التحليل</span>، و
          <span className="text-fuchsia-300"> المصادر</span>
        </p>
      </motion.div>

      {/* Main card */}
      <div className="relative z-10 mx-auto mt-8 w-full max-w-3xl p-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-teal-500/30">
        <div className="rounded-2xl bg-[#0a0f1c]/70 backdrop-blur-xl p-5 sm:p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
          {/* Input */}
          <div className="flex flex-col gap-3">
            <label className="text-sm text-white/70">اكتب عنوان الخبر المراد التحقق منه</label>
            <textarea
              className="min-h-[120px] rounded-xl bg-[#0b1327] border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,.08)]"
              placeholder=""
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCheck}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-bold disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(99,102,241,.35)]"
              >
                {loading ? "⏳ جاري التحقق…" : "✅ تحقق الآن"}
              </button>

              {result && (
                <button
                  onClick={copyAll}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition font-semibold"
                >
                  نسخ النتيجة
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 text-red-300 bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-2"
              >
                {err}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loader */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
                <ManufacturingLoader />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mt-6 grid gap-5"
              >
                {/* Case */}
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-600/90 to-teal-500/80 shadow-[0_10px_40px_rgba(16,185,129,.35)]">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <NeonDot color="rgba(16,185,129,1)" />
                      <h3 className="text-xl font-extrabold">الحالة</h3>
                    </div>
                    <Badge>{result.case}</Badge>
                  </div>
                </div>

                {/* Talk */}
                <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <NeonDot color="rgba(99,102,241,1)" />
                    <h3 className="text-xl font-extrabold">التحليل</h3>
                  </div>
                  <div className="prose prose-invert max-w-none leading-8">
                    {renderedTalk}
                  </div>
                </div>

                {/* Sources */}
                <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <NeonDot color="rgba(56,189,248,1)" />
                    <h3 className="text-xl font-extrabold">المصادر</h3>
                  </div>

                  {result.sources?.length ? (
                    <ul className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                      {result.sources.map((s, i) => (
                        <li key={i}>
                          <LinkChip href={s?.url} label={s?.title} big />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/60">لا توجد مصادر متاحة.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Local styles for animations + ordered list */}
      <style>{`
        .animate-slow-pulse { animation: slowPulse 7s ease-in-out infinite; }
        .animate-orb-float { animation: orbFloat 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spinSlow 14s linear infinite; }
        @keyframes slowPulse { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes orbFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes spinSlow { to { transform: rotate(360deg); } }

        /* Ordered list بترقيم عربي أنيق */
        .nice-ol {
          list-style: none;
          counter-reset: item;
          padding-inline-start: 0;
        }
        .nice-ol > li {
          counter-increment: item;
          position: relative;
          padding-right: 2.2em; /* مسافة الرقم */
        }
        .nice-ol > li::before {
          content: counter(item, arabic-indic) "‎. ";
          /* arabic-indic يعمل على معظم المتصفحات الحديثة */
          position: absolute;
          right: 0;
          top: 0;
          font-weight: 800;
          color: #7dd3fc; /* سماوي لطيف */
        }
      `}</style>
    </div>
  );
}

/* ----------------- Small UI atoms ----------------- */
function NeonDot({ color = "rgba(99,102,241,1)" }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 18px ${color}` }}
    />
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-white/15 backdrop-blur-[2px]">
      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
      <span className="text-sm font-semibold">{children}</span>
    </span>
  );
}

function LinkChip({ href, label, big = false }) {
  if (!href) return null;
  const abs = toAbsoluteUrl(href);
  const domain = getDomain(abs);
  const text = label?.trim() || domain;

  return (
    <a
      href={abs}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b1327]/40 hover:bg-[#0b1327]/60 transition px-3 py-2 shadow-[0_0_12px_rgba(56,189,248,.12)] ${big ? "w-full" : ""}`}
      title={text}
    >
      <img
        src={faviconUrl(domain)}
        alt=""
        className={`${big ? "w-6 h-6" : "w-4.5 h-4.5"} rounded`}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <span className={`truncate ${big ? "text-[15px] font-semibold" : "text-sm"}`}>
        {text}
      </span>
      <span className="ms-auto text-sky-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
        ↗
      </span>
    </a>
  );
}

// لودر “تصنيع/خط إنتاج”
function ManufacturingLoader() {
  return (
    <div className="rounded-2xl p-5 bg-[#0b1327]/50 border border-white/10 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <NeonDot color="rgba(56,189,248,1)" />
        <p className="text-white/80">محرك الذكاء الاصطناعي يعمل… تجميع الأدلة، مطابقة الحقائق، وتكوين الحكم.</p>
      </div>
      <div className="relative h-12 overflow-hidden rounded-lg bg-white/[.03] border border-white/10">
        <div className="absolute inset-0 flex items-center">
          <Conveyor />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <CodeBar />
        <CodeBar delay="0.35s" />
      </div>
    </div>
  );
}

function Conveyor() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="mx-2 h-3 w-12 rounded bg-gradient-to-r from-indigo-400/40 to-fuchsia-400/40 animate-move-right"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      <style>{`
        .animate-move-right { animation: moveRight 1.8s linear infinite; }
        @keyframes moveRight {
          0% { transform: translateX(-120%); opacity: .6; }
          50% { opacity: 1; }
          100% { transform: translateX(120%); opacity: .6; }
        }
      `}</style>
    </div>
  );
}

function CodeBar({ delay = "0s" }) {
  return (
    <div className="relative h-24 rounded-lg p-3 bg-black/20 border border-white/10 overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(transparent 70%, rgba(255,255,255,.04) 0%)", backgroundSize: "100% 20px" }} />
      <div className="space-y-2 animate-code-flow" style={{ animationDelay: delay }}>
        <div className="h-2.5 rounded bg-white/20 w-3/4" />
        <div className="h-2.5 rounded bg-white/15 w-1/2" />
        <div className="h-2.5 rounded bg-white/20 w-5/6" />
        <div className="h-2.5 rounded bg-white/15 w-2/3" />
      </div>
      <style>{`
        .animate-code-flow { animation: codeFlow 1.6s ease-in-out infinite; }
        @keyframes codeFlow {
          0%,100% { transform: translateY(0px); opacity: .9; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
