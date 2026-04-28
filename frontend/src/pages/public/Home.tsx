import { Link } from "react-router-dom";
import {
  Bell, Activity, Clock, Shield, Zap, Globe, MessageSquare,
  CheckCircle, ArrowRight, TrendingUp, AlertTriangle, LayoutDashboard
} from "lucide-react";
import { PublicLayout } from "@/layouts";
import { useAuthStore } from "@/store";

const features = [
  { icon: Bell, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", title: "Instant Email Alerts", desc: "Get notified the second your site goes down — directly in your inbox. Fast, reliable, no missed alerts.", aos: "flip-left" },
  { icon: Zap, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", title: "Keep Free Sites Awake", desc: "Sites on Render, Railway, and similar free tiers sleep after inactivity. Regular pings keep them alive and responsive.", aos: "fade-up" },
  { icon: TrendingUp, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30", title: "Uptime History & Stats", desc: "Visual uptime bars and percentage stats so you can see your service reliability over time.", aos: "flip-right" },
  { icon: Globe, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30", title: "HTTP/HTTPS Monitoring", desc: "Monitor any public URL — websites, REST APIs, webhooks — with GET, HEAD, or POST.", aos: "zoom-in" },
  { icon: Clock, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30", title: "Configurable Intervals", desc: "Set check intervals from every 30 seconds up to 24 hours — customised per monitor based on your needs.", aos: "zoom-in-up" },
  { icon: Shield, color: "text-red-500 bg-red-50 dark:bg-red-950/30", title: "Incident Tracking", desc: "Know exactly when a site went down and how long it stayed down with incident timestamps.", aos: "flip-left" },
  { icon: Activity, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30", title: "Live Status Dashboard", desc: "One-glance overview of all your monitors. Green or red — you always know what's happening.", aos: "fade-right" },
  { icon: MessageSquare, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30", title: "Multiple Monitors", desc: "Track up to 20 services per account. Add, pause, and delete monitors any time.", aos: "flip-right" },
];

const steps = [
  { num: "01", icon: Globe, title: "Add a URL", desc: "Paste the URL you want to monitor. No code required.", aos: "slide-right" },
  { num: "02", icon: Clock, title: "Set an interval", desc: "Pick how often you want us to check — every minute to every 24 hours.", aos: "fade-up" },
  { num: "03", icon: Bell, title: "Set notifications", desc: "Alerts go straight to your email the moment something goes wrong.", aos: "slide-left" },
  { num: "04", icon: CheckCircle, title: "Relax", desc: "We handle all the checks. You get a ping the moment anything changes.", aos: "zoom-in" },
];

export default function Home() {
  const { token } = useAuthStore();
  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-14 pb-20 bg-background overflow-hidden">
        <div className="main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                data-aos="fade-right"
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit leading-tight mb-5"
              >
                Keep Your Site Up{" "}
                <span className="text-emerald-500">and Always Know When It's Down</span>
              </h1>

              <p
                data-aos="fade-right"
                data-aos-delay="100"
                className="text-base text-muted leading-relaxed mb-7 max-w-lg"
              >
                Free hosting services like Render put your app to sleep when idle.{" "}
                <span className="text-emerald-500 font-semibold">Gifted Monitor pings it at set intervals</span>{" "}
                to keep it awake — and if it ever goes down, you'll get an instant{" "}
                <span className="text-emerald-500 font-semibold">email alert</span>{" "}
                so you can fix it before your users even notice.
              </p>

              <div data-aos="zoom-in" data-aos-delay="200" className="flex flex-wrap gap-3 mb-7">
                <Link
                  to={token ? "/dashboard" : "/signup"}
                  className="btn h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors gap-2"
                >
                  {token ? <><LayoutDashboard size={15} /> Go to Dashboard</> : "🚀 Start Monitoring Free"}
                </Link>
                <button
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn h-11 px-6 rounded-xl border border-line hover:bg-foreground text-sm font-medium transition-colors gap-2"
                >
                  See Features <ArrowRight size={15} />
                </button>
              </div>

              <div data-aos="fade-up" data-aos-delay="300" className="flex flex-wrap gap-5 text-xs text-muted">
                {["No credit card required", "Setup in under 5 minutes", "24/7 monitoring"].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-500" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div data-aos="fade-left" data-aos-delay="150" className="relative lg:block hidden">
              {/* Email alert notification — smooth bounce */}
              <div className="absolute -top-5 right-0 bg-background border border-line rounded-xl p-3 shadow-lg flex items-center gap-3 max-w-[220px] z-10 animate-bounce" style={{ animationDuration: "2.5s" }}>
                <div className="w-9 h-9 rounded-full bg-green-500 center text-white shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold">Email Alert</p>
                  <p className="text-[10px] text-red-500 font-medium">⚠ api.example.com is DOWN</p>
                  <p className="text-[9px] text-muted">Just now · Gifted Monitor</p>
                </div>
              </div>

              {/* Main monitor card */}
              <div className="bg-secondary border border-line rounded-2xl p-5 mt-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold">api.giftedtech.co.ke</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">UP</span>
                </div>
                <p className="text-xs text-muted mb-4">Checked 42s ago</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[["RESPONSE", "185ms"], ["UPTIME", "99.9%"], ["INTERVAL", "3m"], ["CHECKED", "30"]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-[9px] text-muted font-semibold mb-0.5">{l}</p>
                      <p className="text-sm font-bold text-emerald-500">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {Array(30).fill(null).map((_, i) => (
                    <div key={i} className={`flex-1 h-5 rounded-[3px] ${i === 8 || i === 22 ? "bg-red-400" : "bg-emerald-500"}`} />
                  ))}
                </div>
                <p className="text-[9px] text-muted mt-1.5 text-right">Last 30 checks</p>
              </div>

              {/* DOWN card */}
              <div className="mt-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">shop.mystore.co.ke</p>
                    <p className="text-[10px] text-muted">Response timeout</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">DOWN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-4">
        <div className="main">
          <div className="text-center mb-12">
            <h2 data-aos="zoom-in" className="text-3xl md:text-4xl font-bold font-outfit mb-3">Everything You Need to Stay Online</h2>
            <p data-aos="fade-up" data-aos-delay="100" className="text-muted max-w-xl mx-auto text-sm">Built for developers and indie hackers who host on free tiers — keep your services alive, and know the moment anything breaks.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-aos={f.aos}
                data-aos-delay={String((i % 4) * 70)}
                className="bg-background border border-line rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-xl center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-4 bg-secondary">
        <div className="main">
          <div className="text-center mb-12">
            <h2 data-aos="fade-right" className="text-3xl md:text-4xl font-bold font-outfit mb-3">Up and Running in Minutes</h2>
            <p data-aos="fade-left" data-aos-delay="100" className="text-muted max-w-xl mx-auto text-sm">No complicated setup. No DevOps knowledge needed. Just add a URL and we handle the rest.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.num}
                data-aos={step.aos}
                data-aos-delay={String(i * 100)}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-emerald-500/30 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 1.5rem)" }} />
                )}
                <div className="bg-background border border-line rounded-xl p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold font-outfit text-emerald-600 dark:text-emerald-400 opacity-70">{step.num}</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 center text-white shadow-sm">
                      <step.icon size={18} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="main">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { value: "99.9%", label: "Monitoring uptime SLA", aos: "flip-left" },
              { value: "<1min", label: "Average alert delivery time", aos: "zoom-in" },
              { value: "24/7", label: "Continuous checks, no breaks", aos: "flip-right" },
            ].map((s, i) => (
              <div
                key={s.label}
                data-aos={s.aos}
                data-aos-delay={String(i * 100)}
                className="bg-secondary border border-line rounded-2xl p-8"
              >
                <p className="text-4xl font-bold font-outfit text-emerald-500 mb-2">{s.value}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="main">
          <div data-aos="zoom-in-up" className="bg-background border border-line rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">
              Start Monitoring for Free Today
            </h2>
            <p className="text-muted max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              No credit card. No complicated setup. Just sign up, add a monitor, and we'll keep watch while you focus on building.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={token ? "/dashboard" : "/signup"} className="btn h-11 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors gap-2">
                {token ? <><LayoutDashboard size={15} /> Go to Dashboard</> : "🚀 Get Started Free"}
              </Link>
              <Link to="/contact" className="btn h-11 px-8 rounded-xl border border-line hover:bg-foreground font-medium text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
