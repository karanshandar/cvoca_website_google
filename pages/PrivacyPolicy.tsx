import React from 'react';

const Section: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
    <section id={id} className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">{title}</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            {children}
        </div>
    </section>
);

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="animate-fadeIn">
            <div className="bg-primary/10 dark:bg-primary/5 pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Privacy Policy</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Section title="Introduction" id="intro">
                    <p>CVOCA ('we,' 'us,' 'our,' or 'Company') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you visit our website and use our services.</p>
                </Section>
                
                <Section title="1. Information We Collect" id="collection">
                    <h3 className="font-semibold text-lg">Personal Information You Provide:</h3>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>Contact Forms:</strong> Name, email, phone number, message.</li>
                        <li><strong>Membership Registration:</strong> Name, email, qualifications, registration number, contact details.</li>
                        <li><strong>Event Registration:</strong> Name, email, organization, event preferences.</li>
                        <li><strong>Communications:</strong> Email for newsletters and announcements.</li>
                    </ul>
                    <h3 className="font-semibold text-lg mt-4">Automatically Collected Information:</h3>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>Log Data:</strong> IP address, browser type, pages visited, timestamps, referring URLs.</li>
                        <li><strong>Device Information:</strong> Device type, operating system, device identifiers.</li>
                        <li><strong>Usage Data:</strong> Interaction patterns, pages viewed, time spent on pages.</li>
                        <li><strong>Cookies & Similar Technologies:</strong> Session identifiers, preferences, analytics tracking.</li>
                    </ul>
                </Section>
                
                <Section title="2. How We Use Your Information" id="usage">
                     <ul className="list-disc list-inside ml-4">
                        <li><strong>Service Provision:</strong> To provide, maintain, and improve our website and services.</li>
                        <li><strong>Communication:</strong> To respond to inquiries, send confirmations, and provide customer support.</li>
                        <li><strong>Marketing:</strong> To send newsletters, event announcements, and updates (with your consent).</li>
                        <li><strong>Analytics:</strong> To analyze usage patterns, troubleshoot issues, and improve user experience.</li>
                        <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms of service.</li>
                        <li><strong>Membership Management:</strong> To administer membership benefits and programs.</li>
                    </ul>
                </Section>
                
                <Section title="3. Data Sharing & Disclosure" id="sharing">
                    <p><strong>General Policy:</strong> We do not sell, trade, or rent your personal information to third parties.</p>
                    <p><strong>Exceptions:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>Service Providers:</strong> Vendors for website operation, email delivery, analytics.</li>
                        <li><strong>Legal Requirements:</strong> When required by law, court order, or government requests.</li>
                        <li><strong>Business Transfers:</strong> In case of a merger, acquisition, or asset sale.</li>
                        <li><strong>Consent:</strong> With other parties when explicitly consented by you.</li>
                    </ul>
                </Section>

                <Section title="4. Data Security" id="security">
                     <p>We implement a variety of security measures to maintain the safety of your personal information, including:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>HTTPS encryption for all data transmissions.</li>
                        <li>Secure password storage with encryption.</li>
                        <li>Regular security audits and vulnerability assessments.</li>
                        <li>Limited access to data based on job function.</li>
                    </ul>
                    <p className="mt-4 italic"><strong>Disclaimer:</strong> No method of transmission over the Internet is 100% secure. While we implement strong security measures, we cannot guarantee absolute security.</p>
                </Section>

                <Section title="5. Your Rights & Choices" id="rights">
                    <p>You have the following rights regarding your personal information:</p>
                     <ul className="list-disc list-inside ml-4">
                        <li><strong>Access:</strong> Request a copy of your personal information.</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate information.</li>
                        <li><strong>Deletion:</strong> Request deletion of your information (subject to legal obligations).</li>
                        <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications.</li>
                        <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time.</li>
                    </ul>
                </Section>

                <Section title="6. Cookies & Tracking Technologies" id="cookies">
                    <p>We use cookies to enhance your experience. You can control cookie preferences through your browser settings.</p>
                </Section>

                <Section title="7. Contact Us" id="contact">
                    <p>For any privacy-related questions, please contact us:</p>
                    <p><strong>Email:</strong> president@cvoca.org</p>
                    <p><strong>Address:</strong> 304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E), Mumbai 400014, Maharashtra</p>
                </Section>

                 <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                    <h3 className="font-bold mb-2">Policy Changes</h3>
                    <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 'Last Updated' date. Your continued use of our website after changes constitutes your acceptance of the updated Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;