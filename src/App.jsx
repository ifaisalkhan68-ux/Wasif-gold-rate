import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShieldCheck, Scale, Award, Gem, Phone, MapPin } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { firebaseConfig } from "./firebaseConfig";

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const ratesRef = ref(db, "rates");

const ADMIN_PASSWORD = "wasif786"; // change this to whatever you like

const SHOP = {
  name: "WASIF JEWELLERS",
  address: "Main Sawari Bazar, Mardan Road",
  phone: "0336 9690333",
};

const TOLA_IN_GRAMS = 11.664;
const LOCAL_CACHE_KEY = "wasif-gold-rates-cache";

const URDU_SLOGAN = "\u062e\u0627\u0644\u0635 \u0633\u0648\u0646\u0627\u060c \u0627\u0639\u062a\u0645\u0627\u062f \u06a9\u06cc \u0636\u0645\u0627\u0646\u062a";

const T = {
  en: {
    heading: "GOLD RATE TODAY",
    perTola: "PER TOLA",
    perGram: "PER GRAM",
    pureGold: "PURE GOLD",
    trusted: "TRUSTED &\nRELIABLE",
    purity: "100% ASSURED\nPURITY",
    bestRate: "BEST RATES\nEVERY DAY",
    updated: "Updated",
    shareWhatsapp: "Share on WhatsApp",
    downloadImage: "Download Poster",
    adminLink: "Shop admin",
    langToggle: "\u0627\u0631\u062f\u0648",
    tagline: "Since trust is measured in karats",
  },
  ur: {
    heading: "\u0622\u062c \u0633\u0648\u0646\u06d2 \u06a9\u0627 \u0631\u06cc\u0679",
    perTola: "\u0641\u06cc \u062a\u0648\u0644\u06c1",
    perGram: "\u0641\u06cc \u06af\u0631\u0627\u0645",
    pureGold: "\u062e\u0627\u0644\u0635 \u0633\u0648\u0646\u0627",
    trusted: "\u0642\u0627\u0628\u0644 \u0627\u0639\u062a\u0645\u0627\u062f",
    purity: "100% \u062e\u0627\u0644\u0635 \u0633\u0648\u0646\u0627",
    bestRate: "\u0628\u06c1\u062a\u0631\u06cc\u0646 \u0631\u06cc\u0679 \u0631\u0648\u0632\u0627\u0646\u06c1",
    updated: "\u062a\u0627\u0632\u06c1 \u06a9\u0627\u0631\u06cc",
    shareWhatsapp: "\u0648\u0627\u0679\u0633 \u0627\u06cc\u067e \u067e\u0631 \u0628\u06be\u06cc\u062c\u06cc\u06ba",
    downloadImage: "\u067e\u0648\u0633\u0679\u0631 \u062f\u0627\u0624\u0646 \u0644\u0648\u0688 \u06a9\u0631\u06cc\u06ba",
    adminLink: "\u0627\u06cc\u0688\u0645\u0646",
    langToggle: "English",
    tagline: "\u0627\u0639\u062a\u0645\u0627\u062f \u0642\u06cc\u0631\u0627\u0637\u0648\u06ba \u0645\u06cc\u06ba \u062a\u0648\u0644\u0627 \u062c\u0627\u062a\u0627 \u06c1\u06d2",
  },
};

function formatNum(n) {
  if (n === "" || n === null || isNaN(n)) return "-";
  return Math.round(n).toLocaleString("en-US");
}

function CornerFlourish({ rotate }) {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      style={{ position: "absolute", transform: `rotate(${rotate}deg)`, opacity: 0.85 }}
    >
      <path d="M2 44 Q2 2 44 2" fill="none" stroke="#caa646" strokeWidth="1.5" />
      <path d="M2 32 Q2 14 20 14" fill="none" stroke="#caa646" strokeWidth="1" />
      <circle cx="44" cy="2" r="3" fill="#e8c96a" />
      <circle cx="20" cy="14" r="1.6" fill="#caa646" />
    </svg>
  );
}

const BADGE_ICONS = [Gem, ShieldCheck, Award, Scale];

export default function App() {
  const [view, setView] = useState("poster");
  const [lang, setLang] = useState("en");
  const [rates, setRates] = useState({ k24: "", k22: "", k21: "", featured: "k24", updatedAt: "" });
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [draft, setDraft] = useState({ k24: "", k22: "", k21: "" });
  const [saveStatus, setSaveStatus] = useState("");
  const [lastError, setLastError] = useState("");
  const [persistOk, setPersistOk] = useState(true);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Load: show cached rate instantly, then subscribe to live cloud updates.
  // onValue fires immediately with the current value AND again any time
  // the rate changes anywhere — so a customer's screen updates in real time.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setRates(parsed);
        setDraft({ k24: parsed.k24, k22: parsed.k22, k21: parsed.k21 });
      }
    } catch (e) {}
    setLoaded(true);

    const unsubscribe = onValue(
      ratesRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setRates(val);
          setDraft({ k24: val.k24, k22: val.k22, k21: val.k21 });
          try {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(val));
          } catch (e) {}
        }
        setPersistOk(true);
      },
      (error) => {
        setPersistOk(false);
        setLastError(error && error.message ? error.message : String(error));
      }
    );
    return () => unsubscribe();
  }, []);

  const t = T[lang];
  const isUr = lang === "ur";
  const todayStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const featuredTola = rates[rates.featured] || "";
  const featuredGram = featuredTola === "" ? "" : Number(featuredTola) / TOLA_IN_GRAMS;

  const saveRates = useCallback(async (newRates) => {
    // Update the live poster immediately — sharing/downloading never waits on the network.
    setRates(newRates);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2500);
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(newRates));
    } catch (e) {}

    try {
      await set(ratesRef, newRates);
      setPersistOk(true);
    } catch (e) {
      setPersistOk(false);
      setLastError(e && e.message ? e.message : String(e));
    }
  }, []);

  const handleSave = () => {
    if (draft.k24 === "" || isNaN(Number(draft.k24))) {
      setSaveStatus("input-error");
      return;
    }
    const newRates = {
      k24: Number(draft.k24),
      k22: draft.k22 === "" ? "" : Number(draft.k22),
      k21: draft.k21 === "" ? "" : Number(draft.k21),
      featured: rates.featured || "k24",
      updatedAt: new Date().toISOString(),
    };
    saveRates(newRates);
  };

  const setFeatured = (key) => {
    saveRates({ ...rates, featured: key });
  };

  const drawCornerFlourish = (ctx, x, y, rotateDeg) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotateDeg * Math.PI) / 180);
    ctx.strokeStyle = "#caa646";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(4, 96);
    ctx.quadraticCurveTo(4, 4, 96, 4);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 70);
    ctx.quadraticCurveTo(4, 30, 44, 30);
    ctx.stroke();
    ctx.fillStyle = "#e8c96a";
    ctx.beginPath();
    ctx.arc(96, 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(44, 30, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawCoinRow = (ctx, cx, y) => {
    const sizes = [14, 18, 22, 26, 32, 26, 22, 18, 14];
    const gap = 30;
    const startX = cx - ((sizes.length - 1) * gap) / 2;
    sizes.forEach((r, i) => {
      const x = startX + i * gap;
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
      grad.addColorStop(0, "#fbe7a8");
      grad.addColorStop(1, "#b8892c");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBadge = (ctx, cx, y, symbol, label) => {
    ctx.save();
    ctx.strokeStyle = "#caa646";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, y, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e8c96a";
    ctx.font = "28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, cx, y + 2);
    ctx.textBaseline = "alphabetic";
    ctx.font = "400 20px Georgia, serif";
    ctx.fillStyle = "#cbb587";
    const lines = label.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, cx, y + 60 + i * 24);
    });
    ctx.restore();
  };

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1780;
    canvas.width = W;
    canvas.height = H;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#241708");
    bg.addColorStop(1, "#0a0704");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // hero image
    const imgH = 460;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      const scale = Math.max(W / img.naturalWidth, imgH / img.naturalHeight);
      const iw = img.naturalWidth * scale;
      const ih = img.naturalHeight * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, imgH);
      ctx.clip();
      ctx.drawImage(img, (W - iw) / 2, (imgH - ih) / 2, iw, ih);
      const fade = ctx.createLinearGradient(0, imgH - 200, 0, imgH);
      fade.addColorStop(0, "rgba(10,7,4,0)");
      fade.addColorStop(1, "rgba(10,7,4,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, imgH - 200, W, 200);
      ctx.restore();
    }

    // heading over the hero image
    ctx.textAlign = "center";
    ctx.font = "700 52px Georgia, serif";
    ctx.fillStyle = "#f2d98a";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 14;
    ctx.fillText(t.heading, W / 2, imgH - 40);
    ctx.shadowBlur = 0;

    // outer gold frame + corner flourishes
    ctx.strokeStyle = "#caa646";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    drawCornerFlourish(ctx, 20, 20, 0);
    ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); drawCornerFlourish(ctx, 20, 20, 0); ctx.restore();
    ctx.save(); ctx.translate(0, H); ctx.scale(1, -1); drawCornerFlourish(ctx, 20, 20, 0); ctx.restore();
    ctx.save(); ctx.translate(W, H); ctx.scale(-1, -1); drawCornerFlourish(ctx, 20, 20, 0); ctx.restore();

    let y = imgH + 50;

    ctx.font = "400 26px Georgia, serif";
    ctx.fillStyle = "#a8926a";
    ctx.fillText(todayStr, W / 2, y);
    y += 60;

    drawCoinRow(ctx, W / 2, y);
    y += 70;

    // rate card
    const cardTop = y;
    const cardH = 340;
    const cardPad = 60;
    const cardGrad = ctx.createLinearGradient(0, cardTop, 0, cardTop + cardH);
    cardGrad.addColorStop(0, "#1d1408");
    cardGrad.addColorStop(1, "#0a0704");
    ctx.fillStyle = cardGrad;
    ctx.fillRect(cardPad, cardTop, W - cardPad * 2, cardH);
    ctx.strokeStyle = "#caa646";
    ctx.lineWidth = 2;
    ctx.strokeRect(cardPad, cardTop, W - cardPad * 2, cardH);
    drawCornerFlourish(ctx, cardPad, cardTop, 0);
    ctx.save(); ctx.translate(W - cardPad, cardTop); ctx.scale(-1, 1); drawCornerFlourish(ctx, 0, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(cardPad, cardTop + cardH); ctx.scale(1, -1); drawCornerFlourish(ctx, 0, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(W - cardPad, cardTop + cardH); ctx.scale(-1, -1); drawCornerFlourish(ctx, 0, 0, 0); ctx.restore();

    const rateGrad = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
    rateGrad.addColorStop(0, "#cf9f3f");
    rateGrad.addColorStop(0.5, "#fff2c4");
    rateGrad.addColorStop(1, "#cf9f3f");
    ctx.fillStyle = rateGrad;
    ctx.font = "700 118px Georgia, serif";
    ctx.fillText(featuredTola === "" ? "\u2014" : "Rs. " + formatNum(featuredTola), W / 2, cardTop + 155);

    ctx.font = "400 30px Georgia, serif";
    ctx.fillStyle = "#a8926a";
    ctx.fillText(t.perTola, W / 2, cardTop + 205);

    ctx.font = "italic 400 34px Georgia, serif";
    ctx.fillStyle = "#cbb587";
    ctx.fillText(
      (featuredGram === "" ? "\u2014" : "Rs. " + formatNum(featuredGram)) + " / " + t.perGram,
      W / 2,
      cardTop + 265
    );

    y = cardTop + cardH + 80;

    ctx.font = "700 62px Georgia, serif";
    ctx.fillStyle = "#e8c96a";
    ctx.fillText(SHOP.name, W / 2, y);
    y += 50;

    ctx.font = "italic 400 30px Georgia, serif";
    ctx.fillStyle = "#a8926a";
    ctx.fillText(t.tagline, W / 2, y);
    y += 55;

    // Urdu slogan — always shown, RTL script
    ctx.direction = "rtl";
    ctx.font = "400 36px 'Noto Nastaliq Urdu', Georgia, serif";
    ctx.fillStyle = "#e6dcc3";
    ctx.fillText(URDU_SLOGAN, W / 2, y);
    ctx.direction = "ltr";
    y += 45;

    ctx.strokeStyle = "#7a5c25";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 220, y);
    ctx.lineTo(W / 2 + 220, y);
    ctx.stroke();
    y += 80;

    // badges row
    const badgeGap = 210;
    const badges = [
      ["\u2666", t.pureGold],
      ["\u2713", t.trusted],
      ["\u2726", t.purity],
      ["\u2696", t.bestRate],
    ];
    const badgeStartX = W / 2 - (badgeGap * (badges.length - 1)) / 2;
    badges.forEach(([symbol, label], i) => {
      drawBadge(ctx, badgeStartX + i * badgeGap, y, symbol, label);
    });
    y += 150;

    ctx.strokeStyle = "#5c451f";
    ctx.lineWidth = 2;
    const phoneBoxW = 460;
    ctx.strokeRect(W / 2 - phoneBoxW / 2, y, phoneBoxW, 70);
    ctx.font = "700 38px Georgia, serif";
    ctx.fillStyle = "#e6dcc3";
    ctx.fillText("PH: " + SHOP.phone, W / 2, y + 46);
    y += 110;

    ctx.font = "400 28px Georgia, serif";
    ctx.fillStyle = "#cbb587";
    ctx.fillText(SHOP.address, W / 2, y);

    return canvas;
  }, [featuredTola, featuredGram, t, todayStr]);

  const shareWhatsapp = () => {
    const text =
      `\ud83d\udcb0 *${t.heading}*\n${todayStr}\n\n` +
      `Rs. ${formatNum(featuredTola)} /${t.perTola.toLowerCase()}\n` +
      `Rs. ${formatNum(featuredGram)} /${t.perGram.toLowerCase()}\n\n` +
      `*${SHOP.name}*\n\ud83d\udccd ${SHOP.address}\n\ud83d\udcde ${SHOP.phone}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadPoster = async () => {
    try {
      await document.fonts.ready;
    } catch (e) {}
    const canvas = drawPoster();
    if (!canvas) return;
    setTimeout(() => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gold-rate-today.png";
        a.click();
        URL.revokeObjectURL(url);
      });
    }, 100);
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#120d08", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8c96a", fontFamily: "Georgia, serif" }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #2a1c0c 0%, #0a0704 65%)",
        fontFamily: isUr ? "'Noto Nastaliq Urdu', serif" : "Georgia, 'Times New Roman', serif",
        color: "#e6dcc3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 12px 60px",
      }}
      dir={isUr ? "rtl" : "ltr"}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Cinzel:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (min-width: 420px) { .badge-grid { grid-template-columns: repeat(4, 1fr); } }
        .rate-shimmer {
          background: linear-gradient(100deg, #cf9f3f 20%, #fff2c4 40%, #f5d878 50%, #cf9f3f 70%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% 0; }
          50% { background-position: 100% 0; }
          100% { background-position: 0% 0; }
        }
        .display-font { font-family: 'Cinzel', Georgia, serif; }
        .script-font { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <img ref={imgRef} src="/necklace.jpg" alt="" style={{ display: "none" }} crossOrigin="anonymous" />

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <button
          onClick={() => setLang(isUr ? "en" : "ur")}
          style={{ background: "transparent", border: "1px solid #7a5c25", color: "#caa646", padding: "6px 14px", borderRadius: 20, fontSize: 14, cursor: "pointer" }}
        >
          {t.langToggle}
        </button>
        <button
          onClick={() => setView(view === "poster" ? "admin" : "poster")}
          style={{ background: "transparent", border: "1px solid #7a5c25", color: "#caa646", padding: "6px 14px", borderRadius: 20, fontSize: 14, cursor: "pointer" }}
        >
          {view === "poster" ? t.adminLink : "\u2190"}
        </button>
      </div>

      {view === "poster" && (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            background: "linear-gradient(180deg, #1a1309 0%, #251a09 100%)",
            border: "2px solid #caa646",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 0 0 8px #0a0704, 0 0 0 10px #4a3418, 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <CornerFlourish rotate={0} />
          <div style={{ position: "absolute", top: 0, right: 0 }}><CornerFlourish rotate={90} /></div>

          <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
            <img
              src="/necklace.jpg"
              alt="Gold necklace"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", filter: "saturate(1.05) contrast(1.05)" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,7,4,0) 40%, rgba(15,10,5,0.75) 78%, #1a1309 100%)" }} />
            <div
              className="display-font"
              style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontSize: 26, letterSpacing: 3, fontWeight: 700, color: "#f2d98a", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
            >
              {t.heading}
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 12, letterSpacing: 2, color: "#a8926a", padding: "10px 0 0" }}>
            {todayStr}
          </div>

          <div style={{ padding: "18px 24px 28px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 9, marginBottom: 20 }}>
              {[14, 18, 22, 26, 32, 26, 22, 18, 14].map((s, i) => (
                <div key={i} style={{ width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fbe7a8, #b8892c 75%)", boxShadow: "0 1px 4px rgba(0,0,0,0.6), inset 0 0 4px rgba(255,255,255,0.3)" }} />
              ))}
            </div>

            <div style={{ position: "relative", background: "radial-gradient(ellipse at 50% 0%, #1d1408 0%, #0a0704 100%)", border: "1px solid #caa646", borderRadius: 8, padding: "26px 14px 22px", marginBottom: 20 }}>
              <div style={{ position: "absolute", top: -1, left: -1 }}><CornerFlourish rotate={0} /></div>
              <div style={{ position: "absolute", top: -1, right: -1 }}><CornerFlourish rotate={90} /></div>
              <div style={{ position: "absolute", bottom: -1, right: -1 }}><CornerFlourish rotate={180} /></div>
              <div style={{ position: "absolute", bottom: -1, left: -1 }}><CornerFlourish rotate={270} /></div>

              <div className="rate-shimmer display-font" style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1 }}>
                {featuredTola === "" ? "\u2014" : "Rs. " + formatNum(featuredTola)}
              </div>
              <div style={{ fontSize: 13, letterSpacing: 4, color: "#a8926a", marginTop: 8 }}>{t.perTola}</div>
              <div className="script-font" style={{ fontSize: 20, color: "#cbb587", marginTop: 10, fontStyle: "italic" }}>
                {featuredGram === "" ? "\u2014" : "Rs. " + formatNum(featuredGram)}{" "}
                <span style={{ fontSize: 13, color: "#a8926a" }}>/ {t.perGram}</span>
              </div>
            </div>

            <div className="display-font" style={{ fontSize: 26, fontWeight: 700, color: "#e8c96a", marginBottom: 4, letterSpacing: 2 }}>
              {SHOP.name}
            </div>
            <div className="script-font" style={{ fontSize: 14, color: "#a8926a", fontStyle: "italic", marginBottom: 6 }}>
              {t.tagline}
            </div>
            <div dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: 17, color: "#e6dcc3", marginBottom: 10 }}>
              {URDU_SLOGAN}
            </div>
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #7a5c25, transparent)", margin: "10px auto 18px", width: "80%" }} />

            <div className="badge-grid" style={{ marginBottom: 20 }}>
              {[t.pureGold, t.trusted, t.purity, t.bestRate].map((label, i) => {
                const Icon = BADGE_ICONS[i];
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #caa646", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(202,166,70,0.08)" }}>
                      <Icon size={18} color="#e8c96a" strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: 10, color: "#cbb587", whiteSpace: "pre-line", lineHeight: 1.3, letterSpacing: 0.5 }}>{label}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ border: "1px solid #5c451f", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 19, fontWeight: 700, color: "#e6dcc3", marginBottom: 10 }}>
              <Phone size={16} color="#caa646" /> {SHOP.phone}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "#cbb587" }}>
              <MapPin size={14} color="#caa646" /> {SHOP.address}
            </div>

            {rates.updatedAt && (
              <div style={{ fontSize: 11, color: "#6e5c3f", marginTop: 18 }}>
                {t.updated}: {new Date(rates.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {view === "poster" && (
        <div style={{ width: "100%", maxWidth: 480, display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={shareWhatsapp} style={{ flex: 1, background: "#1fae5b", color: "white", border: "none", borderRadius: 8, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {t.shareWhatsapp}
          </button>
          <button onClick={downloadPoster} style={{ flex: 1, background: "transparent", color: "#caa646", border: "1px solid #caa646", borderRadius: 8, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {t.downloadImage}
          </button>
        </div>
      )}

      {view === "admin" && !authed && (
        <div style={{ width: "100%", maxWidth: 360, background: "#17110a", border: "1px solid #caa646", borderRadius: 8, padding: 24, marginTop: 20 }}>
          <div style={{ marginBottom: 12, color: "#e8c96a", fontWeight: 700 }}>Admin login</div>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #5c451f", background: "#0c0906", color: "#e6dcc3", marginBottom: 10 }}
          />
          {pwError && <div style={{ color: "#e05a5a", fontSize: 13, marginBottom: 10 }}>{pwError}</div>}
          <button
            onClick={() => {
              if (pwInput === ADMIN_PASSWORD) {
                setAuthed(true);
                setPwError("");
              } else {
                setPwError("Wrong password");
              }
            }}
            style={{ width: "100%", background: "#caa646", color: "#120d08", border: "none", borderRadius: 6, padding: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Login
          </button>
        </div>
      )}

      {view === "admin" && authed && (
        <div style={{ width: "100%", maxWidth: 360, background: "#17110a", border: "1px solid #caa646", borderRadius: 8, padding: 24, marginTop: 20 }}>
          <div style={{ marginBottom: 16, color: "#e8c96a", fontWeight: 700, fontSize: 18 }}>Update today's rates</div>

          {[
            { key: "k24", label: "24K per tola" },
            { key: "k22", label: "22K per tola" },
            { key: "k21", label: "21K per tola" },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#cbb587", display: "block", marginBottom: 4 }}>{f.label}</label>
              <input
                type="text"
                inputMode="numeric"
                value={draft[f.key]}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  setDraft({ ...draft, [f.key]: cleaned });
                  setSaveStatus("");
                }}
                placeholder="e.g. 443000"
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #5c451f", background: "#0c0906", color: "#e6dcc3" }}
              />
              {draft[f.key] !== "" && !isNaN(Number(draft[f.key])) && (
                <div style={{ fontSize: 11, color: "#6e5c3f", marginTop: 3 }}>
                  \u2248 Rs. {formatNum(Number(draft[f.key]) / TOLA_IN_GRAMS)} / gram
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSave}
            style={{ width: "100%", background: "#caa646", color: "#120d08", border: "none", borderRadius: 6, padding: 12, fontWeight: 700, cursor: "pointer", marginTop: 8, marginBottom: 16 }}
          >
            Save rates
          </button>

          {saveStatus === "saved" && (
            <div style={{ color: "#5ac97a", fontSize: 13 }}>Rate updated \u2713 — you can share or download it now.</div>
          )}
          {saveStatus === "input-error" && <div style={{ color: "#e05a5a", fontSize: 13 }}>Enter a valid 24K rate first</div>}
          {!persistOk && (
            <div style={{ color: "#d9b35a", fontSize: 12, marginTop: 6 }}>
              Note: cloud sync failed, so other devices may not see this update yet. Sharing and downloading still work.
              {lastError && <div style={{ color: "#8a6f4f", fontSize: 11, marginTop: 4 }}>({lastError})</div>}
            </div>
          )}

          <div style={{ height: 1, background: "#5c451f", margin: "16px 0" }} />

          <div style={{ fontSize: 13, color: "#cbb587", marginBottom: 8 }}>Which rate shows on the poster?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["k24", "k22", "k21"].map((k) => (
              <button
                key={k}
                onClick={() => setFeatured(k)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: rates.featured === k ? "2px solid #caa646" : "1px solid #5c451f",
                  background: rates.featured === k ? "#2a1f0d" : "transparent",
                  color: "#e6dcc3",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {k.replace("k", "")}K
              </button>
            ))}
          </div>

          <button onClick={() => setAuthed(false)} style={{ width: "100%", background: "transparent", color: "#a8926a", border: "none", padding: 10, marginTop: 16, cursor: "pointer", fontSize: 13 }}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
