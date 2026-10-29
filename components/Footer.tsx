import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ContactData, SocialMediaData } from '../types';
import { fetchJson } from '../utils/fetchJson';
import { getContactHref } from '../utils/contactLinks';

const SocialIcon: React.FC<{ href: string, path: string, name: string }> = ({ href, path, name }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={name}
    >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d={path} />
        </svg>
    </a>
);

// Footer text links: padded for tapping, primary on hover, branded focus ring
const LINK_CLASS = 'inline-block py-1 hover:text-primary dark:hover:text-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-light focus-visible:rounded';

const Footer: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [socialData, setSocialData] = useState<SocialMediaData | null>(null);

    // The static parts of the footer always render; contact info and social
    // icons appear once their data loads, and are simply omitted if it fails.
    useEffect(() => {
        fetchJson<ContactData>('/data/contact.json')
            .then(setContactData)
            .catch((err) => console.error("Failed to fetch footer contact data", err));
        fetchJson<SocialMediaData>('/data/socialMedia.json')
            .then(setSocialData)
            .catch((err) => console.error("Failed to fetch footer social data", err));
    }, []);

    return (
        <footer className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="sr-only">Footer</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3">
                             <div className="w-10 h-10">
                                <Logo alt="" />
                             </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">CVOCA</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Empowering professionals through knowledge, networking, and innovation in the dynamic world of accounting and finance.
                        </p>
                        {socialData && (
                            <div className="mt-3.5 -ml-2.5 flex flex-wrap gap-1">
                                {socialData.platforms.map((platform) => (
                                    <SocialIcon
                                        key={platform.id}
                                        href={platform.url}
                                        path={platform.svgPath}
                                        name={platform.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-1">
                            <li><Link to="/about" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>About</Link></li>
                            <li><Link to="/membership" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>Membership</Link></li>
                            <li><Link to="/events" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>Events</Link></li>
                            <li><Link to="/blog" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>Blog</Link></li>
                            <li><Link to="/digital-outreach" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>Digital Outreach</Link></li>
                            <li><Link to="/contact" className={`${LINK_CLASS} text-sm text-gray-500 dark:text-gray-400`}>Contact</Link></li>
                        </ul>
                    </div>
                    {contactData && (
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider uppercase">Contact Info</h3>
                            <address className="not-italic">
                                <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    {['address', 'mobile', 'email', 'hours'].map((id) => {
                                        const value = contactData.contactInfo.find(info => info.id === id)?.value;
                                        if (!value) return null;
                                        const href = getContactHref(id, value);
                                        return (
                                            <li key={id}>
                                                {href ? <a href={href} className={LINK_CLASS}>{value}</a> : value}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </address>
                        </div>
                    )}
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} CVOCA. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link to="/privacy-policy" className={LINK_CLASS}>Privacy Policy</Link>
                        <Link to="/contact" className={LINK_CLASS}>Contact</Link>
                         <Link to="/membership" className={LINK_CLASS}>Membership</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
