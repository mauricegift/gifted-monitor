import { Link } from "react-router-dom";
import { CheckCircle, Globe, Clock, Bell, Shield, Zap, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/layouts";

const whatWeMonitor = [
  "HTTP/HTTPS websites and APIs",
  "Custom request paths with configurable methods (GET, POST, HEAD)",
  "Response time and status codes",
  "Custom POST request bodies (JSON payloads)",
  "Recovery from incidents — not just downtime",
];

const values = [
  { icon: Globe, title: "Simple by Default", desc: "Uptime monitoring shouldn't require a DevOps team. Add a URL and go.", aos: "flip-left" },
  { icon: Bell, title: "Email Alerts", desc: "Instant email notifications the moment something goes wrong — straight to your inbox, every time.", aos: "zoom-in" },
  { icon: Shield, title: "Reliable Checks", desc: "Our monitoring infrastructure runs independently — so if your server is down, we still know.", aos: "flip-right" },
  { icon: Zap, title: "Fast Alerts", desc: "From detection to email notification in under a minute — usually much faster.", aos: "fade-right" },
  { icon: Clock, title: "Configurable", desc: "One-minute intervals or hourly checks — you choose what makes sense for each service.", aos: "zoom-in-up" },
  { icon: CheckCircle, title: "Built by Developers", desc: "We built the tool we always wished existed. No bloat. No enterprise pricing. Just monitoring.", aos: "flip-left" },
];

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-12 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 data-aos="zoom-in" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            About <span className="text-emerald-500">Gifted Monitor</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="120" className="text-muted text-base max-w-xl mx-auto">
            We built the tool we always wished existed — fast, simple uptime monitoring with instant email alerts.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 py-8 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-10">

          <div data-aos="fade-right" data-aos-duration="600">
            <h2 className="text-2xl font-bold font-outfit mb-3">Who We Are</h2>
            <p className="text-muted leading-relaxed text-sm">
              Gifted Monitor is a product of{" "}
              <a href="https://gifted.co.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline font-medium">
                Gifted Tech
              </a>{" "}
              — a software development studio focused on building practical, well-crafted tools for developers and businesses.
              We're a small team with a big belief: that monitoring your infrastructure shouldn't require an enterprise contract or a PhD in DevOps.
            </p>
          </div>

          <div data-aos="fade-left" data-aos-duration="600">
            <h2 className="text-2xl font-bold font-outfit mb-3">Why We Built This</h2>
            <p className="text-muted leading-relaxed mb-3 text-sm">
              We've been on the receiving end of angry customer messages: "Your site's been down for two hours — didn't you know?"
              It's embarrassing. It's avoidable.
            </p>
            <p className="text-muted leading-relaxed mb-3 text-sm">
              SMS costs money. Push notifications need an app. But email?{" "}
              <span className="text-emerald-500 font-semibold">Everyone has an inbox</span> — and we make sure you see our alerts before anyone else notices the problem.
            </p>
            <p className="text-muted leading-relaxed text-sm">
              That's the insight behind Gifted Monitor. We send clean, actionable email alerts the moment
              something goes wrong — so you can act before users even notice.
            </p>
          </div>

          <div data-aos="fade-right" data-aos-duration="600">
            <h2 className="text-2xl font-bold font-outfit mb-3">What We Monitor</h2>
            <div className="space-y-2.5">
              {whatWeMonitor.map((item, i) => (
                <div
                  key={item}
                  data-aos="slide-right"
                  data-aos-delay={String(i * 80)}
                  className="flex items-start gap-3"
                >
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-muted text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 px-4 bg-secondary overflow-hidden">
        <div className="main">
          <div className="text-center mb-10">
            <h2 data-aos="flip-up" className="text-3xl font-bold font-outfit mb-2">What We Stand For</h2>
            <p data-aos="fade-up" data-aos-delay="100" className="text-muted max-w-xl mx-auto text-sm">Our principles guide how we build and operate Gifted Monitor.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <div
                key={v.title}
                data-aos={v.aos}
                data-aos-delay={String((i % 3) * 90)}
                className="bg-background border border-line rounded-xl p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 center text-emerald-500 mb-4">
                  <v.icon size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="main">
          <div data-aos="zoom-in" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-outfit mb-4">Ready to Start Monitoring?</h2>
            <p className="text-muted mb-8 text-sm">Join and start keeping an eye on your services — for free.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn h-11 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm gap-2 transition-colors">
                Get Started Free <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="btn h-11 px-6 rounded-xl border border-line hover:bg-foreground text-sm font-medium transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
