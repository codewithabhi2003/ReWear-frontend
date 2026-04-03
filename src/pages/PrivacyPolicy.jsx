import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const updated = 'April 2025';

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: 12,
        paddingBottom: 8, borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '90px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>
          ← Back to ReWear
        </Link>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 20, marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Last updated: {updated}</p>
      </div>

      {/* Intro */}
      <div style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 36, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        Welcome to ReWear. We care about your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. By using ReWear, you agree to the practices described here.
      </div>

      <Section title="1. Information We Collect">
        <p><strong style={{ color: 'var(--text-primary)' }}>Account information:</strong> When you register, we collect your name, email address, and password (stored as a secure hash).</p>
        <p style={{ marginTop: 10 }}><strong style={{ color: 'var(--text-primary)' }}>Profile information:</strong> Optionally, your phone number, profile photo, and shipping address.</p>
        <p style={{ marginTop: 10 }}><strong style={{ color: 'var(--text-primary)' }}>Listing information:</strong> Product titles, descriptions, photos, prices, and condition that sellers provide.</p>
        <p style={{ marginTop: 10 }}><strong style={{ color: 'var(--text-primary)' }}>Transaction data:</strong> Order details, shipping addresses, and payment confirmation IDs (we do not store card numbers — payments are handled by Razorpay).</p>
        <p style={{ marginTop: 10 }}><strong style={{ color: 'var(--text-primary)' }}>Messages:</strong> Chat messages between buyers and sellers are stored to provide the service and resolve disputes.</p>
        <p style={{ marginTop: 10 }}><strong style={{ color: 'var(--text-primary)' }}>Usage data:</strong> Browser type, IP address, and pages visited, collected automatically to improve performance.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>To operate and improve the ReWear marketplace</li>
          <li>To process orders and facilitate payments via Razorpay</li>
          <li>To enable chat and negotiation between buyers and sellers</li>
          <li>To send you order confirmations, notifications, and support messages</li>
          <li>To detect and prevent fraud, abuse, or violations of our Terms</li>
          <li>To comply with applicable Indian laws and regulations</li>
        </ul>
        <p style={{ marginTop: 12 }}>We do <strong style={{ color: 'var(--text-primary)' }}>not</strong> sell your personal information to third parties.</p>
      </Section>

      <Section title="3. Information Sharing">
        <p>We share your information only in these limited circumstances:</p>
        <ul style={{ paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong style={{ color: 'var(--text-primary)' }}>With other users:</strong> Your public profile name and listings are visible to other users. Your shipping address is shared with the seller only after a confirmed order.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>With Razorpay:</strong> Payment data is handled by Razorpay under their privacy policy.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>With Cloudinary:</strong> Product and profile images are stored on Cloudinary's servers.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Legal requirements:</strong> If required by Indian law or a valid court order.</li>
        </ul>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>Your data is stored on MongoDB Atlas servers. We use industry-standard security practices including HTTPS encryption, hashed passwords (bcrypt), and JWT authentication tokens with expiry.</p>
        <p style={{ marginTop: 10 }}>While we take security seriously, no system is perfectly secure. Please use a strong, unique password for your account.</p>
      </Section>

      <Section title="5. Cookies">
        <p>ReWear uses minimal local storage (not cookies) to keep you logged in via your authentication token. We do not use tracking or advertising cookies.</p>
      </Section>

      <Section title="6. Your Rights">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong style={{ color: 'var(--text-primary)' }}>Access:</strong> You can view your profile information at any time.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Correction:</strong> You can update your name, phone, and address in your profile settings.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Deletion:</strong> You can request deletion of your account by contacting us at support@rewear.in. We will delete your personal data within 30 days, subject to legal retention requirements.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Portability:</strong> You can request a copy of your data by contacting support.</li>
        </ul>
      </Section>

      <Section title="7. Children's Privacy">
        <p>ReWear is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us.</p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of ReWear after changes constitutes acceptance of the new policy.</p>
      </Section>

      <Section title="9. Contact Us">
        <p>If you have questions about this Privacy Policy or your data, please contact us:</p>
        <div style={{ marginTop: 12, padding: '14px 18px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> support@rewear.in</p>
          <p style={{ marginTop: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Address:</strong> ReWear, India</p>
        </div>
      </Section>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>
          ← Back to ReWear
        </Link>
      </div>
    </div>
  );
}