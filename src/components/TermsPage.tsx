import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-blue-400 mb-3">{title}</h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Nav */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold text-white">aircraft.engineer</span>
        </Link>
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm">aircraft.engineer · Last updated: May 2026</p>
          <p className="text-gray-400 text-sm mt-4">
            By using aircraft.engineer you agree to these terms. Please read them carefully before creating an account or posting any content.
          </p>
        </div>

        <Section title="1. About aircraft.engineer">
          <p>
            aircraft.engineer is an aviation professional network operated by Aircraft Engineer LLC, a Wyoming limited liability company. The platform connects licensed aircraft engineers and maintenance professionals with employers, training organisations, and examination providers worldwide.
          </p>
        </Section>

        <Section title="2. User Accounts">
          <p><strong className="text-white">Engineer accounts</strong> — Registration is free for aviation professionals. You are responsible for the accuracy of information on your profile including licenses, endorsements, and experience records.</p>
          <p><strong className="text-white">Company accounts</strong> — Company, recruiter, training organisation, and examination provider accounts require either an invite code or payment of the applicable registration fee. You are responsible for the accuracy of all listings posted under your account.</p>
          <p><strong className="text-white">Account security</strong> — You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately at support@aircraft.engineer if you suspect unauthorised access.</p>
        </Section>

        <Section title="3. Engineer Profiles & CV Data">
          <p><strong className="text-white">Ownership</strong> — Your CV data belongs to you. aircraft.engineer does not claim ownership of your personal or professional information.</p>
          <p><strong className="text-white">Visibility</strong> — You control what information is visible through your Privacy Settings. Email and phone can be hidden from all viewers. Your profile can be set to completely hidden. Contact information is blurred for non-premium viewers by default.</p>
          <p><strong className="text-white">Data use</strong> — Your profile data may be used for AI-powered job matching as described in Section 7. Matching only occurs when your status is set to "Actively looking" or "Open to offers."</p>
        </Section>

        <Section title="4. Job, Training & Exam Listings">
          <p><strong className="text-white">Accuracy</strong> — Companies are responsible for ensuring all listings are accurate, lawful, and not misleading. aircraft.engineer reserves the right to remove listings that are inaccurate, discriminatory, or violate applicable employment laws.</p>
          <p><strong className="text-white">Current listing fees</strong></p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Job post</span><span className="text-white">USD 159 per listing</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Training listing</span><span className="text-white">USD 99 per listing</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Exam listing</span><span className="text-white">USD 99 per listing</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Company registration (from 2027)</span><span className="text-white">USD 49 / year basic · USD 99 / year premium</span></div>
          </div>
          <p>Fees are subject to change with 30 days notice to registered company accounts.</p>
          <p><strong className="text-white">Review</strong> — All listings are reviewed before going live. aircraft.engineer reserves the right to reject or remove any listing without refund if it violates these terms.</p>
        </Section>

        <Section title="5. Payments">
          <p><strong className="text-white">Current method</strong> — Payment is currently processed manually. You will be contacted at your registered email address to complete payment after submitting a listing.</p>
          <p><strong className="text-white">Refunds</strong> — Listing fees are non-refundable once a listing has been activated and made public.</p>
          <p><strong className="text-white">Company registration</strong> — First year registration is free during the launch period. Annual renewal fees apply from 2027.</p>
        </Section>

        <Section title="6. Privacy & Data Protection">
          <p><strong className="text-white">Data we collect</strong> — Account registration information, CV and professional profile data, listing information posted by companies, and usage data for platform improvement.</p>
          <p><strong className="text-white">Data sharing</strong> — We do not sell your personal data to third parties. Engineer contact information is only shared with premium company accounts when the engineer has consented through their privacy settings.</p>
          <p><strong className="text-white">Data retention</strong> — You may delete your account at any time through Account Settings. All associated data will be permanently deleted within 30 days.</p>
          <p><strong className="text-white">GDPR</strong> — For users in the European Economic Area, you have the right to access, correct, and delete your personal data. Contact privacy@aircraft.engineer for any data requests.</p>
        </Section>

        <Section title="7. AI Matching">
          <p><strong className="text-white">How it works</strong> — aircraft.engineer uses artificial intelligence to match engineer profiles with job listings. The system generates anonymised summaries of CVs and job requirements to calculate compatibility scores.</p>
          <p><strong className="text-white">Consent</strong> — AI matching only runs on your profile when your job search status is set to "Actively looking" or "Open to offers." Engineers with status "Not looking" are excluded from all matching.</p>
          <p><strong className="text-white">Recruiter access</strong> — Recruiters can only see your match score and profile if you have applied to their listing, or your privacy settings are set to "Open to offers."</p>
          <p><strong className="text-white">Accuracy</strong> — AI match scores are indicative only and should not be the sole basis for hiring decisions. aircraft.engineer does not guarantee the accuracy of match scores.</p>
        </Section>

        <Section title="8. Prohibited Use">
          <p>You may not use aircraft.engineer to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Post false, misleading, or fraudulent listings</li>
            <li>Scrape or harvest user data</li>
            <li>Impersonate another person or organisation</li>
            <li>Post content that discriminates unlawfully</li>
            <li>Circumvent platform fees by taking transactions off-platform</li>
            <li>Upload malicious code or attempt to compromise platform security</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>aircraft.engineer is a trademark of Aircraft Engineer LLC. User-generated content remains the property of its creator. By posting content on aircraft.engineer, you grant us a non-exclusive licence to display that content on the platform for the purpose of operating the service.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>aircraft.engineer is a platform connecting aviation professionals. We are not responsible for the outcome of job applications, training enrolments, exam registrations, or any employment decisions made using information on the platform.</p>
          <p>The platform is provided "as is" without warranty of any kind. We do not guarantee uninterrupted availability of the service.</p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>We may update these terms from time to time. Registered users will be notified by email of material changes. Continued use of the platform after notification constitutes acceptance of the updated terms.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These terms are governed by the laws of the State of Wyoming, United States. Any disputes shall be resolved in the courts of Wyoming.</p>
        </Section>

        <Section title="13. Contact">
          <div className="bg-gray-800 rounded-lg p-4 space-y-1 text-xs">
            <div className="flex gap-3"><span className="text-gray-400 w-32">General</span><span className="text-blue-400">support@aircraft.engineer</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">Privacy</span><span className="text-blue-400">privacy@aircraft.engineer</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">Companies</span><span className="text-blue-400">companies@aircraft.engineer</span></div>
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-gray-700 text-xs text-gray-600 flex items-center justify-between">
          <span>Aircraft Engineer LLC · Wyoming, USA</span>
          <Link to="/" className="text-blue-500 hover:text-blue-400">aircraft.engineer</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
