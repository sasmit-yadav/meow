import { useEffect, useRef, useState } from "react";
import "./App.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SunIcon() {
  return (
    <svg className="edge-weather" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.2" fill="#f5c518" />
      <g stroke="#f5c518" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 3.2v1.8M12 19v1.8M4.8 12H3M21 12h-1.8M6.2 6.2l1.3 1.3M16.5 16.5l1.3 1.3M17.8 6.2l-1.3 1.3M7.5 16.5l-1.3 1.3" />
      </g>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="edge-play" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="11" rx="3" fill="#3a96dd" />
      <circle cx="8.2" cy="12.5" r="1.2" fill="#1b1f27" />
      <circle cx="15.8" cy="12.5" r="1.2" fill="#1b1f27" />
      <path d="M9.5 7.2 8 4.6M14.5 7.2 16 4.6" stroke="#3a96dd" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function weatherLabel(code) {
  if (code == null || code === 0) return "Sunny";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  return "Thunderstorms";
}

function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

const HERO_SLIDES = [
  {
    title: "Bengal man arrested in Bengaluru for terror links, police say probe underway",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    source: "NDTV 24x7",
    domain: "ndtv.com",
  },
  {
    title: "I Tested ChatGPT, Gemini, Grok, and Copilot. Here's the Best AI for...",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    source: "NDTV 24x7",
    domain: "ndtv.com",
  },
  {
    title: "India's monsoon covers more states as rainfall picks up this week",
    image: "https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=1400&q=80",
    source: "NDTV 24x7",
    domain: "ndtv.com",
  },
];

const SIDE_STORY = {
  title: "Breaking | Vijay's big Independence Day speech sparks political debate",
  image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  source: "News18",
  domain: "news18.com",
};

const FEED = [
  {
    title: "India marks Independence Day with parades, flypasts and new honours",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=900&q=80",
    source: "The Hindu",
    domain: "thehindu.com",
    kind: "wide",
  },
  {
    title: "Sensex, Nifty end mixed as banks weigh on Dalal Street",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    source: "Economic Times",
    domain: "economictimes.indiatimes.com",
  },
  {
    title: "Delhi-NCR sees brief showers; IMD keeps rain watch for weekend",
    image: "https://images.unsplash.com/photo-1438449805896-28a666819a20?auto=format&fit=crop&w=800&q=80",
    source: "Hindustan Times",
    domain: "hindustantimes.com",
  },
  {
    title: "ISRO outlines next steps after latest satellite launch from Sriharikota",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    source: "India Today",
    domain: "indiatoday.in",
    kind: "overlay",
  },
  {
    title: "UPI transactions hit a fresh high as festive spend picks up",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    source: "Moneycontrol",
    domain: "moneycontrol.com",
  },
  {
    title: "Kohli, Rohit in focus as India squad talk gathers pace",
    image: "https://images.unsplash.com/photo-1531415074968-047ec82320ca?auto=format&fit=crop&w=800&q=80",
    source: "ESPNcricinfo",
    domain: "espncricinfo.com",
  },
  {
    title: "New iPhone rumours: what to expect from Apple's September event",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    source: "Times of India",
    domain: "timesofindia.indiatimes.com",
  },
  {
    title: "Rupee steadies against the dollar after a volatile session",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80",
    source: "Reuters",
    domain: "reuters.com",
  },
  {
    title: "Bollywood weekend: new releases and box office race",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    source: "News18",
    domain: "news18.com",
    kind: "wide overlay",
  },
  {
    title: "Noida Metro expansion: more stations, tighter last-mile links",
    image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=800&q=80",
    source: "NDTV",
    domain: "ndtv.com",
  },
  {
    title: "NEET counselling dates out; students rush to lock choices",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    source: "Indian Express",
    domain: "indianexpress.com",
  },
  {
    title: "Global markets: oil slips as traders watch US data",
    image: "https://images.unsplash.com/photo-1526304640178-9de66c0d662d?auto=format&fit=crop&w=800&q=80",
    source: "BBC News",
    domain: "bbc.com",
  },
  {
    title: "Heat and humidity linger across north India, say forecasters",
    image: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80",
    source: "The Tribune",
    domain: "tribuneindia.com",
  },
  {
    title: "Startups raise fresh capital as AI tools go mainstream at work",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    source: "Livemint",
    domain: "livemint.com",
  },
  {
    title: "Traffic advisory issued for Independence Day events in Delhi",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    source: "ANI",
    domain: "aninews.in",
  },
  {
    title: "Football: Indian Super League clubs step up pre-season drills",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    source: "Sportskeeda",
    domain: "sportskeeda.com",
  },
  {
    title: "Climate report flags faster glacier melt in the Himalayas",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    source: "The Hindu",
    domain: "thehindu.com",
    kind: "wide",
  },
  {
    title: "Microsoft Edge adds Copilot tweaks in the latest update",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    source: "Microsoft",
    domain: "microsoft.com",
  },
];

const MORE_FEED = [
  {
    title: "Gold holds near record as investors look for a safe haven",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    source: "Business Standard",
    domain: "business-standard.com",
  },
  {
    title: "Mumbai local trains see festive rush; extra services planned",
    image: "https://images.unsplash.com/photo-1569163139394-de44099b0be2?auto=format&fit=crop&w=800&q=80",
    source: "Mid-Day",
    domain: "mid-day.com",
  },
  {
    title: "F1: drivers and teams preview the next race weekend",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
    source: "Autosport",
    domain: "autosport.com",
  },
  {
    title: "Health: doctors share monsoon care tips as viral cases rise",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    source: "NDTV",
    domain: "ndtv.com",
  },
  {
    title: "Real estate: Noida, Greater Noida housing demand stays firm",
    image: "https://images.unsplash.com/photo-1486406149826-c6d0254d14b4?auto=format&fit=crop&w=800&q=80",
    source: "Housing.com",
    domain: "housing.com",
    kind: "wide",
  },
  {
    title: "Streaming this week: new shows landing on Netflix and Prime",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80",
    source: "Filmfare",
    domain: "filmfare.com",
  },
  {
    title: "Cybersecurity: banks warn customers about festive-season scams",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    source: "Times of India",
    domain: "timesofindia.indiatimes.com",
  },
  {
    title: "Education: CBSE schools share new session guidelines",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    source: "India Today",
    domain: "indiatoday.in",
  },
];

function NewsCard({ item }) {
  const overlay = (item.kind || "").includes("overlay");
  const wide = (item.kind || "").includes("wide");
  if (overlay) {
    return (
      <article
        className={`edge-card overlay${wide ? " wide" : ""}`}
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <p>{item.title}</p>
        <div className="edge-source">
          <img src={favicon(item.domain)} alt="" />
          {item.source}
        </div>
      </article>
    );
  }
  return (
    <article className={`edge-card${wide ? " wide" : ""}`}>
      <div className="edge-card-img" style={{ backgroundImage: `url(${item.image})` }} />
      <div className="edge-card-body">
        <p>{item.title}</p>
        <div className="edge-source static">
          <img src={favicon(item.domain)} alt="" />
          {item.source}
        </div>
      </div>
    </article>
  );
}

async function solveToClipboard(notes, message, image) {
  const payload = JSON.stringify({ notes, message, image });
  let lastDetail = "Server busy. Wait a few seconds and try again.";
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000 + attempt * 1500));
    }
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    if (!res.ok) {
      let detail = lastDetail;
      try {
        const data = await res.json();
        detail = data.error || detail;
      } catch {
        const text = await res.text();
        if (text && !text.includes("{")) detail = text;
      }
      if (/rate_limit|groq|invalid_request/i.test(detail) || detail.includes('{"error"')) {
        detail = lastDetail;
      }
      lastDetail = detail;
      if (res.status === 503 || res.status === 429) continue;
      throw new Error(lastDetail);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    if (result.trim()) await navigator.clipboard.writeText(result);
    return result;
  }
  throw new Error(lastDetail);
}

async function fileToJpegDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  let width = bitmap.width;
  let height = bitmap.height;
  if (width > max || height > max) {
    const scale = max / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  if (typeof bitmap.close === "function") bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function imageFromClipboardEvent(event) {
  const items = event.clipboardData?.items;
  if (!items) return "";
  const item = Array.from(items).find((entry) => entry.type.startsWith("image/"));
  if (!item) return "";
  event.preventDefault();
  const file = item.getAsFile();
  if (!file) return "";
  return fileToJpegDataUrl(file);
}

const SAFARI_FAVES = [
  { name: "Apple", domain: "apple.com", color: "#555" },
  { name: "iCloud", domain: "icloud.com", color: "#3693f3" },
  { name: "YouTube", domain: "youtube.com", color: "#ff0000" },
  { name: "Wikipedia", domain: "wikipedia.org", color: "#333" },
  { name: "Google", domain: "google.com", color: "#4285f4" },
  { name: "GitHub", domain: "github.com", color: "#24292f" },
  { name: "X", domain: "x.com", color: "#111" },
  { name: "Netflix", domain: "netflix.com", color: "#e50914" },
];

const SAFARI_FREQ = [
  { name: "Apple", domain: "apple.com", path: "apple.com" },
  { name: "iCloud", domain: "icloud.com", path: "icloud.com" },
  { name: "YouTube", domain: "youtube.com", path: "youtube.com" },
  { name: "Wikipedia", domain: "wikipedia.org", path: "en.wikipedia.org" },
];

const SAFARI_READ = [
  { title: "Apple Intelligence comes to Mac", site: "apple.com" },
  { title: "How Safari protects your browsing", site: "support.apple.com" },
  { title: "iCloud+ Privacy features", site: "icloud.com" },
];

function SafariStart({ notes, lastAnswer, seed }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const ghostRef = useRef(null);

  useEffect(() => {
    ghostRef.current?.focus();
    const clipSeed = typeof seed === "string" ? seed.trim() : "";
    if (clipSeed && clipSeed !== lastAnswer.trim()) {
      setQuery(clipSeed);
      return;
    }
    navigator.clipboard
      .readText()
      .then((text) => {
        const clip = text.trim();
        if (clip && clip !== lastAnswer.trim()) setQuery(clip);
      })
      .catch(() => {});
  }, [lastAnswer, seed]);

  async function run(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await solveToClipboard(notes, text);
      setQuery("");
    } catch {
      setQuery(text);
    } finally {
      setBusy(false);
      ghostRef.current?.focus();
    }
  }

  useEffect(() => {
    async function onPaste(event) {
      const image = await imageFromClipboardEvent(event);
      if (!image || busy) return;
      setBusy(true);
      try {
        await solveToClipboard(notes, query.trim(), image);
        setQuery("");
      } catch {
        setQuery(query);
      } finally {
        setBusy(false);
        ghostRef.current?.focus();
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [busy, notes, query]);

  return (
    <div className="safari">
      <div className="safari-chrome">
        <div className="safari-lights">
          <i className="close" />
          <i className="min" />
          <i className="max" />
        </div>
        <svg className="safari-tool" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M9 5v14" />
        </svg>
        <svg className="safari-tool dim" viewBox="0 0 24 24">
          <path d="M14 6l-6 6 6 6" />
        </svg>
        <svg className="safari-tool dim" viewBox="0 0 24 24">
          <path d="M10 6l6 6-6 6" />
        </svg>
        <form className="safari-omnibox" onSubmit={run}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l4 4" />
          </svg>
          <div className="safari-omnibox-field">
            <span>Search or enter website name</span>
            <textarea
              ref={ghostRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  run(event);
                }
              }}
              autoComplete="off"
              spellCheck={false}
              rows={1}
              disabled={busy}
            />
          </div>
        </form>
        <svg className="safari-tool" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 5v2.2M12 16.8V19M5 12h2.2M16.8 12H19M7.1 7.1l1.6 1.6M15.3 15.3l1.6 1.6M7.1 16.9l1.6-1.6M15.3 8.7l1.6-1.6" />
        </svg>
        <svg className="safari-tool" viewBox="0 0 24 24">
          <path d="M12 7v10M7 12h10" />
        </svg>
        <svg className="safari-tool" viewBox="0 0 24 24">
          <rect x="5" y="6" width="6" height="5" rx="1" />
          <rect x="13" y="6" width="6" height="5" rx="1" />
          <rect x="5" y="13" width="6" height="5" rx="1" />
          <rect x="13" y="13" width="6" height="5" rx="1" />
        </svg>
      </div>
      <div className="safari-tabs">
        <div className="safari-tab on">
          Start Page
          <b>×</b>
        </div>
        <span className="safari-tab-add">+</span>
      </div>
      <div className="safari-page" onClick={() => ghostRef.current?.focus()}>
        <div className="safari-bg" />
        <div className="safari-content">
          <h2>Favorites</h2>
          <div className="safari-faves">
            {SAFARI_FAVES.map((item) => (
              <div className="safari-fave" key={item.domain}>
                <div className="safari-fave-icon" style={{ background: item.color }}>
                  <img src={favicon(item.domain)} alt="" />
                </div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <h2>Frequently Visited</h2>
          <div className="safari-freq">
            {SAFARI_FREQ.map((item) => (
              <div className="safari-freq-card" key={item.domain}>
                <div className="safari-freq-top">
                  <img src={favicon(item.domain)} alt="" />
                  <span>{item.path}</span>
                </div>
                <p>{item.name}</p>
              </div>
            ))}
          </div>
          <div className="safari-row">
            <div className="safari-privacy">
              <strong>Privacy Report</strong>
              <em>87</em>
              <p>In the last seven days, Safari has prevented 87 trackers from profiling you.</p>
            </div>
            <div className="safari-read">
              <strong>Reading List</strong>
              {SAFARI_READ.map((item) => (
                <div className="safari-read-item" key={item.title}>
                  <img src={favicon(item.site)} alt="" />
                  <div>
                    <p>{item.title}</p>
                    <span>{item.site}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button type="button" className="safari-edit">
          <svg viewBox="0 0 24 24">
            <path d="M4 7h11M4 12h16M4 17h8" />
            <circle cx="18" cy="7" r="2" />
            <circle cx="10" cy="17" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PdfIcon({ d, fill = false }) {
  return (
    <svg viewBox="0 0 24 24">
      <path d={d} fill={fill ? "currentColor" : "none"} />
    </svg>
  );
}

function PdfThumb({ page, active, onClick, children }) {
  return (
    <button type="button" className={`pdf-thumb${active ? " on" : ""}`} onClick={onClick}>
      <div className="pdf-thumb-page">{children}</div>
      <span>{page}</span>
    </button>
  );
}

function PdfSearch({ notes, lastAnswer }) {
  const [ghost, setGhost] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const ghostRef = useRef(null);
  const page1Ref = useRef(null);
  const page2Ref = useRef(null);

  useEffect(() => {
    ghostRef.current?.focus();
    navigator.clipboard
      .readText()
      .then((text) => {
        const clip = text.trim();
        if (clip && clip !== lastAnswer.trim()) setGhost(clip);
      })
      .catch(() => {});
  }, [lastAnswer]);

  async function run(event) {
    event.preventDefault();
    const text = ghost.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await solveToClipboard(notes, text);
      setGhost("");
    } catch {
      setGhost(text);
    } finally {
      setBusy(false);
      ghostRef.current?.focus();
    }
  }

  useEffect(() => {
    async function onPaste(event) {
      const image = await imageFromClipboardEvent(event);
      if (!image || busy) return;
      setBusy(true);
      try {
        await solveToClipboard(notes, ghost.trim(), image);
        setGhost("");
      } catch {
        setGhost(ghost);
      } finally {
        setBusy(false);
        ghostRef.current?.focus();
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [busy, notes, ghost]);

  function go(next) {
    setPage(next);
    (next === 1 ? page1Ref : page2Ref).current?.scrollIntoView({ block: "start" });
  }

  const mini1 = (
    <>
      <b>Jaypee Institute of Information Technology, Noida</b>
      <b>Operating System and System Programming lab</b>
      <b>Assignment-2</b>
      <i>Instructions</i>
      <u />
      <u />
      <i>Assignment Questions</i>
      <u />
      <u />
      <u />
    </>
  );

  const mini2 = (
    <>
      <u />
      <u />
      <u />
      <i>3.</i>
      <u />
      <u />
      <i>4.</i>
      <u />
      <u />
      <i>5.</i>
    </>
  );

  return (
    <div className="pdf-view" data-keep>
      <header className="pdf-bar">
        <div className="pdf-bar-left">
          <PdfIcon d="M4 7h16M4 12h16M4 17h16" />
          <span>Microsoft Word - Week 2 Practice Assignment</span>
        </div>
        <div className="pdf-bar-mid">
          <span className="pdf-page-num">{page}</span>
          <span className="pdf-slash">/</span>
          <span>2</span>
          <i />
          <PdfIcon d="M6 12h12" />
          <em>100%</em>
          <PdfIcon d="M12 6v12M6 12h12" />
          <PdfIcon d="M4 8h16v10H4zM8 8V6h8v2" />
          <PdfIcon d="M7 7l10 3-4 1-1 4-5-8z" />
        </div>
        <div className="pdf-bar-tools">
          <PdfIcon d="M5 19l4-6 3 4 3-5 4 7H5z" />
          <PdfIcon d="M6 7h12M9 7l.8 12h4.4L15 7M10 4h4" />
          <PdfIcon d="M8 12h10M8 12l4-4M8 12l4 4" />
          <PdfIcon d="M16 12H6M16 12l-4-4M16 12l-4 4" />
        </div>
        <div className="pdf-bar-right">
          <PdfIcon d="M12 4v10M8 10l4 4 4-4M5 18h14" />
          <PdfIcon d="M7 8V5h10v3M7 16H5V8h14v8h-2M8 19h8v-6H8v6z" />
        </div>
      </header>
      <div className="pdf-body">
        <aside className="pdf-side">
          <PdfThumb page={1} active={page === 1} onClick={() => go(1)}>
            {mini1}
          </PdfThumb>
          <PdfThumb page={2} active={page === 2} onClick={() => go(2)}>
            {mini2}
          </PdfThumb>
        </aside>
        <div
          className="pdf-stage"
          onClick={() => ghostRef.current?.focus()}
          onScroll={(event) => {
            const mid = event.currentTarget.scrollTop + event.currentTarget.clientHeight / 2;
            const top2 = page2Ref.current?.offsetTop || 9999;
            setPage(mid >= top2 ? 2 : 1);
          }}
        >
          <article className="pdf-paper" ref={page1Ref}>
            <p className="pdf-head">
              Jaypee Institute of Information Technology, Noida
              <br />
              Operating System and System Programming lab [15B17CI472]
            </p>
            <div className="pdf-line3">
              <p className="pdf-title">Assignment-2</p>
              <textarea
                ref={ghostRef}
                className="pdf-ghost"
                value={ghost}
                onChange={(event) => setGhost(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    run(event);
                  }
                }}
                spellCheck={false}
                autoComplete="off"
                rows={1}
              />
            </div>
            <p className="pdf-h">Instructions</p>
            <ul>
              <li>You may use an online GDB C compiler if Linux is not available.</li>
              <li>Commands for process management should be referred during the lab.</li>
            </ul>
            <p className="pdf-h">Assignment Questions (1-5 in help file, 6-8 practice)</p>
            <p className="pdf-q">
              1. Write a Linux C program to display the following process attributes: [CO1]
            </p>
            <p className="pdf-sub">a. Process ID (PID)</p>
            <p className="pdf-sub">b. Parent Process ID (PPID)</p>
            <p className="pdf-sub">c. User ID (UID) and Group ID (GID)</p>
            <p className="pdf-sub">d. Process group ID and session ID</p>
            <p className="pdf-sub">e. Current working directory</p>
            <p className="pdf-q">
              Sort the output into two .txt files: one by PID and another by PPID. Display both
              files on the terminal.
            </p>
            <p className="pdf-q">
              2. Write a Linux C program to create a child process using the fork() system call.
              The parent process should print “I am Parent” along with its PID, and the child
              process should print “I am Child” along with its PID. [CO1]
            </p>
          </article>
          <article className="pdf-paper pdf-page2" ref={page2Ref}>
            <p className="pdf-q">
              3. Write a Linux C program to demonstrate the exec() family of system calls. Create
              a child with fork(); the child should replace its image with the <span>ls -l</span>{" "}
              command, while the parent waits and prints the child’s exit status. [CO1]
            </p>
            <p className="pdf-q">
              4. Write a Linux C program that creates two child processes. The parent should wait
              for both children using wait() and print their PIDs and exit codes. [CO1]
            </p>
            <p className="pdf-q">
              5. Write a Linux C program to send a signal from parent to child using kill() and
              handle it in the child using signal() or sigaction(). Print a message when the
              signal is received. [CO2]
            </p>
            <p className="pdf-q">
              6. Practice: Write a C program to print a small process tree using recursive fork
              (limit the depth to 2). Record PIDs of parent and children. [CO1]
            </p>
            <p className="pdf-q">
              7. Practice: Observe and record the output of ps, pstree, top and kill for the
              programs written above. Attach screenshots / command output in the lab file.
            </p>
            <p className="pdf-q">
              8. Practice: Modify Q1 to also print the nice value and command name of the current
              process, then sort the listing by CPU time.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}

function NewTab({ notes, pdfOpen, lastAnswer }) {
  const [query, setQuery] = useState("");
  const [slide, setSlide] = useState(0);
  const [temp, setTemp] = useState(33);
  const [humidity, setHumidity] = useState(48);
  const [sky, setSky] = useState("Sunny");
  const [sensex, setSensex] = useState(-0.09);
  const [sensexPrice, setSensexPrice] = useState(81240);
  const [panel, setPanel] = useState("");
  const [newLook, setNewLook] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copilotAsk, setCopilotAsk] = useState("");
  const [copilotReply, setCopilotReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState(false);
  const [tab, setTab] = useState("feed");
  const slides = HERO_SLIDES;
  const feedItems =
    tab === "following"
      ? FEED.slice(4, 10)
      : tab === "info"
        ? FEED.filter((item) => (item.kind || "").includes("wide")).concat(MORE_FEED.slice(0, 4))
        : extra
          ? FEED.concat(MORE_FEED)
          : FEED;

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=28.5355&longitude=77.3910&current=temperature_2m,relative_humidity_2m,weather_code"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.current?.temperature_2m != null) {
          setTemp(Math.round(data.current.temperature_2m));
        }
        if (data?.current?.relative_humidity_2m != null) {
          setHumidity(data.current.relative_humidity_2m);
        }
        if (data?.current?.weather_code != null) {
          setSky(weatherLabel(data.current.weather_code));
        }
      })
      .catch(() => {});

    fetch("/api/sensex")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.change === "number") setSensex(data.change);
        if (typeof data.price === "number") setSensexPrice(Math.round(data.price));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(event) {
      if (!event.target.closest("[data-keep]")) setPanel("");
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const down = sensex < 0;
  const sensexText = `${down ? "▼" : "▲"} ${down ? "" : "+"}${sensex.toFixed(2)}%`;
  function toggle(name) {
    setPanel((value) => (value === name ? "" : name));
  }

  async function runSearch(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text || busy) return;
    setPanel("");
    setBusy(true);
    try {
      await solveToClipboard(notes, text);
      setQuery("");
    } catch {
      setQuery(text);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (pdfOpen) return;
    async function onPaste(event) {
      const image = await imageFromClipboardEvent(event);
      if (!image || busy) return;
      setBusy(true);
      setPanel("");
      try {
        await solveToClipboard(notes, query.trim(), image);
        setQuery("");
      } catch {
        setQuery(query);
      } finally {
        setBusy(false);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [busy, notes, query, pdfOpen]);

  function askCopilot(event) {
    event.preventDefault();
    const text = copilotAsk.trim();
    if (!text) return;
    setCopilotReply("I'm Copilot. Try asking from the Microsoft Edge sidebar for a full answer.");
  }

  return (
    <div className={`edge ${newLook ? "" : "old"}`}>
      <div className="edge-bg" />
      {panel === "menu" && (
        <div className="edge-drawer" data-keep>
          <p>My feed</p>
          <p>Following</p>
          <p>Shortcuts</p>
          <p onClick={() => setPanel("settings")}>Settings</p>
        </div>
      )}

      <header className="edge-bar">
        <svg className="edge-menu" viewBox="0 0 24 24" data-keep onClick={() => toggle("menu")}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <div className="edge-bar-right">
          <span>New look</span>
          <div
            className={`edge-toggle ${newLook ? "" : "off"}`}
            data-keep
            onClick={() => setNewLook((value) => !value)}
          />
          <svg className="edge-gear" viewBox="0 0 24 24" data-keep onClick={() => toggle("settings")}>
            <path d="M19.1 12.9a7.5 7.5 0 0 0 .1-.9 7.5 7.5 0 0 0-.1-.9l2.1-1.6-2-3.4-2.5 1a7.4 7.4 0 0 0-1.6-.9l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.6.9l-2.5-1-2 3.4 2.1 1.6a7.5 7.5 0 0 0-.1.9 7.5 7.5 0 0 0 .1.9L2.8 14.5l2 3.4 2.5-1a7.4 7.4 0 0 0 1.6.9l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.6-.9l2.5 1 2-3.4-2.1-1.6zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
          </svg>
        </div>
      </header>

      {panel === "settings" && (
        <div className="edge-pop settings" data-keep>
          <label>
            <input
              type="checkbox"
              checked={newLook}
              onChange={() => setNewLook((value) => !value)}
            />
            New look
          </label>
          <label>
            <input
              type="checkbox"
              checked={showNews}
              onChange={() => setShowNews((value) => !value)}
            />
            Show news
          </label>
        </div>
      )}

      <form
        className={`edge-search ${busy ? "busy" : ""}`}
        data-keep
        onSubmit={runSearch}
      >
        <svg className="edge-search-icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l5 5" />
        </svg>
        <div className="edge-search-field">
          <span className="edge-search-fake">Search the web</span>
          <textarea
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanel("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                runSearch(event);
              }
            }}
            autoComplete="off"
            spellCheck={false}
            rows={1}
            disabled={busy}
          />
        </div>
        <img
          className="edge-copilot"
          src="/copilot.svg"
          alt=""
          onClick={() => toggle("copilot")}
        />
      </form>

      {panel === "copilot" && (
        <div className="edge-pop copilot" data-keep>
          <strong>Copilot</strong>
          <p>{copilotReply || "Hi Sasmit, ask me anything."}</p>
          <form onSubmit={askCopilot}>
            <input
              value={copilotAsk}
              onChange={(event) => setCopilotAsk(event.target.value)}
              placeholder="Message Copilot"
            />
          </form>
        </div>
      )}

      <div className="edge-wrap">
        <div className="edge-hello">
          <h1>
            {greeting()}
          </h1>
          <div className="edge-pills">
            <div className="edge-pill" data-keep onClick={() => toggle("weather")}>
              Noida
              <SunIcon />
              {temp}°
            </div>
            <div className="edge-pill" data-keep onClick={() => toggle("play")}>
              Relax and play
              <PlayIcon />
            </div>
            <div className="edge-pill" data-keep onClick={() => toggle("sensex")}>
              SENSEX
              <span className={down ? "down" : "up"}>{sensexText}</span>
            </div>
          </div>
        </div>

        {panel === "weather" && (
          <div className="edge-pop widget" data-keep>
            <h3>Noida</h3>
            <p className="big">
              {temp}° <span>{sky}</span>
            </p>
            <p>Humidity {humidity}%</p>
          </div>
        )}
        {panel === "play" && (
          <div className="edge-pop widget" data-keep>
            <h3>Relax and play</h3>
            <p>Microsoft Solitaire</p>
            <p>Minesweeper</p>
            <p>Daily trivia</p>
          </div>
        )}
        {panel === "sensex" && (
          <div className="edge-pop widget" data-keep>
            <h3>SENSEX</h3>
            <p className="big">{sensexPrice.toLocaleString("en-IN")}</p>
            <p className={down ? "down" : "up"}>{sensexText}</p>
            <p>BSE Sensex · INR</p>
          </div>
        )}

        {showNews && (
          <div className="edge-news">
            <div className="edge-tabs">
              <span className={tab === "feed" ? "on" : ""} onClick={() => setTab("feed")}>
                My feed
              </span>
              <span className={tab === "following" ? "on" : ""} onClick={() => setTab("following")}>
                Following
              </span>
              <span className={tab === "info" ? "on" : ""} onClick={() => setTab("info")}>
                Information
              </span>
            </div>
            <div className="edge-grid">
              <article
                className="edge-hero"
                style={{ backgroundImage: `url(${slides[slide].image})` }}
              >
                <p>{slides[slide].title}</p>
                <div className="edge-source">
                  <img src={favicon(slides[slide].domain)} alt="" />
                  {slides[slide].source}
                </div>
                <div className="edge-actions">
                  <button
                    type="button"
                    className={liked ? "on" : ""}
                    onClick={() => setLiked((value) => !value)}
                  >
                    {liked ? "▲" : "△"}
                  </button>
                  <button type="button">💬</button>
                </div>
                <div className="edge-nav">
                  <button
                    type="button"
                    onClick={() =>
                      setSlide((value) => (value === 0 ? slides.length - 1 : value - 1))
                    }
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlide((value) => (value + 1) % slides.length)}
                  >
                    ›
                  </button>
                </div>
              </article>

              <article className="edge-side">
                <div
                  className="edge-side-img"
                  style={{ backgroundImage: `url(${SIDE_STORY.image})` }}
                />
                <div className="edge-side-body">
                  <p>{SIDE_STORY.title}</p>
                  <div className="edge-source static">
                    <img src={favicon(SIDE_STORY.domain)} alt="" />
                    {SIDE_STORY.source}
                  </div>
                </div>
              </article>
            </div>
            <div className="edge-feed">
              {feedItems.map((item) => (
                <NewsCard key={item.title} item={item} />
              ))}
            </div>
            {tab === "feed" && !extra && (
              <button type="button" className="edge-more" onClick={() => setExtra(true)}>
                See more stories
              </button>
            )}
          </div>
        )}
      </div>

      <button type="button" className="edge-fab" data-keep onClick={() => toggle("help")}>
        ?
      </button>
      {panel === "help" && (
        <div className="edge-pop help" data-keep>
          <p>What's new in Microsoft Edge</p>
          <p>Help</p>
          <p>Send feedback</p>
        </div>
      )}
      {pdfOpen && <PdfSearch notes={notes} lastAnswer={lastAnswer} />}
    </div>
  );
}

export default function App() {
  const [notes] = useState(() => localStorage.getItem("notes") || "");
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState("");
  const [hidden, setHidden] = useState(true);
  const [pdfOpen, setPdfOpen] = useState(false);
  const hiddenRef = useRef(hidden);
  const outputRef = useRef(output);
  const pdfOpenRef = useRef(pdfOpen);

  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  useEffect(() => {
    pdfOpenRef.current = pdfOpen;
  }, [pdfOpen]);

  useEffect(() => {
    if (pdfOpen) document.title = "Microsoft Word - Week 2 Practice Assignment";
    else if (hidden) document.title = "New tab";
    else document.title = "Start Page";
  }, [hidden, pdfOpen]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    function onHide(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (pdfOpenRef.current) {
          setPdfOpen(false);
          return;
        }
        setHidden(true);
      }
      if (event.ctrlKey && !event.shiftKey && event.code === "KeyQ") {
        event.preventDefault();
        setHidden(true);
        setPdfOpen((value) => !value);
      }
      if (event.ctrlKey && !event.shiftKey && event.code === "KeyH") {
        event.preventDefault();
        setPdfOpen(false);
        if (hiddenRef.current) {
          navigator.clipboard
            .readText()
            .then((text) => {
              const clip = text.trim();
              if (clip && clip !== outputRef.current.trim()) setMessage(clip);
            })
            .catch(() => {});
          setHidden(false);
        } else {
          setHidden(true);
        }
      }
    }
    function cover() {
      setHidden(true);
      setPdfOpen(false);
    }
    window.addEventListener("keydown", onHide);
    window.addEventListener("blur", cover);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cover();
    });
    return () => {
      window.removeEventListener("keydown", onHide);
      window.removeEventListener("blur", cover);
    };
  }, []);

  useEffect(() => {
    const color = hidden ? "#1b1f27" : "#1c1c1e";
    document.body.style.background = color;
    document.documentElement.style.background = color;
  }, [hidden]);

  if (hidden) return <NewTab notes={notes} pdfOpen={pdfOpen} lastAnswer={output} />;

  return <SafariStart notes={notes} lastAnswer={output} seed={message} />;
}
