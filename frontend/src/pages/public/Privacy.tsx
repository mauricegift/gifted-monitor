import { PublicLayout } from "@/layouts";
import { Database, Bell, Eye, Lock, Cookie, Share2, Trash2, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: "We collect information you provide when creating an account (name, email, username) and data generated through your use of the Service (monitor configurations, check history, response times).",
    aos: "fade-right",
  },
  {
    icon: Database,
    title: "2. How We Use Your Information",
    content: "We use your information to provide and improve the Service, send email notifications about your monitors, and respond to support requests. We do not sell your personal information to third parties.",
    aos: "fade-left",
  },
  {
    icon: Bell,
    title: "3. Email Notifications",
    content: "By using the Service, you consent to receive transactional emails related to your monitors (downtime alerts, recovery notifications, account verification). You can manage notification preferences in your profile settings.",
    aos: "fade-right",
  },
  {
    icon: Lock,
    title: "4. Data Storage",
    content: "Your data is stored securely in our database. Passwords are hashed using bcrypt and are never stored in plain text. Check history is retained to provide uptime statistics.",
    aos: "fade-left",
  },
  {
    icon: Cookie,
    title: "5. Cookies",
    content: "We use session tokens (JWT) stored in your browser's local storage to maintain your login session. We do not use tracking cookies or third-party analytics cookies.",
    aos: "fade-right",
  },
  {
    icon: Share2,
    title: "6. Third-Party Services",
    content: "We use Resend for transactional email delivery. Your email address is shared with Resend solely for the purpose of sending you notifications you have requested.",
    aos: "fade-left",
  },
  {
    icon: Trash2,
    title: "7. Data Deletion",
    content: "You may request deletion of your account and all associated data by contacting us. Admin users can also delete accounts through the admin panel.",
    aos: "fade-right",
  },
  {
    icon: RefreshCw,
    title: "8. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a notice on the Service.",
    aos: "fade-left",
  },
  {
    icon: Mail,
    title: "9. Contact",
    content: null,
    aos: "fade-up",
  },
];

export default function Privacy() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-12 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div data-aos="zoom-in" className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Lock size={13} />
            Privacy
          </div>
          <h1 data-aos="zoom-in" data-aos-delay="50" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Privacy <span className="text-emerald-500">Policy</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="150" className="text-muted text-base">
            Last updated: 13th March 2026
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 pb-16 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((s, i) => (
            <div
              key={s.title}
              data-aos={s.aos}
              data-aos-delay={String(i * 60)}
              data-aos-duration="500"
              className="bg-background border border-line rounded-2xl p-5 md:p-6 flex gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                <s.icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm mb-1.5">{s.title}</h2>
                {s.content ? (
                  <p className="text-muted text-sm leading-relaxed">{s.content}</p>
                ) : (
                  <p className="text-muted text-sm leading-relaxed">
                    For privacy questions or data requests, contact us at{" "}
                    <a href="/contact" className="text-emerald-500 hover:underline">our contact page</a>{" "}
                    or email{" "}
                    <a href="mailto:maurice@gifted.co.ke" className="text-emerald-500 hover:underline">
                      maurice@gifted.co.ke
                    </a>.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
