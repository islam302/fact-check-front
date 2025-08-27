import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const API_BASE = "https://catch-the-thief.onrender.com/get_the_thief";
const POLL_INTERVAL_MS = 30_000; // أول استعلام بعد 30s
const MAX_ATTEMPTS = 3;          // 3 محاولات فقط

export default function App() {
  const [text, setText] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mdSafe, setMdSafe] = useState(true); // لو حصل خطأ أثناء Markdown
  const timerRef = useRef(null);

  useEffect(() => () => clearTimer(), []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // فك ترميزات HTML الشائعة وتنضيف ** لو عايز نص نظيف
  function clean(text) {
    if (typeof text !== "string") return "";
    return text
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\*\*/g, ""); // شيل ** لو مش عايز bold Markdown
  }

  async function startFactCheck() {
    setError(null);
    setResult(null);
    setMdSafe(true);
    setAttempt(0);
    setTaskId(null);

    const claim = text.trim();
    if (!claim) return setError("اكتب الادعاء أولًا.");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/fact-check/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: claim }),  // ← تم حذف version و mode
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "فشل بدء المهمة.");
      if (!data?.task_id) throw new Error("لم يتم استلام task_id من الخادم.");

      setTaskId(data.task_id);
      timerRef.current = setTimeout(() => pollStatus(data.task_id, 1), POLL_INTERVAL_MS);
    } catch (e) {
      setError(e.message || "حدث خطأ.");
      setLoading(false);
    }
  }

  async function pollStatus(id, nextAttempt) {
    try {
      const res = await fetch(`${API_BASE}/fact-check-status/${id}/`);
      const data = await res.json();

      // نجاح حتى لو مفيش status="SUCCESS"
      const isSuccess =
        data?.status === "SUCCESS" ||
        data?.overall_assessment ||
        data?.classification ||
        (data?.ok && data?.data?.overall_assessment);

      if (isSuccess) {
        const assessmentRaw =
          data?.overall_assessment ||
          data?.data?.overall_assessment ||
          "تم التحقق ✅";

        setResult(clean(assessmentRaw));
        setLoading(false);
        clearTimer();
        return;
      }

      if (nextAttempt > MAX_ATTEMPTS) {
        setLoading(false);
        setError("انتهت المحاولات دون الحصول على نتيجة. جرّب لاحقًا.");
        clearTimer();
        return;
      }

      setAttempt(nextAttempt);
      timerRef.current = setTimeout(
        () => pollStatus(id, nextAttempt + 1),
        POLL_INTERVAL_MS
      );
    } catch {
      if (nextAttempt > MAX_ATTEMPTS) {
        setLoading(false);
        setError("تعذر الاتصال بالخادم.");
        clearTimer();
        return;
      }
      setAttempt(nextAttempt);
      timerRef.current = setTimeout(
        () => pollStatus(id, nextAttempt + 1),
        POLL_INTERVAL_MS
      );
    }
  }

  function cancelPolling() {
    clearTimer();
    setLoading(false);
    setTaskId(null);
  }

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(result);
  }

  return (
    <div dir="rtl" className="min-h-screen font-sans text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-2xl backdrop-card shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold mb-2">أداة التحقق من الأخبار</h1>
        <p className="opacity-80 text-sm mb-4">
          اكتب الادعاء المراد التحقق منه وسيتم التحليل والرجوع إليك بالنتيجة.
        </p>

        <textarea
          className="w-full min-h-36 rounded-xl bg-[#091227] border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="مثال: الرئيس الأمريكي التقى برئيس الصين في قمة المناخ."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={startFactCheck}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-sky-400 hover:brightness-110 font-bold disabled:opacity-50 shadow-[0_0_24px_rgba(56,189,248,.35)]"
          >
            {loading ? "جاري التحقق…" : "ابدأ التحقق"}
          </button>

          {loading && (
            <button
              onClick={cancelPolling}
              className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600"
            >
              إلغاء
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-300 bg-red-900/25 border border-red-800/40 rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-[#0b1630] border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sky-400">النتيجة</h3>
              <button
                onClick={copyResult}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
              >
                نسخ
              </button>
            </div>

            {/* نحاول نعرض Markdown؛ لو حصل خطأ نرجع لنص عادي */}
            <pre className="whitespace-pre-wrap text-sm leading-7">{result}</pre>

          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Boundary بسيط لاكتشاف أخطاء ReactMarkdown بدون ما ينهار التطبيق */
function ErrorCatcher({ onError, children }) {
  try {
    return children;
  } catch (e) {
    onError?.(e);
    return null;
  }
}
