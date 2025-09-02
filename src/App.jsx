// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import ReactMarkdown from "react-markdown";
//
// const API_BASE = "https://catch-the-thief.onrender.com/get_the_thief";
// const POLL_INTERVAL_MS = 30_000; // أول استعلام بعد 30s
// const MAX_ATTEMPTS = 3;          // 3 محاولات فقط
//
// export default function App() {
//   const [text, setText] = useState("");
//   const [taskId, setTaskId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [attempt, setAttempt] = useState(0);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [mdSafe, setMdSafe] = useState(true); // لو حصل خطأ أثناء Markdown
//   const timerRef = useRef(null);
//
//   useEffect(() => () => clearTimer(), []);
//
//   function clearTimer() {
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//   }
//
//   // فك ترميزات HTML الشائعة وتنضيف ** لو عايز نص نظيف
//   function clean(text) {
//     if (typeof text !== "string") return "";
//     return text
//       .replace(/&quot;/g, '"')
//       .replace(/&amp;/g, "&")
//       .replace(/&lt;/g, "<")
//       .replace(/&gt;/g, ">")
//       .replace(/\*\*/g, ""); // شيل ** لو مش عايز bold Markdown
//   }
//
//   async function startFactCheck() {
//     setError(null);
//     setResult(null);
//     setMdSafe(true);
//     setAttempt(0);
//     setTaskId(null);
//
//     const claim = text.trim();
//     if (!claim) return setError("اكتب الادعاء أولًا.");
//
//     setLoading(true);
//
//     try {
//       const res = await fetch(`${API_BASE}/fact-check/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: claim }),  // ← تم حذف version و mode
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "فشل بدء المهمة.");
//       if (!data?.task_id) throw new Error("لم يتم استلام task_id من الخادم.");
//
//       setTaskId(data.task_id);
//       timerRef.current = setTimeout(() => pollStatus(data.task_id, 1), POLL_INTERVAL_MS);
//     } catch (e) {
//       setError(e.message || "حدث خطأ.");
//       setLoading(false);
//     }
//   }
//
//   async function pollStatus(id, nextAttempt) {
//     try {
//       const res = await fetch(`${API_BASE}/fact-check-status/${id}/`);
//       const data = await res.json();
//
//       // نجاح حتى لو مفيش status="SUCCESS"
//       const isSuccess =
//         data?.status === "SUCCESS" ||
//         data?.overall_assessment ||
//         data?.classification ||
//         (data?.ok && data?.data?.overall_assessment);
//
//       if (isSuccess) {
//         const assessmentRaw =
//           data?.overall_assessment ||
//           data?.data?.overall_assessment ||
//           "تم التحقق ✅";
//
//         setResult(clean(assessmentRaw));
//         setLoading(false);
//         clearTimer();
//         return;
//       }
//
//       if (nextAttempt > MAX_ATTEMPTS) {
//         setLoading(false);
//         setError("انتهت المحاولات دون الحصول على نتيجة. جرّب لاحقًا.");
//         clearTimer();
//         return;
//       }
//
//       setAttempt(nextAttempt);
//       timerRef.current = setTimeout(
//         () => pollStatus(id, nextAttempt + 1),
//         POLL_INTERVAL_MS
//       );
//     } catch {
//       if (nextAttempt > MAX_ATTEMPTS) {
//         setLoading(false);
//         setError("تعذر الاتصال بالخادم.");
//         clearTimer();
//         return;
//       }
//       setAttempt(nextAttempt);
//       timerRef.current = setTimeout(
//         () => pollStatus(id, nextAttempt + 1),
//         POLL_INTERVAL_MS
//       );
//     }
//   }
//
//   function cancelPolling() {
//     clearTimer();
//     setLoading(false);
//     setTaskId(null);
//   }
//
//   function copyResult() {
//     if (!result) return;
//     navigator.clipboard.writeText(result);
//   }
//
//   return (
//     <div dir="rtl" className="min-h-screen font-sans text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-3xl rounded-2xl backdrop-card shadow-lg p-6 sm:p-8">
//         <h1 className="text-2xl font-extrabold mb-2">أداة التحقق من الأخبار</h1>
//         <p className="opacity-80 text-sm mb-4">
//           اكتب الادعاء المراد التحقق منه وسيتم التحليل والرجوع إليك بالنتيجة.
//         </p>
//
//         <textarea
//           className="w-full min-h-36 rounded-xl bg-[#091227] border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
//           placeholder="مثال: الرئيس الأمريكي التقى برئيس الصين في قمة المناخ."
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />
//
//         <div className="mt-4 flex flex-wrap items-center gap-3">
//           <button
//             onClick={startFactCheck}
//             disabled={loading}
//             className="px-5 py-2.5 rounded-xl bg-sky-400 hover:brightness-110 font-bold disabled:opacity-50 shadow-[0_0_24px_rgba(56,189,248,.35)]"
//           >
//             {loading ? "جاري التحقق…" : "ابدأ التحقق"}
//           </button>
//
//           {loading && (
//             <button
//               onClick={cancelPolling}
//               className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600"
//             >
//               إلغاء
//             </button>
//           )}
//         </div>
//
//         {error && (
//           <div className="mt-4 text-red-300 bg-red-900/25 border border-red-800/40 rounded-xl px-4 py-2">
//             {error}
//           </div>
//         )}
//
//         {result && (
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-6 p-4 rounded-xl bg-[#0b1630] border border-white/10"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="font-bold text-sky-400">النتيجة</h3>
//               <button
//                 onClick={copyResult}
//                 className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
//               >
//                 نسخ
//               </button>
//             </div>
//
//             {/* نحاول نعرض Markdown؛ لو حصل خطأ نرجع لنص عادي */}
//             <pre className="whitespace-pre-wrap text-sm leading-7">{result}</pre>
//
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }
//
// /** Boundary بسيط لاكتشاف أخطاء ReactMarkdown بدون ما ينهار التطبيق */
// function ErrorCatcher({ onError, children }) {
//   try {
//     return children;
//   } catch (e) {
//     onError?.(e);
//     return null;
//   }
// }



import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ======= Config =======
const API_URL = "https://catch-the-thief.onrender.com/fact_check/";

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
      if (!data?.ok) {
        throw new Error(data?.error || "تعذر الحصول على النتيجة");
      }

      // Expecting: { ok, case, talk, sources[] }
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
      result.sources.map((s, i) => `- ${s.title} — ${s.url}`).join("\n");
    navigator.clipboard.writeText(text);
  }

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
          {/* AI spark ring */}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center gap-3 text-white/80"
              >
                <Spinner />
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
                  <p className="text-white/85 leading-8">{result.talk}</p>
                </div>

                {/* Sources */}
                <div className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <NeonDot color="rgba(56,189,248,1)" />
                    <h3 className="text-xl font-extrabold">المصادر</h3>
                  </div>

                  {result.sources?.length ? (
                    <ul className="grid gap-3">
                      {result.sources.map((s, i) => (
                        <li
                          key={i}
                          className="group rounded-xl border border-white/10 bg-[#0b1327]/40 hover:bg-[#0b1327]/55 transition overflow-hidden"
                        >
                          <a
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={s.url}
                            title={s.title}
                          >
                            <span className="text-[15px] text-white/90 line-clamp-2">
                              {s.title}
                            </span>
                            <span className="shrink-0 text-sky-300 group-hover:translate-x-0.5 transition">
                              افتح ↗
                            </span>
                          </a>
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

      {/* Local styles for animations */}
      <style>{`
        .animate-slow-pulse { animation: slowPulse 7s ease-in-out infinite; }
        .animate-orb-float { animation: orbFloat 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spinSlow 14s linear infinite; }
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); opacity: .9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ----------------- Small UI atoms ----------------- */
function Spinner() {
  return (
    <div className="relative w-5 h-5">
      <div className="absolute inset-0 rounded-full border-2 border-white/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
    </div>
  );
}

function NeonDot({ color = "rgba(99,102,241,1)" }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 18px ${color}`,
      }}
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
