import { PublicLayout } from "@/layouts";

export default function Privacy() {
  return (
    <PublicLayout>
      <section className="pt-12 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 data-aos="zoom-in" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Privacy <span className="text-emerald-500">Policy</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-muted text-base">
            Last updated: 13th March 2026
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-background border border-line rounded-2xl p-6 md:p-8 space-y-6 text-sm leading-relaxed">

            <div>
              <h2 className="font-bold text-base mb-2">1. Information We Collect</h2>
              <p className="text-muted">We collect information you provide when creating an account (name, email, username) and data generated through your use of the Service (monitor configurations, check history, response times).</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">2. How We Use Your Information</h2>
              <p className="text-muted">We use your information to provide and improve the Service, send email notifications about your monitors, and respond to support requests. We do not sell your personal information to third parties.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">3. Email Notifications</h2>
              <p className="text-muted">By using the Service, you consent to receive transactional emails related to your monitors (downtime alerts, recovery notifications, account verification). You can manage notification preferences in your profile settings.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">4. Data Storage</h2>
              <p className="text-muted">Your data is stored securely in our database. Passwords are hashed using bcrypt and are never stored in plain text. Check history is retained to provide uptime statistics.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">5. Cookies</h2>
              <p className="text-muted">We use session tokens (JWT) stored in your browser's local storage to maintain your login session. We do not use tracking cookies or third-party analytics cookies.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">6. Third-Party Services</h2>
              <p className="text-muted">We use Resend for transactional email delivery. Your email address is shared with Resend solely for the purpose of sending you notifications you have requested.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">7. Data Deletion</h2>
              <p className="text-muted">You may request deletion of your account and all associated data by contacting us. Admin users can also delete accounts through the admin panel.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">8. Changes to This Policy</h2>
              <p className="text-muted">We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a notice on the Service.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">9. Contact</h2>
              <p className="text-muted">
                For privacy questions or data requests, contact us at{" "}
                <a href="/contact" className="text-emerald-500 hover:underline">our contact page</a> or email{" "}
                <a href="mailto:maurice@giftedtech.co.ke" className="text-emerald-500 hover:underline">maurice@giftedtech.co.ke</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
