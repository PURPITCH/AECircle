import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-blue-400 mb-3">{title}</h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
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
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">aircraft.engineer · Last updated: May 2026</p>
          <p className="text-gray-400 text-sm mt-4">
            aircraft.engineer is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
          </p>
        </div>

        <Section title="1. Who We Are">
          <p>aircraft.engineer is operated by Aircraft Engineer LLC, a Wyoming limited liability company. We are an aviation professional network connecting engineers, employers, training organisations, and examination providers worldwide.</p>
          <p>For privacy matters, contact us at: <span className="text-blue-400">privacy@aircraft.engineer</span></p>
        </Section>

        <Section title="2. Data We Collect">
          <p><strong className="text-white">Account data</strong> — When you register, we collect your email address and password (encrypted). Company accounts also provide entity name, type, and contact details.</p>
          <p><strong className="text-white">Profile data (engineers)</strong> — Name, photo, designation, nationality, location, phone number, date of birth, physical details, licenses and endorsements, work experience, training records, and additional information you choose to add.</p>
          <p><strong className="text-white">Profile data (companies)</strong> — Entity name, type, activity, location, website, contact details, logo, and about information.</p>
          <p><strong className="text-white">Listing data</strong> — Job posts, training listings, and exam listings submitted by company accounts.</p>
          <p><strong className="text-white">Usage data</strong> — Pages visited, features used, and actions taken on the platform. We do not use third-party tracking cookies.</p>
          <p><strong className="text-white">Communications</strong> — Emails sent to our support addresses.</p>
        </Section>

        <Section title="3. How We Use Your Data">
          <p><strong className="text-white">To operate the platform</strong> — Displaying your CV profile, matching you with relevant opportunities, and enabling companies to post listings.</p>
          <p><strong className="text-white">AI matching</strong> — When your job search status is "Actively looking" or "Open to offers," your profile data is used to generate anonymised match scores against job listings. You can opt out by setting your status to "Not looking."</p>
          <p><strong className="text-white">Communications</strong> — Sending account-related emails such as confirmation, password reset, and important platform updates. We do not send marketing emails without your consent.</p>
          <p><strong className="text-white">Platform improvement</strong> — Analysing usage patterns to improve features and fix issues. This is done on aggregated, anonymised data.</p>
        </Section>

        <Section title="4. Who Can See Your Data">
          <div className="bg-gray-800 rounded-lg p-4 space-y-3 text-xs">
            <div>
              <p className="text-white font-medium mb-1">Your name and designation</p>
              <p className="text-gray-400">Visible to all users including non-logged in visitors (unless profile is hidden)</p>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-medium mb-1">Your email and phone number</p>
              <p className="text-gray-400">Hidden by default · Blurred for non-premium viewers · Completely hidden if you toggle OFF in Privacy Settings</p>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-medium mb-1">Your CV details (licenses, experience, training)</p>
              <p className="text-gray-400">Visible to logged-in users unless profile is set to hidden</p>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-medium mb-1">Your match score</p>
              <p className="text-gray-400">Only visible to recruiters if you applied to their listing or are set to "Open to offers"</p>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <p className="text-white font-medium mb-1">Your date of birth, height, weight</p>
              <p className="text-gray-400">Shown as age and measurements — exact date of birth is never displayed publicly</p>
            </div>
          </div>
        </Section>

        <Section title="5. Your Privacy Controls">
          <p>You have full control over your data visibility through Account Settings → Privacy Settings:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Show or hide your email from recruiters</li>
            <li>Show or hide your phone number from recruiters</li>
            <li>Show or hide your profile URL</li>
            <li>Make your entire profile visible or hidden</li>
            <li>Control your job search status (affects AI matching)</li>
          </ul>
          <p>Changes to privacy settings take effect immediately.</p>
        </Section>

        <Section title="6. Data Storage & Security">
          <p><strong className="text-white">Storage</strong> — Your data is stored securely on Supabase infrastructure hosted on AWS. Data is encrypted at rest and in transit.</p>
          <p><strong className="text-white">Passwords</strong> — Passwords are never stored in plain text. We use industry-standard encryption.</p>
          <p><strong className="text-white">Photos and logos</strong> — Uploaded images are stored in secure cloud storage with access controls.</p>
          <p><strong className="text-white">Security incidents</strong> — In the event of a data breach affecting your personal data, we will notify you within 72 hours as required by GDPR.</p>
        </Section>

        <Section title="7. Data Retention">
          <p><strong className="text-white">Active accounts</strong> — We retain your data for as long as your account is active.</p>
          <p><strong className="text-white">Deleted accounts</strong> — When you delete your account through Account Settings, all your personal data is permanently deleted within 30 days. Anonymised, aggregated usage statistics may be retained.</p>
          <p><strong className="text-white">Company listings</strong> — Expired or deleted listings are removed from public view immediately but may be retained in anonymised form for platform analytics.</p>
        </Section>

        <Section title="8. Your Rights (GDPR)">
          <p>If you are located in the European Economic Area, you have the following rights:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li><strong className="text-white">Right of access</strong> — Request a copy of all data we hold about you</li>
            <li><strong className="text-white">Right to rectification</strong> — Correct inaccurate data (you can do this directly in your profile)</li>
            <li><strong className="text-white">Right to erasure</strong> — Delete your account and all associated data</li>
            <li><strong className="text-white">Right to portability</strong> — Receive your data in a machine-readable format</li>
            <li><strong className="text-white">Right to object</strong> — Object to AI matching by setting your status to "Not looking"</li>
            <li><strong className="text-white">Right to restrict processing</strong> — Temporarily restrict how we use your data</li>
          </ul>
          <p>To exercise any of these rights, contact us at <span className="text-blue-400">privacy@aircraft.engineer</span>. We will respond within 30 days.</p>
        </Section>

        <Section title="9. Cookies">
          <p>aircraft.engineer uses only essential cookies required to keep you logged in and maintain your session. We do not use advertising cookies, tracking cookies, or third-party analytics cookies.</p>
          <p>You can disable cookies in your browser settings, but this will prevent you from staying logged in.</p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>We use the following third-party services to operate the platform:</p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex gap-3"><span className="text-gray-400 w-32">Supabase</span><span className="text-gray-300">Database, authentication, and file storage</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">Netlify</span><span className="text-gray-300">Website hosting and deployment</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">Anthropic</span><span className="text-gray-300">AI matching and processing (anonymised data only)</span></div>
          </div>
          <p>Each of these providers maintains their own privacy and security standards. We do not share personally identifiable information with these providers beyond what is necessary to operate the service.</p>
        </Section>

        <Section title="11. Children">
          <p>aircraft.engineer is not intended for use by anyone under the age of 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us at privacy@aircraft.engineer and we will delete the account.</p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>We may update this privacy policy from time to time. When we make significant changes, we will notify registered users by email and update the "Last updated" date at the top of this page.</p>
        </Section>

        <Section title="13. Contact">
          <p>For any privacy-related questions or requests:</p>
          <div className="bg-gray-800 rounded-lg p-4 space-y-1 text-xs">
            <div className="flex gap-3"><span className="text-gray-400 w-32">Privacy</span><span className="text-blue-400">privacy@aircraft.engineer</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">General</span><span className="text-blue-400">support@aircraft.engineer</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32">Address</span><span className="text-gray-300">Aircraft Engineer LLC, Wyoming, USA</span></div>
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-gray-700 text-xs text-gray-600 flex items-center justify-between">
          <span>Aircraft Engineer LLC · Wyoming, USA</span>
          <div className="flex gap-4">
            <Link to="/terms" className="text-blue-500 hover:text-blue-400">Terms & Conditions</Link>
            <Link to="/" className="text-blue-500 hover:text-blue-400">aircraft.engineer</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
