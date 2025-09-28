import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageToggle } from "./components/LanguageToggle";
import unaLogoDark from "./assets/unalogo-dark.png";
import unaLogoLight from "./assets/unalogo-light.png";

// ======= Config =======
const API_URL = "https://fact-check-api-32dx.onrender.com/fact_check/";

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
function AINeonFactChecker() {
  const { isDark } = useTheme();
  const { isArabic } = useLanguage();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [generateNews, setGenerateNews] = useState(false);
  const [generateTweet, setGenerateTweet] = useState(false);

  async function handleCheck() {
    setErr("");
    setResult(null);
    const q = query.trim();
    if (!q) {
      setErr(isArabic ? "اكتب الخبر أولًا." : "Please enter the news first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: q,
          generate_news: generateNews,
          generate_tweet: generateTweet
        }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || (isArabic ? "تعذر الحصول على النتيجة" : "Failed to get result"));

      setResult({
        case: data.case || "غير متوفر",
        talk: data.talk || "لا يوجد تفسير.",
        sources: Array.isArray(data.sources) ? data.sources : [],
        news_article: data.news_article || null,
        x_tweet: data.x_tweet || null,
      });
    } catch (e) {
      setErr(e.message || (isArabic ? "حدث خطأ غير متوقع." : "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result) return;
    let text =
      `${isArabic ? "الحالة" : "Status"}: ${result.case}\n\n` +
      `${isArabic ? "التحليل" : "Analysis"}: ${result.talk}\n\n` +
      `${isArabic ? "المصادر" : "Sources"}:\n` +
      (result.sources?.length
        ? result.sources.map((s) => `- ${s.title || getDomain(s?.url)} — ${s.url}`).join("\n")
        : `- ${isArabic ? "لا يوجد" : "None"}`);
    
    if (result.news_article) {
      text += `\n\n${isArabic ? "خبر مصاغ" : "Generated News Article"}:\n${result.news_article}`;
    }
    
    if (result.x_tweet) {
      text += `\n\n${isArabic ? "تويتة مصاغة" : "Generated Tweet"}:\n${result.x_tweet}`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      const originalText = isArabic ? "نسخ النتيجة" : "Copy Result";
      const button = document.querySelector('[aria-label*="نسخ"]') || document.querySelector('[aria-label*="Copy"]');
      if (button) {
        const originalContent = button.textContent;
        button.textContent = isArabic ? "تم النسخ!" : "Copied!";
        button.style.background = isDark ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #10b981, #059669)';
        setTimeout(() => {
          button.textContent = originalContent;
          button.style.background = '';
        }, 2000);
      }
    });
  }

  const renderedTalk = useMemo(() => renderTalkSmart(result?.talk || ""), [result?.talk]);

  return (
    <div dir="rtl" className={`min-h-screen relative overflow-hidden transition-colors duration-500 px-3 sm:px-0 ${
      isDark 
        ? 'bg-[#05070e] text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800'
    }`}>
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        {isDark ? (
          <>
        <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(88,101,242,0.18),_transparent_60%)] animate-slow-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(24,182,155,0.18),_transparent_60%)] animate-slow-pulse delay-300" />
          </>
        ) : (
          <>
            <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15),_transparent_60%)] animate-slow-pulse" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15),_transparent_60%)] animate-slow-pulse delay-300" />
          </>
        )}
      </div>

      {/* Theme and Language Toggles */}
      <div
        className="absolute z-20 flex sm:flex-col flex-row gap-2 sm:gap-4 top-2 left-2 sm:top-6 sm:left-6 scale-75 sm:scale-100"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.25rem)' }}
      >
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* AI orb / character */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto pt-16 sm:pt-10 flex flex-col items-center gap-4"
      >
        <img
          src={isDark ? unaLogoDark : unaLogoLight}
          alt={isArabic ? "شعار الجامعة" : "University Logo"}
          className="h-16 sm:h-18 md:h-20 lg:h-24 max-w-[80vw] mb-4 object-contain select-none"
          draggable="false"
        />
        <div className="relative">
          {/* Energy field lines */}
          <div className="absolute inset-0 w-20 h-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={`line-${i}`}
                className={`absolute w-px h-8 animate-energy-line ${
                  isDark ? 'bg-gradient-to-b from-indigo-400/60 to-transparent' : 'bg-gradient-to-b from-blue-400/60 to-transparent'
                }`}
                style={{
                  left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 35}px`,
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 35}px`,
                  transform: `rotate(${i * 60}deg)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.2}s`
                }}
              />
            ))}
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 w-20 h-20">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full animate-float-particle ${
                  isDark ? 'bg-white/60' : 'bg-blue-400/60'
                }`}
                style={{
                  left: `${20 + Math.cos(i * 30 * Math.PI / 180) * (25 + Math.sin(i) * 10)}px`,
                  top: `${20 + Math.sin(i * 30 * Math.PI / 180) * (25 + Math.sin(i) * 10)}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${3 + i * 0.2}s`
                }}
              />
            ))}
          </div>

          {/* Outer glow rings */}
          <div className={`absolute -inset-6 rounded-full animate-pulse-glow ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-teal-500/20'
              : 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'
          }`} />
          <div className={`absolute -inset-4 rounded-full animate-pulse-glow-delayed ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-400/15 via-fuchsia-400/15 to-teal-400/15'
              : 'bg-gradient-to-r from-blue-400/15 via-purple-400/15 to-pink-400/15'
          }`} />

          {/* Main orb with enhanced gradient */}
          <div className={`relative w-20 h-20 rounded-full animate-orb-float ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-teal-300 shadow-[0_0_60px_rgba(99,102,241,.8),0_0_120px_rgba(168,85,247,.4)]'
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_60px_rgba(59,130,246,.8),0_0_120px_rgba(168,85,247,.4)]'
          }`}>
            {/* Dynamic light sweep */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className={`absolute inset-0 rounded-full animate-light-sweep ${
                isDark 
                  ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
              }`} />
            </div>
            
            {/* Inner shine effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
            
            {/* Core glow with pulse */}
            <div className={`absolute inset-4 rounded-full animate-core-pulse ${
              isDark 
                ? 'bg-gradient-to-br from-white/10 to-transparent'
                : 'bg-gradient-to-br from-white/30 to-transparent'
            }`} />
            
            {/* Central energy core */}
            <div className={`absolute inset-6 rounded-full ${
              isDark 
                ? 'bg-gradient-to-br from-white/15 to-transparent'
                : 'bg-gradient-to-br from-white/25 to-transparent'
            }`} />
          </div>

          {/* Rotating outer ring */}
          <div className={`absolute -inset-3 rounded-full animate-spin-slow border-2 border-dashed ${
            isDark ? 'border-white/20' : 'border-white/30'
          }`} />
          
          {/* Inner rotating ring */}
          <div className={`absolute -inset-1 rounded-full animate-spin-reverse border border-dashed ${
            isDark ? 'border-white/15' : 'border-white/25'
          }`} />

          {/* Data stream rings */}
          <div className="absolute -inset-8 w-36 h-36">
            {[...Array(3)].map((_, i) => (
              <div
                key={`stream-${i}`}
                className={`absolute rounded-full border border-dashed animate-data-stream ${
                  isDark ? 'border-white/10' : 'border-slate-300/30'
                }`}
                style={{
                  width: `${80 + i * 20}px`,
                  height: `${80 + i * 20}px`,
                  left: `${18 - i * 10}px`,
                  top: `${18 - i * 10}px`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${8 + i * 2}s`
                }}
              />
            ))}
          </div>

          {/* Holographic overlay */}
          <div className={`absolute inset-0 w-20 h-20 rounded-full backdrop-blur-[1px] ${
            isDark ? 'bg-white/5' : 'bg-white/20'
          }`} style={{
            background: isDark 
              ? 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)'
              : 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
          }} />
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center">
          {isArabic ? "التحقق من الأخبار" : "Fact Checker"}
        </h1>
        <p className={`text-xs sm:text-sm md:text-base text-center max-w-[90vw] sm:max-w-xl md:max-w-2xl ${
          isDark ? 'text-white/70' : 'text-slate-600'
        }`}>
          {isArabic ? (
            <>
              أدخل الخبر، وسنبحث ونحلل ونرجّع لك <span className={isDark ? 'text-teal-300' : 'text-emerald-600'}>الحالة</span>،
              <span className={isDark ? 'text-indigo-300' : 'text-blue-600'}> التحليل</span>، و
              <span className={isDark ? 'text-fuchsia-300' : 'text-purple-600'}> المصادر</span>
            </>
          ) : (
            <>
              Enter your claim, and we'll search, analyze, and return the <span className={isDark ? 'text-teal-300' : 'text-emerald-600'}>status</span>,
              <span className={isDark ? 'text-indigo-300' : 'text-blue-600'}> analysis</span>, and
              <span className={isDark ? 'text-fuchsia-300' : 'text-purple-600'}> sources</span>
            </>
          )}
        </p>
      </motion.div>

      {/* Main card */}
      <div className={`relative z-10 mx-auto mt-6 sm:mt-8 w-full max-w-3xl p-1 rounded-2xl ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-teal-500/30'
          : 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'
      }`}>
        <div className={`rounded-2xl backdrop-blur-xl p-4 sm:p-6 ${
          isDark 
            ? 'bg-[#0a0f1c]/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]'
            : 'bg-white/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]'
        }`}>
          {/* Input */}
          <div className="flex flex-col gap-3">
            <label className={`text-sm ${
              isDark ? 'text-white/70' : 'text-slate-600'
            }`}>
              {isArabic ? "اكتب عنوان الخبر المراد التحقق منه" : "Enter the news headline to fact-check"}
            </label>
            <textarea
              className={`min-h-[100px] sm:min-h-[120px] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 transition-colors resize-none ${
                isDark 
                  ? 'bg-[#0b1327] border border-white/20 focus:ring-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,.08)] text-white placeholder-white/60'
                  : 'bg-white border border-slate-300 focus:ring-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,.08)] text-slate-800 placeholder-slate-500'
              }`}
              placeholder={isArabic ? "مثال: الرئيس الأمريكي أعلن عن قرار جديد..." : "Example: The US President announced a new decision..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleCheck();
                }
              }}
              aria-label={isArabic ? "مربع إدخال النص للتحقق من الخبر" : "Text input for fact-checking"}
              aria-describedby="input-help"
            />
            {/* Generation Options */}
            <div className="flex flex-wrap gap-3 mb-3">
              {/* News Article chip */}
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateNews}
                  onChange={(e) => setGenerateNews(e.target.checked)}
                  className="sr-only"
                  aria-label={isArabic ? 'تفعيل صياغة خبر' : 'Toggle generate news article'}
                />
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isDark 
                      ? (generateNews
                          ? 'bg-emerald-600/20 border-emerald-400/40 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,.25)]'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10')
                      : (generateNews
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-[0_0_14px_rgba(16,185,129,.15)]'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={isDark ? 'text-emerald-300' : 'text-emerald-600'}>
                    <path d="M19 3H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3V5a2 2 0 0 0-2-2Zm-3 4h3v2h-3V7Zm-8 0h6v2H8V7Zm0 4h11v2H8v-2Zm0 4h11v2H8v-2ZM5 9h1v8a1 1 0 0 1-1-1V9Z"/>
                  </svg>
                  <span>{isArabic ? 'صياغة خبر' : 'Generate News Article'}</span>
                </span>
              </label>

              {/* X/Tweet chip */}
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateTweet}
                  onChange={(e) => setGenerateTweet(e.target.checked)}
                  className="sr-only"
                  aria-label={isArabic ? 'تفعيل صياغة تويتة' : 'Toggle generate tweet'}
                />
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isDark 
                      ? (generateTweet
                          ? 'bg-blue-600/20 border-sky-400/40 text-sky-200 shadow-[0_0_18px_rgba(59,130,246,.25)]'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10')
                      : (generateTweet
                          ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-[0_0_14px_rgba(59,130,246,.15)]'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={isDark ? 'text-sky-300' : 'text-blue-600'}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>{isArabic ? 'صياغة تويتة' : 'Generate Tweet'}</span>
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <motion.button
                onClick={handleCheck}
                disabled={loading}
                className={`relative px-5 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold sm:font-bold text-base sm:text-lg overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-4 focus:ring-indigo-400/50 ${
                  isDark 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_20px_40px_rgba(99,102,241,.4)]'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_20px_40px_rgba(59,130,246,.4)]'
                }`}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: isDark 
                    ? '0_25px_50px_rgba(99,102,241,.6)' 
                    : '0_25px_50px_rgba(59,130,246,.6)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                aria-label={isArabic ? "زر التحقق من الخبر" : "Fact check button"}
                tabIndex={0}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  isDark 
                    ? 'from-indigo-600 via-purple-600 to-pink-600'
                    : 'from-blue-600 via-purple-600 to-pink-600'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        className="relative w-5 h-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {/* Outer spinning ring */}
                        <motion.div
                          className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Inner pulsing dot */}
                        <motion.div
                          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                        />
                      </motion.div>
                      <motion.span
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {isArabic ? "جاري التحقق…" : "Checking..."}
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        ✅
                      </motion.span>
                      <span>{isArabic ? "تحقق الآن" : "Check Now"}</span>
                    </>
                  )}
                </span>
                
                {/* Glow effect */}
                <div className={`absolute -inset-1 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'
                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
                }`} />
              </motion.button>

              {result && (
                <motion.button
                  onClick={copyAll}
                  className={`px-5 py-2.5 rounded-xl transition font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/15 border border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isArabic ? "نسخ نتيجة التحقق" : "Copy verification result"}
                  tabIndex={0}
                >
                  {isArabic ? "نسخ النتيجة" : "Copy Result"}
                </motion.button>
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
                className={`mt-4 rounded-xl px-4 py-3 ${
                  isDark 
                    ? 'text-red-200 bg-red-900/30 border border-red-800/50'
                    : 'text-red-700 bg-red-100 border border-red-300'
                }`}
                role="alert"
                aria-live="polite"
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
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-8 grid gap-6"
              >
                {/* Case */}
                <motion.div 
                  className={`rounded-2xl p-6 sm:p-7 ${
                    isDark 
                      ? 'bg-gradient-to-br from-emerald-600/90 to-teal-500/80 shadow-[0_15px_50px_rgba(16,185,129,.4)]'
                      : 'bg-gradient-to-br from-emerald-500/90 to-teal-400/80 shadow-[0_15px_50px_rgba(16,185,129,.3)]'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <NeonDot color="rgba(16,185,129,1)" />
                      <h3 className="text-2xl font-extrabold">{isArabic ? "الحالة" : "Status"}</h3>
                    </div>
                    <Badge>{result.case}</Badge>
                  </div>
                </motion.div>

                {/* Talk */}
                <motion.div 
                  className={`rounded-2xl p-6 sm:p-7 ${
                    isDark 
                      ? 'bg-white/8 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.2)]'
                      : 'bg-white/70 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,.1)]'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <NeonDot color="rgba(99,102,241,1)" />
                    <h3 className="text-2xl font-extrabold">{isArabic ? "التحليل" : "Analysis"}</h3>
                  </div>
                  <div className={`prose max-w-none leading-8 text-base ${
                    isDark ? 'prose-invert' : 'prose-slate'
                  }`}>
                    {renderedTalk}
                  </div>
                </motion.div>

                {/* Sources */}
                <motion.div 
                  className={`rounded-2xl p-6 sm:p-7 ${
                    isDark 
                      ? 'bg-white/8 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.2)]'
                      : 'bg-white/70 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,.1)]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <NeonDot color="rgba(56,189,248,1)" />
                    <h3 className="text-2xl font-extrabold">{isArabic ? "المصادر" : "Sources"}</h3>
                  </div>

                  {result.sources?.length ? (
                    <ul className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      {result.sources.map((s, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <LinkChip href={s?.url} label={s?.title} big />
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <motion.p 
                      className={`text-center py-8 ${isDark ? 'text-white/60' : 'text-slate-500'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {isArabic ? "لا توجد مصادر متاحة." : "No sources available."}
                    </motion.p>
                  )}
                </motion.div>

                {/* Generated News Article */}
                {result.news_article && (
                  <motion.div 
                    className={`rounded-2xl p-6 sm:p-7 ${
                      isDark 
                        ? 'bg-white/8 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.2)]'
                        : 'bg-white/70 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,.1)]'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <NeonDot color="rgba(34,197,94,1)" />
                        <h3 className="text-2xl font-extrabold">{isArabic ? "خبر مصاغ" : "Generated News Article"}</h3>
                      </div>
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText(result.news_article).then(() => {
                            const button = event.target;
                            const originalText = button.textContent;
                            button.textContent = isArabic ? "تم النسخ! ✓" : "Copied! ✓";
                            button.style.background = isDark ? 'linear-gradient(135deg, #10b981, #059669, #047857)' : 'linear-gradient(135deg, #10b981, #059669, #047857)';
                            setTimeout(() => {
                              button.textContent = originalText;
                              button.style.background = '';
                            }, 2000);
                          });
                        }}
                        className={`relative overflow-hidden group px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white shadow-[0_8px_32px_rgba(16,185,129,.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,.6)]'
                            : 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 text-white shadow-[0_8px_32px_rgba(16,185,129,.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,.5)]'
                        }`}
                        whileHover={{ 
                          scale: 1.05,
                          rotateX: 5,
                          y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={isArabic ? "نسخ الخبر المصاغ" : "Copy generated news article"}
                      >
                        {/* Animated background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isDark 
                            ? 'from-emerald-500 via-green-400 to-teal-400'
                            : 'from-emerald-400 via-green-300 to-teal-300'
                        }`} />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        
                        {/* Newspaper icon and text */}
                        <span className="relative z-10 flex items-center gap-2">
                          <motion.svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-white"
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              repeatDelay: 3 
                            }}
                            aria-hidden="true"
                          >
                            <path d="M19 3H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3V5a2 2 0 0 0-2-2Zm-3 4h3v2h-3V7Zm-8 0h6v2H8V7Zm0 4h11v2H8v-2Zm0 4h11v2H8v-2ZM5 9h1v8a1 1 0 0 1-1-1V9Z"/>
                          </motion.svg>
                          <span>{isArabic ? "نسخ الخبر" : "Create Article"}</span>
                        </span>
                        
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400'
                            : 'bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300'
                        }`} />
                        
                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white/60 rounded-full"
                              style={{
                                left: `${20 + i * 25}%`,
                                top: `${30 + i * 15}%`,
                              }}
                              animate={{
                                y: [-5, -15, -5],
                                opacity: [0, 1, 0],
                                scale: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                repeatDelay: 1
                              }}
                            />
                          ))}
                        </div>
                      </motion.button>
                    </div>
                    <div className={`rounded-xl p-6 border-2 ${
                      isDark 
                        ? 'bg-[#0a0a0a] border-white/20' 
                        : 'bg-[#f8fafc] border-slate-200'
                    }`}>
                      <div className={`prose max-w-none leading-8 text-base whitespace-pre-line ${
                        isDark ? 'prose-invert' : 'prose-slate'
                      }`}>
                        {result.news_article}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Generated Tweet */}
                {result.x_tweet && (
                  <motion.div 
                    className={`rounded-2xl p-6 sm:p-7 ${
                      isDark 
                        ? 'bg-white/8 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.2)]'
                        : 'bg-white/70 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,.1)]'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <NeonDot color="rgba(59,130,246,1)" />
                        <h3 className="text-2xl font-extrabold">{isArabic ? "تويتة مصاغة" : "Generated Tweet"}</h3>
                      </div>
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText(result.x_tweet).then(() => {
                            const button = event.target;
                            const originalText = button.textContent;
                            button.textContent = isArabic ? "تم النسخ! ✓" : "Copied! ✓";
                            button.style.background = isDark ? 'linear-gradient(135deg, #1da1f2, #0d8bd9, #0570de)' : 'linear-gradient(135deg, #1da1f2, #0d8bd9, #0570de)';
                            setTimeout(() => {
                              button.textContent = originalText;
                              button.style.background = '';
                            }, 2000);
                          });
                        }}
                        className={`relative overflow-hidden group px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white shadow-[0_8px_32px_rgba(29,161,242,.4)] hover:shadow-[0_12px_40px_rgba(29,161,242,.6)]'
                            : 'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 text-white shadow-[0_8px_32px_rgba(29,161,242,.3)] hover:shadow-[0_12px_40px_rgba(29,161,242,.5)]'
                        }`}
                        whileHover={{ 
                          scale: 1.05,
                          rotateX: -5,
                          y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={isArabic ? "نسخ التويته المصاغة" : "Copy generated tweet"}
                      >
                        {/* Animated background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isDark 
                            ? 'from-blue-500 via-sky-400 to-cyan-400'
                            : 'from-blue-400 via-sky-300 to-cyan-300'
                        }`} />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -top-2 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        
                        {/* X/Twitter icon and text */}
                        <span className="relative z-10 flex items-center gap-2">
                          <motion.svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-white"
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              repeatDelay: 3 
                            }}
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </motion.svg>
                          <span>{isArabic ? "نسخ التويته" : "X Tweet"}</span>
                        </span>
                        
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400'
                            : 'bg-gradient-to-r from-blue-300 via-sky-300 to-cyan-300'
                        }`} />
                        
                        {/* Flying tweet particles */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute text-xs opacity-60"
                              style={{
                                left: `${15 + i * 20}%`,
                                top: `${25 + i * 10}%`,
                              }}
                              animate={{
                                x: [0, 10, 0],
                                y: [-3, -12, -3],
                                opacity: [0, 0.8, 0],
                                scale: [0.3, 0.8, 0.3]
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: i * 0.4,
                                repeatDelay: 2
                              }}
                            >
                              {i % 2 === 0 ? '💬' : '🔄'}
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Pulsing border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 rounded-2xl border-2 border-white/10 animate-pulse" />
                        </div>
                      </motion.button>
                    </div>
                    <div className={`rounded-xl p-4 border-2 ${
                      isDark 
                        ? 'bg-[#0a0a0a] border-white/20' 
                        : 'bg-[#f8fafc] border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full ${
                          isDark ? 'bg-blue-500' : 'bg-blue-400'
                        } flex items-center justify-center text-white font-bold`}>
                          F
                        </div>
                        <div>
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isArabic ? 'متحقق من الأخبار' : 'Fact Checker'}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                            @factchecker
                          </div>
                        </div>
                      </div>
                      <div className={`text-base leading-relaxed ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {result.x_tweet}
                      </div>
                    </div>
                  </motion.div>
                )}
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
        .animate-spin-reverse { animation: spinReverse 12s linear infinite; }
        .animate-pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .animate-pulse-glow-delayed { animation: pulseGlow 4s ease-in-out infinite 1s; }
        .animate-float-particle { animation: floatParticle 3s ease-in-out infinite; }
        .animate-energy-line { animation: energyLine 2s ease-in-out infinite; }
        .animate-light-sweep { animation: lightSweep 3s ease-in-out infinite; }
        .animate-core-pulse { animation: corePulse 2s ease-in-out infinite; }
        .animate-data-stream { animation: dataStream 8s linear infinite; }
        
        @keyframes slowPulse { 
          0%, 100% { transform: scale(1); opacity: .9; } 
          50% { transform: scale(1.08); opacity: 1; } 
        }
        @keyframes orbFloat { 
          0%, 100% { transform: translateY(0px) scale(1); } 
          50% { transform: translateY(-10px) scale(1.05); } 
        }
        @keyframes spinSlow { 
          to { transform: rotate(360deg); } 
        }
        @keyframes spinReverse { 
          to { transform: rotate(-360deg); } 
        }
        @keyframes pulseGlow { 
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3; 
            filter: blur(8px);
          } 
          50% { 
            transform: scale(1.2); 
            opacity: 0.6; 
            filter: blur(12px);
          } 
        }
        @keyframes floatParticle { 
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
            opacity: 0.6; 
          } 
          25% { 
            transform: translateY(-15px) translateX(5px) scale(1.2); 
            opacity: 1; 
          } 
          50% { 
            transform: translateY(-25px) translateX(-5px) scale(0.8); 
            opacity: 0.8; 
          } 
          75% { 
            transform: translateY(-10px) translateX(8px) scale(1.1); 
            opacity: 0.9; 
          } 
        }
        @keyframes energyLine { 
          0%, 100% { 
            transform: scaleY(0.3) rotate(var(--rotation, 0deg)); 
            opacity: 0.3; 
          } 
          50% { 
            transform: scaleY(1.2) rotate(var(--rotation, 0deg)); 
            opacity: 0.8; 
          } 
        }
        @keyframes lightSweep { 
          0% { 
            transform: translateX(-100%) rotate(0deg); 
            opacity: 0; 
          } 
          50% { 
            opacity: 1; 
          } 
          100% { 
            transform: translateX(100%) rotate(180deg); 
            opacity: 0; 
          } 
        }
        @keyframes corePulse { 
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          } 
          50% { 
            transform: scale(1.1); 
            opacity: 1; 
          } 
        }
        @keyframes dataStream { 
          0% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.3; 
          } 
          25% { 
            opacity: 0.6; 
          } 
          50% { 
            transform: rotate(180deg) scale(1.05); 
            opacity: 0.4; 
          } 
          75% { 
            opacity: 0.7; 
          } 
          100% { 
            transform: rotate(360deg) scale(1); 
            opacity: 0.3; 
          } 
        }

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
  const { isDark } = useTheme();
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-[2px] ${
      isDark 
        ? 'bg-black/25 border border-white/15'
        : 'bg-white/80 border border-slate-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        isDark ? 'bg-white/70' : 'bg-slate-600'
      }`} />
      <span className="text-sm font-semibold">{children}</span>
    </span>
  );
}

function LinkChip({ href, label, big = false }) {
  const { isDark } = useTheme();
  if (!href) return null;
  const abs = toAbsoluteUrl(href);
  const domain = getDomain(abs);
  const text = label?.trim() || domain;

  return (
    <a
      href={abs}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-xl transition px-3 py-2 ${big ? "w-full" : ""} ${
        isDark 
          ? 'border border-white/10 bg-[#0b1327]/40 hover:bg-[#0b1327]/60 shadow-[0_0_12px_rgba(56,189,248,.12)]'
          : 'border border-slate-200 bg-white/60 hover:bg-white/80 shadow-[0_0_12px_rgba(59,130,246,.12)]'
      }`}
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
      <span className={`ms-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition ${
        isDark ? 'text-sky-300' : 'text-blue-500'
      }`}>
        ↗
      </span>
    </a>
  );
}


function ManufacturingLoader() {
  const { isDark } = useTheme();
  const { isArabic } = useLanguage();

  return (
    <div
      className={`rounded-2xl p-5 overflow-hidden ${
        isDark
          ? "bg-[#0b1327]/50 border border-white/10"
          : "bg-white/60 border border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <NeonDot color="rgba(56,189,248,1)" />
        <p className={isDark ? "text-white/80" : "text-slate-600"}>
          {isArabic
            ? "محرك الذكاء الاصطناعي يعمل… تجميع الأدلة، مطابقة الحقائق، وتكوين الحكم."
            : "AI engine is working… gathering evidence, matching facts, and forming the verdict."}
        </p>
      </div>
      <div
        className={`relative h-12 overflow-hidden rounded-lg border ${
          isDark
            ? "bg-white/[.03] border-white/10"
            : "bg-slate-100 border-slate-200"
        }`}
      >
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
  const { isDark } = useTheme();
  return (
    <div className={`relative h-24 rounded-lg p-3 overflow-hidden ${
      isDark 
        ? 'bg-black/20 border border-white/10'
        : 'bg-slate-100 border border-slate-200'
    }`}>
      <div className={`absolute inset-0 opacity-20`} style={{ 
        backgroundImage: isDark 
          ? "linear-gradient(transparent 70%, rgba(255,255,255,.04) 0%)" 
          : "linear-gradient(transparent 70%, rgba(0,0,0,.04) 0%)", 
        backgroundSize: "100% 20px" 
      }} />
      <div className="space-y-2 animate-code-flow" style={{ animationDelay: delay }}>
        <div className={`h-2.5 rounded w-3/4 ${
          isDark ? 'bg-white/20' : 'bg-slate-300'
        }`} />
        <div className={`h-2.5 rounded w-1/2 ${
          isDark ? 'bg-white/15' : 'bg-slate-200'
        }`} />
        <div className={`h-2.5 rounded w-5/6 ${
          isDark ? 'bg-white/20' : 'bg-slate-300'
        }`} />
        <div className={`h-2.5 rounded w-2/3 ${
          isDark ? 'bg-white/15' : 'bg-slate-200'
        }`} />
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

// Main App component with ThemeProvider and LanguageProvider
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AINeonFactChecker />
      </LanguageProvider>
    </ThemeProvider>
  );
}