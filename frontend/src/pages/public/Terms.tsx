import { PublicLayout } from "@/layouts";

export default function Terms() {
  return (
    <PublicLayout>
      <section className="pt-12 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 data-aos="zoom-in" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Terms of <span className="text-emerald-500">Service</span>
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
              <h2 className="font-bold text-base mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted">By accessing or using Gifted Monitor ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">2. Description of Service</h2>
              <p className="text-muted">Gifted Monitor provides uptime monitoring for websites and APIs, including email notifications for downtime events. The Service is provided as-is and may change at any time.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">3. Account Responsibility</h2>
              <p className="text-muted">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">4. Acceptable Use</h2>
              <p className="text-muted">You agree not to use the Service to monitor services you do not own or have permission to monitor. Abusive use, including excessive pinging of third-party services, is prohibited.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">5. Service Availability</h2>
              <p className="text-muted">We strive for high availability but do not guarantee 100% uptime. The Service may be interrupted for maintenance or due to circumstances beyond our control.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">6. Limitation of Liability</h2>
              <p className="text-muted">Gifted Monitor and Gifted Tech shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including missed downtime alerts.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">7. Termination</h2>
              <p className="text-muted">We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior, without prior notice.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">8. Changes to Terms</h2>
              <p className="text-muted">We may update these terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the new terms.</p>
            </div>

            <div>
              <h2 className="font-bold text-base mb-2">9. Contact</h2>
              <p className="text-muted">
                For questions about these terms, contact us at{" "}
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
