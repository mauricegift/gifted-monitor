import { useState } from "react";
import { Mail, Globe, Send, CheckCircle, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/layouts";
import { ButtonWithLoader } from "@/components/ui";
import api from "@/config/api";

const channels = [
  {
    icon: Mail,
    color: "bg-blue-500",
    title: "Email",
    desc: "Send us an email for detailed queries or billing questions.",
    link: "mailto:maurice@giftedtech.co.ke",
    label: "maurice@giftedtech.co.ke",
    accent: "border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20",
    btnColor: "bg-blue-500 hover:bg-blue-600 text-white",
    aos: "zoom-in",
  },
  {
    icon: MessageCircle,
    color: "bg-green-500",
    title: "WhatsApp",
    desc: "Chat with us directly on WhatsApp for quick support.",
    link: "https://wa.me/message/ZWHDTMQO5MTCB1",
    label: "Chat on WhatsApp",
    accent: "border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20",
    btnColor: "bg-green-500 hover:bg-green-600 text-white",
    aos: "zoom-in",
  },
  {
    icon: Globe,
    color: "bg-purple-500",
    title: "Website",
    desc: "Learn more about us and our other projects.",
    link: "https://giftedtech.co.ke",
    label: "giftedtech.co.ke →",
    accent: "border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-950/20",
    btnColor: "bg-purple-500 hover:bg-purple-600 text-white",
    aos: "flip-right",
  },
];

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormData>({ name: "", email: "", whatsapp: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { error?: string } } };
      setError(e2.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-12 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 data-aos="flip-down" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Contact <span className="text-emerald-500">Us</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="120" className="text-muted text-base">
            Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact channels — 3 cards, centered */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {channels.map((c, i) => (
            <div
              key={c.title}
              data-aos={c.aos}
              data-aos-delay={String(i * 100)}
              className={`border rounded-2xl p-6 text-center flex-1 min-w-[220px] max-w-[280px] ${c.accent}`}
            >
              <div className={`w-12 h-12 rounded-2xl ${c.color} center text-white mx-auto mb-4`}>
                <c.icon size={22} />
              </div>
              <h3 className="font-bold text-sm mb-1.5">{c.title}</h3>
              <p className="text-xs text-muted mb-4 leading-relaxed">{c.desc}</p>
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn h-9 px-5 rounded-xl text-xs font-semibold ${c.btnColor} transition-colors inline-flex`}
              >
                {c.label}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div data-aos="fade-up" data-aos-duration="700" className="bg-background border border-line rounded-2xl p-6 md:p-8">
            {sent ? (
              <div data-aos="zoom-in" className="text-center py-10">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full center mx-auto mb-4">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold font-outfit mb-2">Message Sent!</h3>
                <p className="text-muted text-sm max-w-sm mx-auto mb-6">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", whatsapp: "", subject: "", message: "" }); }}
                    className="btn h-10 px-6 rounded-xl bg-foreground text-sm font-medium"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 data-aos="fade-right" className="text-lg font-bold font-outfit mb-1">Send us a message</h2>
                <p data-aos="fade-right" data-aos-delay="60" className="text-sm text-muted mb-5">Fill in the form below and we'll get back to you within 24 hours.</p>

                {error && (
                  <div data-aos="shake" className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div data-aos="fade-right" data-aos-delay="80">
                      <label className="text-xs font-medium text-muted block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" value={form.name} onChange={set("name")} placeholder="John Doe"
                        className="w-full h-10 px-4 rounded-xl border border-line text-sm focus:border-emerald-500 transition-colors bg-background outline-none"
                      />
                    </div>
                    <div data-aos="fade-left" data-aos-delay="80">
                      <label className="text-xs font-medium text-muted block mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                        className="w-full h-10 px-4 rounded-xl border border-line text-sm focus:border-emerald-500 transition-colors bg-background outline-none"
                      />
                    </div>
                  </div>

                  <div data-aos="fade-up" data-aos-delay="100">
                    <label className="text-xs font-medium text-muted block mb-1.5">
                      WhatsApp Number <span className="text-xs text-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+254 712 345 678"
                      className="w-full h-10 px-4 rounded-xl border border-line text-sm focus:border-emerald-500 transition-colors bg-background outline-none"
                    />
                  </div>

                  <div data-aos="fade-up" data-aos-delay="140">
                    <label className="text-xs font-medium text-muted block mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" value={form.subject} onChange={set("subject")} placeholder="How can we help you?"
                      className="w-full h-10 px-4 rounded-xl border border-line text-sm focus:border-emerald-500 transition-colors bg-background outline-none"
                    />
                  </div>

                  <div data-aos="zoom-in-up" data-aos-delay="180">
                    <label className="text-xs font-medium text-muted block mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.message} onChange={set("message")}
                      placeholder="Describe your question or feedback in detail..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-line text-sm focus:border-emerald-500 transition-colors bg-background resize-none outline-none"
                    />
                  </div>

                  <div data-aos="zoom-in" data-aos-delay="220">
                    <ButtonWithLoader
                      type="submit"
                      loading={loading}
                      initialText="Send Message"
                      loadingText="Sending..."
                      className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors gap-2"
                    >
                      <Send size={16} />
                    </ButtonWithLoader>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
