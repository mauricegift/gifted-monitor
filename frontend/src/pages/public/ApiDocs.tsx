import { useState } from "react";
import { PublicLayout } from "@/layouts";
import { Key, ChevronDown, ChevronRight, Copy, CheckCircle, Activity, Settings, Trash2, Zap, List } from "lucide-react";
import { toast } from "sonner";

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text, light }: { text: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Copied!");
    });
  };
  return (
    <button
      onClick={copy}
      className={`absolute top-2.5 right-2.5 btn h-7 w-7 rounded-lg transition-colors ${
        light
          ? "bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700"
          : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
      }`}
    >
      {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Very-light syntax highlighting ───────────────────────────────────────────
// Works entirely via CSS classes, no external library needed.
type Lang = "bash" | "json" | "javascript" | "python" | "php" | "url";

function highlight(code: string, lang: Lang): React.ReactNode {
  if (lang === "url") {
    return <span className="text-emerald-600 dark:text-emerald-400 break-all">{code}</span>;
  }

  if (lang === "json") {
    const parts = code.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|true|false|null|\b\d+\.?\d*\b)/g);
    return parts.map((part, i) => {
      if (/^"[^"]*":/.test(part)) return <span key={i} className="text-sky-600 dark:text-sky-300">{part}</span>;
      if (/^"/.test(part)) return <span key={i} className="text-emerald-600 dark:text-emerald-300">{part}</span>;
      if (part === "true" || part === "false") return <span key={i} className="text-amber-600 dark:text-amber-300">{part}</span>;
      if (part === "null") return <span key={i} className="text-purple-600 dark:text-purple-300">{part}</span>;
      if (/^\d/.test(part)) return <span key={i} className="text-orange-600 dark:text-orange-300">{part}</span>;
      return <span key={i}>{part}</span>;
    });
  }

  if (lang === "bash") {
    const lines = code.split("\n");
    return lines.map((line, li) => {
      let content: React.ReactNode;
      if (line.startsWith("#")) {
        content = <span className="text-gray-500 dark:text-gray-400 italic">{line}</span>;
      } else {
        const parts = line.split(/(curl|--data|-X|-H|-d|"[^"]*"|'[^']*'|-[a-zA-Z]+|https?:\/\/[^\s\\]+)/g);
        content = parts.map((p, pi) => {
          if (p === "curl") return <span key={pi} className="text-emerald-600 dark:text-emerald-400 font-semibold">{p}</span>;
          if (["-X", "-H", "-d", "--data"].includes(p)) return <span key={pi} className="text-sky-600 dark:text-sky-300">{p}</span>;
          if (p.startsWith("-")) return <span key={pi} className="text-sky-600 dark:text-sky-300">{p}</span>;
          if (/^https?:\/\//.test(p)) return <span key={pi} className="text-amber-600 dark:text-amber-300">{p}</span>;
          if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'")))
            return <span key={pi} className="text-rose-600 dark:text-rose-300">{p}</span>;
          return <span key={pi}>{p}</span>;
        });
      }
      return <span key={li}>{content}{li < lines.length - 1 ? "\n" : ""}</span>;
    });
  }

  if (lang === "javascript") {
    const keywords = /\b(const|let|var|async|await|function|return|import|export|from|new|if|else|true|false|null|undefined)\b/g;
    const strings = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;
    const comments = /(\/\/.*)/g;
    // Simple line-by-line approach
    return code.split("\n").map((line, li, arr) => {
      let node: React.ReactNode;
      if (line.trim().startsWith("//")) {
        node = <span className="text-gray-500 dark:text-gray-400 italic">{line}</span>;
      } else {
        const marked = line
          .replace(strings, m => `§STRING§${m}§/STRING§`)
          .replace(keywords, m => `§KW§${m}§/KW§`)
          .replace(comments, m => `§CMT§${m}§/CMT§`);
        const tokens = marked.split(/(§STRING§.*?§\/STRING§|§KW§.*?§\/KW§|§CMT§.*?§\/CMT§)/g);
        node = tokens.map((t, ti) => {
          if (t.startsWith("§STRING§")) return <span key={ti} className="text-emerald-600 dark:text-emerald-300">{t.replace(/§STRING§|§\/STRING§/g, "")}</span>;
          if (t.startsWith("§KW§"))     return <span key={ti} className="text-purple-600 dark:text-purple-300 font-medium">{t.replace(/§KW§|§\/KW§/g, "")}</span>;
          if (t.startsWith("§CMT§"))    return <span key={ti} className="text-gray-500 dark:text-gray-400 italic">{t.replace(/§CMT§|§\/CMT§/g, "")}</span>;
          return <span key={ti}>{t}</span>;
        });
      }
      return <span key={li}>{node}{li < arr.length - 1 ? "\n" : ""}</span>;
    });
  }

  if (lang === "python") {
    const keywords = /\b(import|from|def|return|print|True|False|None|if|else|elif|for|in|as|with|async|await|class|and|or|not|f)\b/g;
    return code.split("\n").map((line, li, arr) => {
      let node: React.ReactNode;
      if (line.trim().startsWith("#")) {
        node = <span className="text-gray-500 dark:text-gray-400 italic">{line}</span>;
      } else {
        const marked = line
          .replace(/(f?"[^"]*"|f?'[^']*')/g, m => `§STR§${m}§/STR§`)
          .replace(keywords, m => `§KW§${m}§/KW§`);
        const tokens = marked.split(/(§STR§.*?§\/STR§|§KW§.*?§\/KW§)/g);
        node = tokens.map((t, ti) => {
          if (t.startsWith("§STR§")) return <span key={ti} className="text-emerald-600 dark:text-emerald-300">{t.replace(/§STR§|§\/STR§/g, "")}</span>;
          if (t.startsWith("§KW§"))  return <span key={ti} className="text-purple-600 dark:text-purple-300 font-medium">{t.replace(/§KW§|§\/KW§/g, "")}</span>;
          return <span key={ti}>{t}</span>;
        });
      }
      return <span key={li}>{node}{li < arr.length - 1 ? "\n" : ""}</span>;
    });
  }

  if (lang === "php") {
    const keywords = /\b(function|use|echo|return|array|true|false|null|if|else|foreach|in|new|string|int|bool|array)\b/g;
    return code.split("\n").map((line, li, arr) => {
      let node: React.ReactNode;
      if (line.trim().startsWith("//")) {
        node = <span className="text-gray-500 dark:text-gray-400 italic">{line}</span>;
      } else {
        const marked = line
          .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => `§STR§${m}§/STR§`)
          .replace(/(\$\w+)/g, m => `§VAR§${m}§/VAR§`)
          .replace(keywords, m => `§KW§${m}§/KW§`)
          .replace(/(<\?php|=>|->)/g, m => `§OP§${m}§/OP§`);
        const tokens = marked.split(/(§STR§.*?§\/STR§|§VAR§.*?§\/VAR§|§KW§.*?§\/KW§|§OP§.*?§\/OP§)/g);
        node = tokens.map((t, ti) => {
          if (t.startsWith("§STR§")) return <span key={ti} className="text-emerald-600 dark:text-emerald-300">{t.replace(/§STR§|§\/STR§/g, "")}</span>;
          if (t.startsWith("§VAR§")) return <span key={ti} className="text-sky-600 dark:text-sky-300">{t.replace(/§VAR§|§\/VAR§/g, "")}</span>;
          if (t.startsWith("§KW§"))  return <span key={ti} className="text-purple-600 dark:text-purple-300 font-medium">{t.replace(/§KW§|§\/KW§/g, "")}</span>;
          if (t.startsWith("§OP§"))  return <span key={ti} className="text-amber-600 dark:text-amber-300">{t.replace(/§OP§|§\/OP§/g, "")}</span>;
          return <span key={ti}>{t}</span>;
        });
      }
      return <span key={li}>{node}{li < arr.length - 1 ? "\n" : ""}</span>;
    });
  }

  return <>{code}</>;
}

// ── Theme-aware code block ────────────────────────────────────────────────────
function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const lang = (language as Lang);
  return (
    <div className="relative group">
      {/* Light theme: light gray bg, dark theme: near-black */}
      <div className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
        <div className="px-4 pt-8 pb-4">
          <pre className="text-sm font-mono leading-relaxed whitespace-pre text-gray-800 dark:text-gray-200">
            {highlight(code, lang)}
          </pre>
        </div>
      </div>
      {/* Language badge */}
      <span className="absolute top-2.5 left-4 text-[10px] font-mono text-gray-400 dark:text-gray-500 select-none pointer-events-none">
        {language}
      </span>
      <CopyButton text={code} light={false} />
    </div>
  );
}

// ── Tabbed code block for multiple languages ──────────────────────────────────
type TabEntry = { label: string; language: Lang; code: string };

function TabbedCodeBlock({ tabs }: { tabs: TabEntry[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0.5 mb-0 bg-gray-100 dark:bg-gray-950 border border-b-0 border-gray-200 dark:border-gray-800 rounded-t-xl px-2 pt-2 overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              i === active
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-b-0 border-gray-200 dark:border-gray-700"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Code area */}
      <div className="relative bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-b-xl rounded-tr-xl overflow-x-auto">
        <div className="px-4 pt-4 pb-4">
          <pre className="text-sm font-mono leading-relaxed whitespace-pre text-gray-800 dark:text-gray-200">
            {highlight(tab.code, tab.language)}
          </pre>
        </div>
        <CopyButton text={tab.code} />
      </div>
    </div>
  );
}

// ── Misc ──────────────────────────────────────────────────────────────────────
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${color}`}>
      {children}
    </span>
  );
}

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  description?: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  body?: { name: string; type: string; required: boolean; desc: string }[];
  response: string;
  example?: string;
}

const methodColors: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  POST:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  PUT:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function Endpoint({ method, path, summary, description, params, body, response, example }: EndpointProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-foreground/50 transition-colors"
      >
        <Badge color={methodColors[method]}>{method}</Badge>
        <code className="text-sm font-mono font-medium text-main flex-1 truncate">{path}</code>
        <span className="text-sm text-muted hidden sm:block shrink-0">{summary}</span>
        {open ? <ChevronDown size={16} className="text-muted shrink-0" /> : <ChevronRight size={16} className="text-muted shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-line p-4 space-y-4 bg-background">
          {description && <p className="text-sm text-muted">{description}</p>}

          {params && params.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Path / Query Parameters</p>
              <div className="rounded-xl border border-line overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Required</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {params.map(p => (
                      <tr key={p.name}>
                        <td className="px-3 py-2 font-mono text-xs font-medium text-main">{p.name}</td>
                        <td className="px-3 py-2 text-xs text-muted">{p.type}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-medium ${p.required ? "text-red-500" : "text-muted"}`}>
                            {p.required ? "Required" : "Optional"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {body && body.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Request Body (JSON)</p>
              <div className="rounded-xl border border-line overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead className="bg-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Field</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Required</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {body.map(f => (
                      <tr key={f.name}>
                        <td className="px-3 py-2 font-mono text-xs font-medium text-main">{f.name}</td>
                        <td className="px-3 py-2 text-xs text-muted">{f.type}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-medium ${f.required ? "text-red-500" : "text-muted"}`}>
                            {f.required ? "Required" : "Optional"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Response</p>
            <CodeBlock code={response} language="json" />
          </div>

          {example && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Example Request</p>
              <CodeBlock code={example} language="bash" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const BASE = "https://monitor.giftedtech.co.ke/api/v1";

export default function ApiDocs() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-12 pb-8 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Activity size={13} />
            REST API — v1
          </div>
          <h1 data-aos="fade-up" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            API <span className="text-emerald-500">Reference</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-muted text-base max-w-xl mx-auto">
            Programmatically manage your monitors using our REST API. Authenticate with an API key to list, create, update, and delete monitors.
          </p>
        </div>
      </section>

      <div className="px-4 pb-16 max-w-4xl mx-auto space-y-10">

        {/* Authentication */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Authentication</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-4">
            <p className="text-sm text-muted">
              All API v1 requests require an API key. Generate one from your{" "}
              <a href="/profile" className="text-emerald-500 hover:underline">Profile → API Keys</a>.
              Pass the key via the <code className="bg-foreground px-1.5 py-0.5 rounded text-xs font-mono">X-API-Key</code> header or as a query parameter.
            </p>

            <TabbedCodeBlock tabs={[
              {
                label: "Header (recommended)",
                language: "bash",
                code: `curl ${BASE}/monitors \\\n  -H "X-API-Key: gm_your_key_here"`,
              },
              {
                label: "Query parameter",
                language: "bash",
                code: `curl "${BASE}/monitors?api_key=gm_your_key_here"`,
              },
            ]} />

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
              <strong>Keep your key secret.</strong> Do not commit it to source control or expose it in client-side code. Rotate it immediately if it's compromised.
            </div>

            <div>
              <p className="text-xs font-semibold text-muted mb-2">Key format</p>
              <div className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                <span className="text-emerald-600 dark:text-emerald-400">gm_</span>
                <span>{"<64 hex chars>"}</span>
                <span className="ml-3 text-gray-400 dark:text-gray-500">e.g. gm_1a2b3c4d5e6f...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Base URL */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Base URL & Rate Limits</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted mb-1">Production base URL</p>
              <CodeBlock code={BASE} language="url" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Format", value: "JSON (application/json)" },
                { label: "Auth", value: "X-API-Key header" },
                { label: "Rate limit", value: "60 requests / minute" },
              ].map(i => (
                <div key={i.label} className="bg-foreground rounded-xl p-3">
                  <p className="text-xs text-muted">{i.label}</p>
                  <p className="font-medium text-sm mt-0.5">{i.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Errors */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Error Responses</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-3">
            <p className="text-sm text-muted">All errors return a JSON body with an <code className="bg-foreground px-1 rounded text-xs font-mono">error</code> field.</p>
            <CodeBlock code={`{ "error": "Human-readable error message" }`} language="json" />
            <div className="rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Status</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ["200 / 201", "Success"],
                    ["400", "Bad request — missing or invalid fields"],
                    ["401", "Unauthorized — invalid or missing API key"],
                    ["403", "Forbidden — you don't own this resource, or limit reached"],
                    ["404", "Not found — monitor doesn't exist"],
                    ["429", "Rate limit exceeded — max 60 req/min"],
                    ["500", "Server error — try again"],
                  ].map(([s, m]) => (
                    <tr key={s}>
                      <td className="px-3 py-2 font-mono text-xs font-medium">{s}</td>
                      <td className="px-3 py-2 text-xs text-muted">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Monitor Endpoints */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <List size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Monitor Endpoints</h2>
          </div>
          <div className="space-y-3">

            <Endpoint
              method="GET"
              path="/api/v1/monitors"
              summary="List all monitors"
              description="Returns all monitors belonging to the authenticated API key owner, including the last 30 history entries for each."
              response={`{
  "monitors": [
    {
      "id": 1,
      "name": "My Website",
      "url": "https://example.com",
      "path": null,
      "method": "GET",
      "interval_mins": 3,
      "is_active": true,
      "last_status": "up",
      "last_response_time": 182,
      "uptime_pct": 99.8,
      "notify_down": true,
      "notify_up": true,
      "created_at": "2025-01-15T10:00:00.000Z",
      "history": [ "..." ]
    }
  ],
  "count": 1
}`}
              example={`curl ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/monitors/:id"
              summary="Get a single monitor"
              description="Returns full details of a single monitor with its last 60 check history entries."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{
  "id": 1,
  "name": "My Website",
  "url": "https://example.com",
  "last_status": "up",
  "uptime_pct": 99.8,
  "history": [
    { "status": "up", "response_time": 182, "checked_at": "..." }
  ]
}`}
              example={`curl ${BASE}/monitors/1 \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="POST"
              path="/api/v1/monitors"
              summary="Create a monitor"
              description="Create a new monitor. Your account's monitor limit applies."
              body={[
                { name: "name", type: "string", required: true, desc: "Display name (max 100 chars)" },
                { name: "url", type: "string", required: true, desc: "Full URL (must start with http:// or https://)" },
                { name: "path", type: "string", required: false, desc: "Extra path appended to URL (e.g. /health)" },
                { name: "method", type: "string", required: false, desc: "HTTP method: GET (default), HEAD, or POST" },
                { name: "body", type: "string", required: false, desc: "Request body for POST monitors (JSON string)" },
                { name: "intervalMins", type: "number", required: false, desc: "Check frequency in minutes. Min 0.5 (30s), max 1440 (24h). Default: 3" },
                { name: "notify_down", type: "boolean", required: false, desc: "Email alert when down. Default: true" },
                { name: "notify_up", type: "boolean", required: false, desc: "Email alert when recovered. Default: true" },
              ]}
              response={`{
  "id": 5,
  "name": "API Health",
  "url": "https://api.example.com",
  "method": "GET",
  "interval_mins": 5,
  "is_active": true,
  "last_status": "unknown",
  "created_at": "2025-01-15T12:00:00.000Z"
}`}
              example={`curl -X POST ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "API Health",
    "url": "https://api.example.com",
    "path": "/health",
    "method": "GET",
    "intervalMins": 5
  }'`}
            />

            <Endpoint
              method="PUT"
              path="/api/v1/monitors/:id"
              summary="Update a monitor"
              description="Partially update a monitor. Only fields you include will be changed."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              body={[
                { name: "name", type: "string", required: false, desc: "New display name" },
                { name: "url", type: "string", required: false, desc: "New URL" },
                { name: "path", type: "string", required: false, desc: "New path suffix" },
                { name: "method", type: "string", required: false, desc: "GET | HEAD | POST" },
                { name: "intervalMins", type: "number", required: false, desc: "New check interval in minutes" },
                { name: "is_active", type: "boolean", required: false, desc: "Pause (false) or resume (true) monitoring" },
                { name: "notify_down", type: "boolean", required: false, desc: "Toggle down alerts" },
                { name: "notify_up", type: "boolean", required: false, desc: "Toggle recovery alerts" },
              ]}
              response={`{ "id": 5, "name": "API Health v2", "interval_mins": 10 }`}
              example={`curl -X PUT ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "is_active": false }'`}
            />

            <Endpoint
              method="DELETE"
              path="/api/v1/monitors/:id"
              summary="Delete a monitor"
              description="Permanently deletes a monitor and all its check history. No password required when using an API key."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{ "message": "Monitor deleted" }`}
              example={`curl -X DELETE ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="POST"
              path="/api/v1/monitors/:id/ping"
              summary="Trigger a manual ping"
              description="Immediately triggers a check for the specified monitor outside of its normal schedule. Useful for testing."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{ "message": "Ping triggered", "monitor_id": "5" }`}
              example={`curl -X POST ${BASE}/monitors/5/ping \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/monitors/:id/history"
              summary="Get check history"
              description="Returns check history entries for a monitor. Default limit is 60, max 200."
              params={[
                { name: "id", type: "integer / string", required: true, desc: "Monitor ID" },
                { name: "limit", type: "integer", required: false, desc: "Number of entries to return (default: 60, max: 200)" },
              ]}
              response={`{
  "monitor_id": "5",
  "count": 60,
  "history": [
    {
      "id": 1201,
      "status": "up",
      "response_time": 145,
      "error_msg": null,
      "checked_at": "2025-01-15T12:05:00.000Z"
    }
  ]
}`}
              example={`curl "${BASE}/monitors/5/history?limit=100" \\
  -H "X-API-Key: gm_your_key_here"`}
            />

          </div>
        </section>

        {/* Code Examples — tabbed */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Code Examples</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted mb-2">List & create monitors</p>
              <TabbedCodeBlock tabs={[
                {
                  label: "cURL",
                  language: "bash",
                  code: `# List all monitors
curl ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here"

# Create a monitor
curl -X POST ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My API","url":"https://api.example.com","intervalMins":5}'`,
                },
                {
                  label: "Node.js",
                  language: "javascript",
                  code: `const API_KEY = "gm_your_key_here";
const BASE    = "${BASE}";

async function getMonitors() {
  const res = await fetch(\`\${BASE}/monitors\`, {
    headers: { "X-API-Key": API_KEY }
  });
  const data = await res.json();
  console.log(data.monitors);
}

async function createMonitor(name, url, intervalMins = 5) {
  const res = await fetch(\`\${BASE}/monitors\`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ name, url, intervalMins })
  });
  return res.json();
}

getMonitors();`,
                },
                {
                  label: "Python",
                  language: "python",
                  code: `import requests

API_KEY = "gm_your_key_here"
BASE    = "${BASE}"
HEADERS = {"X-API-Key": API_KEY}

# List all monitors
r = requests.get(f"{BASE}/monitors", headers=HEADERS)
monitors = r.json()["monitors"]
print(f"You have {len(monitors)} monitors")

# Create a monitor
new_monitor = requests.post(
    f"{BASE}/monitors",
    headers=HEADERS,
    json={"name": "My API", "url": "https://api.example.com", "intervalMins": 5}
).json()
print("Created:", new_monitor["id"])`,
                },
                {
                  label: "PHP",
                  language: "php",
                  code: `<?php
$apiKey = "gm_your_key_here";
$base   = "${BASE}";

function apiRequest(string $method, string $path, ?array $body = null) use ($apiKey, $base): array {
    $ch = curl_init($base . $path);
    $headers = ["X-API-Key: $apiKey", "Content-Type: application/json"];
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS     => $body ? json_encode($body) : null,
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $result;
}

$monitors = apiRequest("GET", "/monitors")["monitors"];
echo "Monitors: " . count($monitors) . PHP_EOL;

$new = apiRequest("POST", "/monitors", [
    "name"         => "My Website",
    "url"          => "https://example.com",
    "intervalMins" => 5
]);
echo "Created ID: " . $new["id"] . PHP_EOL;
?>`,
                },
              ]} />
            </div>

            <div>
              <p className="text-xs font-semibold text-muted mb-2">Pause, update & delete</p>
              <TabbedCodeBlock tabs={[
                {
                  label: "cURL",
                  language: "bash",
                  code: `# Pause a monitor
curl -X PUT ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"is_active": false}'

# Delete a monitor
curl -X DELETE ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here"

# Trigger an immediate ping
curl -X POST ${BASE}/monitors/5/ping \\
  -H "X-API-Key: gm_your_key_here"`,
                },
                {
                  label: "Node.js",
                  language: "javascript",
                  code: `const API_KEY = "gm_your_key_here";
const BASE    = "${BASE}";
const hdrs    = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

// Pause monitor 5
await fetch(\`\${BASE}/monitors/5\`, {
  method: "PUT",
  headers: hdrs,
  body: JSON.stringify({ is_active: false })
});

// Delete monitor 5
await fetch(\`\${BASE}/monitors/5\`, { method: "DELETE", headers: hdrs });

// Trigger a ping
await fetch(\`\${BASE}/monitors/5/ping\`, { method: "POST", headers: hdrs });`,
                },
                {
                  label: "Python",
                  language: "python",
                  code: `import requests

API_KEY = "gm_your_key_here"
BASE    = "${BASE}"
HEADERS = {"X-API-Key": API_KEY}

# Pause monitor 5
requests.put(f"{BASE}/monitors/5", headers=HEADERS, json={"is_active": False})

# Pause a monitor
requests.put(
    f"{BASE}/monitors/5",
    headers=HEADERS,
    json={"is_active": False}
)

# Delete monitor 5
requests.delete(f"{BASE}/monitors/5", headers=HEADERS)

# Trigger a ping
requests.post(f"{BASE}/monitors/5/ping", headers=HEADERS)`,
                },
                {
                  label: "PHP",
                  language: "php",
                  code: `<?php
// Pause monitor 5
apiRequest("PUT", "/monitors/5", ["is_active" => false]);

// Delete monitor 5
apiRequest("DELETE", "/monitors/5");

// Trigger a ping
apiRequest("POST", "/monitors/5/ping");
?>`,
                },
              ]} />
            </div>
          </div>
        </section>

        {/* SDKs note */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Quick Reference</h2>
          </div>
          <div className="bg-background border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted">Endpoint</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted">Method</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  ["/monitors",            "GET",    "List all monitors + last 30 checks each"],
                  ["/monitors",            "POST",   "Create a new monitor"],
                  ["/monitors/:id",        "GET",    "Get one monitor + last 60 checks"],
                  ["/monitors/:id",        "PUT",    "Update monitor settings"],
                  ["/monitors/:id",        "DELETE", "Delete a monitor"],
                  ["/monitors/:id/ping",   "POST",   "Trigger an immediate ping"],
                  ["/monitors/:id/history","GET",    "Get history (max 200, use ?limit=N)"],
                ].map(([ep, m, desc]) => (
                  <tr key={ep + m}>
                    <td className="px-4 py-2 font-mono text-xs text-main">{ep}</td>
                    <td className="px-4 py-2">
                      <Badge color={methodColors[m]}>{m}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
