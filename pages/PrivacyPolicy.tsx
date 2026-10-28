import React from 'react';
import useSEO from '../hooks/useSEO';
import { canonical } from '../constants';
import PageHero from '../components/ui/PageHero';

// Change this date whenever the policy text changes
const LAST_UPDATED = '28 October 2026';

const Section: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
    <section id={id} className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">{title}</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            {children}
        </div>
    </section>
);

const PrivacyPolicy: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'Privacy Policy',
        description: 'How the CVOCA website handles your information: no forms, accounts, cookies or analytics, and the third-party services the site uses.',
        canonicalUrl: canonical('/privacy-policy'),
        noIndex: true
    });

    return (
        <div>
            <PageHero tone="light" title="Privacy Policy">
                <p className="mt-2 text-gray-600 dark:text-gray-300">Last updated: {LAST_UPDATED}</p>
            </PageHero>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Section title="In short" id="intro">
                    <p>This page explains what happens to your information when you visit cvoca.org. The website has no forms, no accounts, no cookies of its own and no analytics or tracking. CVOCA does not collect personal information through this website.</p>
                </Section>

                <Section title="1. What this website stores" id="storage">
                    <p>The only thing the website stores is your light or dark theme choice, saved in your browser's local storage on your own device. It is never sent to CVOCA. You can remove it at any time by clearing your browser's site data.</p>
                </Section>

                <Section title="2. Services this website uses" id="services">
                    <p>Like any website, cvoca.org relies on a few outside services. When your browser loads a page, these services receive standard technical information such as your IP address, browser type and the page you are viewing:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Render and Cloudflare</strong> host and deliver the website. They keep standard server logs to run the service and keep it secure.</li>
                        <li><strong>Google Fonts</strong> supplies the website's font.</li>
                        <li><strong>Google Sheets</strong> holds our events, committee and president's message content. Your browser loads it directly from Google.</li>
                        <li><strong>Google Maps</strong> shows our office on the Contact page. Google may set its own cookies inside the map.</li>
                        <li><strong>Cloudinary and Unsplash</strong> host some of the images on the website.</li>
                    </ul>
                    <p>Each of these services handles that information under its own privacy policy.</p>
                </Section>

                <Section title="3. Registration, payments and messages" id="registration">
                    <p>Membership and event registrations, payments and messages happen on other services that our buttons link to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Razorpay</strong> for payments and registration pages.</li>
                        <li><strong>Google Forms</strong> for some registrations.</li>
                        <li><strong>WhatsApp</strong> if you choose to message a coordinator.</li>
                    </ul>
                    <p>What you enter there is handled by that service under its own terms, and is shared with CVOCA so we can run your membership or the event you signed up for. We do not sell, trade or rent your personal information.</p>
                    <p>The website also links to our annual reports on Google Drive, our blog and our social media pages. Those sites have their own privacy policies.</p>
                </Section>

                <Section title="4. Your choices" id="choices">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>You can block or clear cookies and site data in your browser settings.</li>
                        <li>To see, correct or delete registration details that CVOCA holds about you, contact us using the details below.</li>
                    </ul>
                </Section>

                <Section title="5. Contact us" id="contact">
                    <p>For any privacy question, please contact us:</p>
                    <p><strong>Email:</strong> <a href="mailto:info@cvoca.org" className="text-primary dark:text-primary-light underline hover:no-underline">info@cvoca.org</a></p>
                    <p><strong>Address:</strong> 304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E), Mumbai 400014, Maharashtra</p>
                </Section>

                <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                    <h2 className="font-bold mb-2">Changes to this page</h2>
                    <p>If the way the website handles information changes, for example if we add a contact form or analytics, we will update this page and the date at the top.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
