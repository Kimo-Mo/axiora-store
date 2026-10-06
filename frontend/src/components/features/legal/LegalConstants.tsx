import { FileText, Lock, RefreshCcw, Settings2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const LegalTerms = () => (
  <div className="space-y-12 text-foreground/90 leading-relaxed">
    {/* Header */}
    <header className="space-y-2 pb-8 border-b border-white/10">
      <h1 className="text-4xl font-black text-white tracking-tight">Terms of Service</h1>
      <p className="text-primary font-bold tracking-wide uppercase text-xs">Effective Date: March 2026</p>
    </header>

    <section className="space-y-4">
      <p className="text-lg text-white font-medium">
        Welcome to <strong>Axiora Store</strong>. By accessing or using our website and services, you agree to be bound by these Terms of Service.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 1 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">1. Company Information</h2>
      <p>
        Axiora Store is a digital commerce company providing digital products, including game keys, gift cards, software licenses, and in-game content.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 2 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">2. Eligibility</h2>
      <p>
        You must be at least 18 years old or have permission from a legal guardian to use our services.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 3 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">3. Use of the Website</h2>
      <p>You agree not to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Use the website for illegal purposes</li>
        <li>Attempt to hack, disrupt, or abuse the system</li>
        <li>Misrepresent your identity or payment details</li>
      </ul>
      <p className="pt-2">
        We reserve the right to request identity verification (KYC) for transactions flagged by our security systems.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 4 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">4. Account Responsibility</h2>
      <p>If you create an account:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>You are responsible for maintaining its security</li>
        <li>All activity under your account is your responsibility</li>
        <li>Sharing account access is strictly prohibited</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 5 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">5. Digital Products</h2>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>All products are digital and delivered electronically</li>
        <li>Products may have region, platform, or language restrictions</li>
        <li>You are responsible for verifying compatibility before purchase</li>
      </ul>
      <p className="pt-2 italic opacity-80">
        Axiora Store is not responsible for any changes made by developers after purchase.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 6 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">6. Delivery Policy</h2>
      <p>Delivery is typically instant after successful payment.</p>
      <p className="font-bold text-white pt-2">Delivery methods may include:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Automated on-site system</li>
        <li>Email delivery</li>
        <li>User account dashboard</li>
      </ul>
      <p className="font-bold text-white pt-4">Delays may occur due to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Payment verification</li>
        <li>Security checks</li>
        <li>Technical or third-party issues</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 7 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">7. Product Usage Disclaimer</h2>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Digital keys must be redeemed on third-party platforms (e.g., Steam, Xbox)</li>
        <li>We are not responsible for bans, suspensions, or restrictions imposed by these platforms</li>
        <li>Once a key is revealed, it is considered delivered and used</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 8 */}
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">8. Refund & Replacement Policy</h2>
      <p className="font-bold text-primary italic">All sales are final once the product is delivered or revealed.</p>
      
      <div className="space-y-4">
        <p className="text-white font-bold underline underline-offset-4 decoration-primary/50">Refunds or replacements are ONLY eligible if:</p>
        <ul className="list-disc ms-6 space-y-2 opacity-80">
          <li>The key is proven invalid, unused, or revoked</li>
          <li>The issue is reported within 72 hours of purchase</li>
        </ul>
      </div>

      <div className="space-y-4 pt-4">
        <p className="text-white font-bold underline underline-offset-4 decoration-destructive/50">Refunds are NOT granted if:</p>
        <ul className="list-disc ms-6 space-y-2 opacity-80">
          <li>You purchased the wrong region/platform</li>
          <li>You changed your mind</li>
          <li>The product is incompatible with your system</li>
        </ul>
      </div>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 9 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">9. Chargebacks & Fraud</h2>
      <p>Unauthorized chargebacks or disputes are strictly prohibited.</p>
      <p className="font-bold text-white pt-2">We reserve the right to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Suspend or permanently ban accounts</li>
        <li>Block future transactions</li>
        <li>Report activity to payment processors</li>
        <li>Take legal action if necessary</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 10 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">10. Pricing & Orders</h2>
      <p className="font-bold text-white">We reserve the right to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Change prices at any time without notice</li>
        <li>Cancel orders due to pricing errors or suspected fraud</li>
        <li>Limit quantities per user</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 11 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">11. Errors & Inaccuracies</h2>
      <p>We reserve the right to correct any errors related to pricing or product information.</p>
      <p>If an error is identified after purchase, we may cancel the order and issue a full refund.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 12 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">12. Personal Use Only</h2>
      <p>All products are intended for personal use only.</p>
      <p className="text-primary font-bold">Reselling or commercial use without written permission is strictly prohibited.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 13 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">13. Intellectual Property</h2>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>All website content is owned by <strong>Axiora Store</strong></li>
        <li>All trademarks, brands, and game titles belong to their respective owners</li>
        <li>We are not affiliated with any publishers or developers</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 14 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">14. Limitation of Liability</h2>
      <p className="italic">All services are provided &ldquo;as is&rdquo;.</p>
      <p className="font-bold text-white pt-2">Axiora Store is not liable for:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Indirect or consequential damages</li>
        <li>Loss of access due to third-party platforms</li>
        <li>User misuse or incorrect purchases</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 15 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">15. Dispute Resolution</h2>
      <p>Users must contact our support team before initiating any dispute or chargeback.</p>
      <p>We will attempt to resolve issues promptly and fairly.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 16 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">16. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Wyoming, United States.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 17 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">17. Force Majeure</h2>
      <p>Axiora Store is not responsible for delays or failures caused by events beyond our control, including:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>System outages</li>
        <li>Internet disruptions</li>
        <li>Third-party service failures</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 18 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">18. Third-Party Services</h2>
      <p>
        We rely on third-party services and platforms.
        We are not responsible for their actions, policies, or failures.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 19 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">19. User Responsibility for Purchases</h2>
      <p>Users are responsible for ensuring product compatibility, including:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Region</li>
        <li>Platform</li>
        <li>System requirements</li>
      </ul>
      <p className="pt-2 text-destructive font-bold">Mistaken purchases are not eligible for refunds.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 20 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">20. Suspension & Termination</h2>
      <p>We may suspend or terminate accounts without notice in cases of:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Policy violations</li>
        <li>Fraud</li>
        <li>Suspicious activity</li>
      </ul>
      <p className="pt-2 font-bold text-destructive">No refunds will be issued in such cases.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 21 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">21. Changes to Terms</h2>
      <p>
        We reserve the right to update these Terms at any time.
        Continued use of the website constitutes acceptance of any updates.
      </p>
    </section>

    {/* Contact Info Footer Card */}
    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-6 mt-16 relative overflow-hidden group">
      <div className="absolute top-0 inset-e-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <FileText size={120} />
      </div>
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-extrabold text-white">22. Contact Information</h2>
        <div className="space-y-2 text-white/80">
          <p className="text-lg font-bold text-white">Axiora Store</p>
          <p>1021 E Lincolnway, 9861</p>
          <p>Cheyenne, WY 82001</p>
          <p>United States</p>
          <div className="pt-4 flex items-center gap-3">
            <span className="size-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📧</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider opacity-50 font-bold">Email Support</span>
              <a href="mailto:support@axiora-store.com" className="text-primary hover:underline font-bold text-lg">support@axiora-store.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const LegalPrivacy = () => (
  <div className="space-y-12 text-foreground/90 leading-relaxed">
    {/* Header */}
    <header className="space-y-2 pb-8 border-b border-white/10">
      <h1 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
      <p className="text-primary font-bold tracking-wide uppercase text-xs">Effective Date: March 2026</p>
    </header>

    <section className="space-y-4">
      <p className="text-lg text-white font-medium">
        <strong>Axiora Store</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal information.
      </p>
      <p>
        This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 1 */}
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">1. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-white">Personal Information</h3>
          <p className="opacity-80">Such as your name, email address, billing details, and any information you provide when contacting us or making a purchase.</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-white">Technical Information</h3>
          <p className="opacity-80">Including IP address, browser type, device information, and usage data.</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <h3 className="text-lg font-bold text-white">Transaction Information</h3>
          <p className="opacity-80">Details related to purchases, payments, and order history.</p>
        </div>
      </div>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 2 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">2. How We Use Information</h2>
      <p>We use collected information to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Process orders and deliver digital products</li>
        <li>Communicate with users and provide support</li>
        <li>Improve website performance and user experience</li>
        <li>Detect and prevent fraud, abuse, and unauthorized access</li>
        <li>Comply with legal obligations</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 3 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">3. Payment Processing</h2>
      <p>
        Payments are processed through secure third-party payment providers. 
        <strong> We do not store full payment card details on our servers.</strong>
      </p>
      <p>
        Payment providers may collect and process your information according to their own privacy policies.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 4 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">4. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar technologies to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Improve website functionality</li>
        <li>Analyze traffic and usage patterns</li>
        <li>Enhance user experience</li>
      </ul>
      <p className="pt-2 italic">
        You may disable cookies through your browser settings; however, some features of the website may not function properly.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 5 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">5. Data Sharing</h2>
      <p>We do not sell or rent your personal information.</p>
      <p className="font-bold text-white pt-2">We may share information with:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Payment processors</li>
        <li>Fraud prevention and security services</li>
        <li>Service providers necessary to operate our website</li>
      </ul>
      <p className="pt-2 font-medium">All third parties are required to handle your data securely.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 6 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">6. Data Retention</h2>
      <p>We retain personal information only as long as necessary to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Fulfill the purposes outlined in this policy</li>
        <li>Comply with legal and financial obligations</li>
        <li>Resolve disputes and enforce our agreements</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 7 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your data from unauthorized access, loss, or misuse.
      </p>
      <p className="text-destructive font-bold pt-2 italic">
        However, no system can be guaranteed to be 100% secure.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 8 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">8. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Request access to your personal data</li>
        <li>Request correction or deletion of your data</li>
        <li>Object to or restrict processing</li>
        <li>Request data portability</li>
      </ul>
      <p className="pt-2">To exercise any of these rights, please contact us.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 9 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">9. Third-Party Links</h2>
      <p>
        Our website may contain links to external websites. 
        We are not responsible for the privacy practices or content of those websites.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 10 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">10. Policy Updates</h2>
      <p>
        We may update this Privacy Policy at any time. 
        Updates will be posted on this page.
      </p>
    </section>

    {/* Contact Info Footer Card */}
    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-6 mt-16 relative overflow-hidden group">
      <div className="absolute top-0 inset-e-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Lock size={120} />
      </div>
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-extrabold text-white">11. Contact Information</h2>
        <div className="space-y-2 text-white/80">
          <p className="text-lg font-bold text-white">Axiora Store</p>
          <p>1021 E Lincolnway, 9861</p>
          <p>Cheyenne, WY 82001</p>
          <p>United States</p>
          <div className="pt-4 flex items-center gap-3">
            <span className="size-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📧</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider opacity-50 font-bold">Email Support</span>
              <a href="mailto:support@axiora-store.com" className="text-primary hover:underline font-bold text-lg">support@axiora-store.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const LegalRefund = () => (
  <div className="space-y-12 text-foreground/90 leading-relaxed">
    {/* Header */}
    <header className="space-y-2 pb-8 border-b border-white/10">
      <h1 className="text-4xl font-black text-white tracking-tight">Refund Policy</h1>
      <p className="text-primary font-bold tracking-wide uppercase text-xs">Effective Date: March 2026</p>
    </header>

    <section className="space-y-4">
      <p className="text-lg text-white font-medium">
        At <strong>Axiora Store</strong>, we aim to provide a smooth and reliable experience for all customers.
      </p>
      <p>
        Due to the nature of digital products, this Refund Policy outlines the conditions under which refunds or replacements may be issued.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 1 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">1. General Policy</h2>
      <p>
        All products sold on our website are digital and delivered electronically.
        Once a digital product (such as a game key, gift card, or software license) has been delivered or revealed, the transaction is considered final and non-refundable.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 2 */}
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">2. Eligible Cases for Refund or Replacement</h2>
      <p className="font-bold text-white underline underline-offset-4 decoration-primary/50">Refunds or replacements may be considered ONLY in the following cases:</p>
      
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>The digital key is proven to be invalid, non-functional, or revoked before use.</li>
        <li>The issue is reported within 72 hours of the purchase date.</li>
        <li>The issue is verified by our support team with the required proof (see Section 7).</li>
      </ul>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4">
        <p className="font-bold text-white">If approved, we may provide:</p>
        <ul className="list-disc ms-6 space-y-2 opacity-80">
          <li>A replacement key for the same product, or</li>
          <li>A refund to the original payment method or store credit.</li>
        </ul>
      </div>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 3 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">3. Non-Refundable Situations</h2>
      <p className="font-bold text-destructive underline underline-offset-4 decoration-destructive/30">Refunds will NOT be issued in the following cases:</p>
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>The product has been successfully delivered and the key has been revealed.</li>
        <li>The customer purchased the wrong region, platform, or version.</li>
        <li>The product is incompatible with the customer&apos;s system or hardware.</li>
        <li>The customer changed their mind or is dissatisfied with the product.</li>
        <li>The product has already been used, activated, or redeemed.</li>
        <li>Issues caused by third-party platforms (e.g., account bans, regional restrictions, maintenance).</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 4 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">4. Delayed Orders</h2>
      <p>In rare cases, delivery may be delayed due to:</p>
      <ul className="list-disc ms-6 space-y-2 opacity-80">
        <li>Payment verification</li>
        <li>Security checks</li>
        <li>Technical issues</li>
      </ul>
      <p className="pt-2 font-bold text-primary italic">Refunds will not be issued for temporary delays. Customers are encouraged to contact support for updates.</p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 5 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">5. Chargebacks & Disputes</h2>
      <p>Initiating a chargeback or payment dispute without contacting our support team first is a violation of our Terms.</p>
      <p className="font-bold text-white pt-2">Axiora Store reserves the right to:</p>
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>Suspend or permanently ban accounts involved in disputes.</li>
        <li>Deny future purchases.</li>
        <li>Provide full evidence (delivery logs and terms acceptance) to payment processors to contest the dispute.</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 6 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">6. Fraud Prevention</h2>
      <p>We reserve the right to refuse refunds if:</p>
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>Fraudulent activity is suspected.</li>
        <li>False or manipulated evidence is submitted.</li>
        <li>Identity verification (KYC) is not completed when requested.</li>
      </ul>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 7 */}
    <section className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">7. How to Request a Refund</h2>
      <p>
        To report an issue, contact us at: <a href="mailto:support@axiora-store.com" className="text-primary hover:underline font-bold">support@axiora-store.com</a>
      </p>
      
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <p className="font-bold text-white underline underline-offset-4 decoration-primary/50">Your request must include:</p>
        <ul className="list-disc ms-6 space-y-3 opacity-80">
          <li>Order ID</li>
          <li>A clear description of the issue</li>
          <li>
            <span className="font-bold text-white">Proof of the error:</span>
            <ul className="list-circle ms-6 mt-2 space-y-1">
              <li>Clear screenshots, or</li>
              <li>A video showing the error message</li>
              <li className="text-sm italic">Including date, time, and platform (e.g., Steam, Xbox)</li>
            </ul>
          </li>
        </ul>
      </div>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 8 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">8. Processing Time</h2>
      <p>
        Approved refunds are typically processed within <strong>5–10 business days</strong>, depending on your payment provider&apos;s policies.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 9 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">9. Policy Updates</h2>
      <p>
        Axiora Store reserves the right to update this Refund Policy at any time. 
        Continued use of our services constitutes acceptance of any changes.
      </p>
    </section>

    {/* Final Support Card */}
    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-6 mt-16 relative overflow-hidden group">
      <div className="absolute top-0 inset-e-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <RefreshCcw size={120} />
      </div>
      <div className="relative z-10 space-y-4 text-center">
        <h2 className="text-2xl font-extrabold text-white">Need immediate help?</h2>
        <p className="opacity-80 max-w-lg mx-auto">
          Our support team is here to assist you with any order issues or refund requests.
        </p>
        <div className="pt-4 flex flex-col items-center gap-3">
          <a href="mailto:support@axiora-store.com" className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform">
            Contact Support via Email
          </a>
          <span className="text-sm opacity-50 font-bold uppercase tracking-widest">support@axiora-store.com</span>
        </div>
      </div>
    </section>
  </div>
);

export const LegalCookiePolicy = () => (
  <div className="space-y-12 text-foreground/90 leading-relaxed">
    {/* Header */}
    <header className="space-y-2 pb-8 border-b border-white/10">
      <h1 className="text-4xl font-black text-white tracking-tight">Cookie Policy</h1>
      <p className="text-primary font-bold tracking-wide uppercase text-xs">Effective Date: March 2026</p>
    </header>

    <section className="space-y-4">
      <p className="text-lg text-white font-medium">
        This Cookie Policy explains how <strong>Axiora Store</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses cookies and similar technologies when you visit our website.
      </p>
      <p>
        By using our website, you can choose to accept or manage your cookie preferences at any time.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 1 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help improve your browsing experience, remember your preferences, and provide insights into how the website is used.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 2 */}
    <section className="space-y-8">
      <h2 className="text-2xl font-extrabold text-white">2. Types of Cookies We Use</h2>
      <p>We use the following types of cookies:</p>

      <div className="grid gap-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary text-sm">a</span>
            Necessary Cookies
          </h3>
          <p>These cookies are essential for the website to function properly. They enable core features such as:</p>
          <ul className="list-disc ms-6 space-y-2 opacity-80">
            <li>Secure login</li>
            <li>Order processing</li>
            <li>Fraud prevention</li>
          </ul>
          <p className="text-sm font-bold text-primary/80 italic pt-2">Note: These cookies cannot be disabled.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary text-sm">b</span>
            Analytics Cookies
          </h3>
          <p>These cookies help us understand how visitors interact with our website by collecting data such as:</p>
          <ul className="list-disc ms-6 space-y-2 opacity-80">
            <li>Pages visited</li>
            <li>Time spent on the site</li>
            <li>Device and browser type</li>
          </ul>
          <p>This data is used to improve website performance and user experience.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary text-sm">c</span>
            Functional Cookies
          </h3>
          <p>These cookies allow the website to remember your preferences, such as:</p>
          <ul className="list-disc ms-6 space-y-2 opacity-80">
            <li>Language</li>
            <li>Region</li>
            <li>User settings</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary text-sm">d</span>
            Marketing Cookies
          </h3>
          <p>These cookies may be used to:</p>
          <ul className="list-disc ms-6 space-y-2 opacity-80">
            <li>Deliver relevant advertisements</li>
            <li>Measure the effectiveness of marketing campaigns</li>
            <li>Track user activity across websites</li>
          </ul>
          <p className="text-sm font-bold text-primary/80 italic pt-2">Note: These cookies are only used with your consent.</p>
        </div>
      </div>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 3 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">3. How We Use Cookies</h2>
      <p>We use cookies to:</p>
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>Ensure website functionality</li>
        <li>Improve performance and usability</li>
        <li>Analyze traffic and user behavior</li>
        <li>Prevent fraud and enhance security</li>
      </ul>
      <p className="pt-4">
        Cookies may be stored on your device for different periods depending on their purpose.
        Some cookies are deleted when you close your browser, while others may remain for a longer period.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 4 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">4. Managing Your Cookie Preferences</h2>
      <p>When you first visit our website, you will be presented with a cookie banner allowing you to:</p>
      <ul className="list-disc ms-6 space-y-3 opacity-80">
        <li>Accept all cookies</li>
        <li>Reject non-essential cookies</li>
        <li>Customize your preferences</li>
      </ul>
      <p className="pt-4">
        We only use non-essential cookies based on your consent.
        You can change your preferences at any time through the cookie settings on our website or through your browser settings.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 5 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">5. Third-Party Cookies</h2>
      <p>
        We may use third-party services such as analytics tools, payment providers, or marketing platforms that place cookies on your device.
        These third parties process data according to their own privacy policies, and we are not responsible for their practices.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 6 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">6. Data Protection</h2>
      <p>
        Any data collected through cookies is handled in accordance with our <Link href="/legal?tab=privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>.
      </p>
    </section>

    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

    {/* Section 7 */}
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold text-white">7. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy at any time. Updates will be posted on this page.
      </p>
    </section>

    {/* Contact Info Footer Card */}
    <section className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-6 mt-16 relative overflow-hidden group">
      <div className="absolute top-0 inset-e-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Settings2 size={120} />
      </div>
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-extrabold text-white">8. Contact Information</h2>
        <div className="space-y-2 text-white/80">
          <p className="text-lg font-bold text-white">Axiora Store</p>
          <p>1021 E Lincolnway, 9861</p>
          <p>Cheyenne, WY 82001</p>
          <p>United States</p>
          <div className="pt-4 flex items-center gap-3">
            <span className="size-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📧</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider opacity-50 font-bold">Email Support</span>
              <a href="mailto:support@axiora-store.com" className="text-primary hover:underline font-bold text-lg">support@axiora-store.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const LEGAL_DOCS = [
  {
    id: 'terms',
    label: 'Terms & Conditions',
    icon: FileText,
    component: LegalTerms,
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: Lock,
    component: LegalPrivacy,
  },
  {
    id: 'refunds',
    label: 'Refund Policy',
    icon: RefreshCcw,
    component: LegalRefund,
  },
  {
    id: 'cookie',
    label: 'Cookie Policy',
    icon: Settings2,
    component: LegalCookiePolicy,
  },
];
