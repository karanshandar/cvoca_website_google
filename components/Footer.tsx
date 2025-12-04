import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ContactData, SocialMediaData } from '../types';

const SocialIcon: React.FC<{ href: string, path: string, name: string }> = ({ href, path, name }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
        aria-label={name}
    >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d={path} />
        </svg>
    </a>
);

const Footer: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [socialData, setSocialData] = useState<SocialMediaData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactRes, socialRes] = await Promise.all([
                    fetch('/data/contact.json'),
                    fetch('/data/socialMedia.json')
                ]);

                if (contactRes.ok) setContactData(await contactRes.json());
                if (socialRes.ok) setSocialData(await socialRes.json());
            } catch (err) {
                console.error("Failed to fetch footer data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !contactData || !socialData) {
        return null; // Return nothing while loading to avoid layout shift
    }

    return (
        <footer className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3">
                             <div className="w-10 h-10">
                                <Logo />
                             </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">CVOCA</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Empowering professionals through knowledge, networking, and innovation in the dynamic world of accounting and finance.
                        </p>
                        <div className="mt-6 flex space-x-6">
                            {socialData.platforms.map((platform) => (
                                <SocialIcon
                                    key={platform.id}
                                    href={platform.url}
                                    path={platform.svgPath}
                                    name={platform.name}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">About</Link></li>
                            <li><Link to="/membership" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Membership</Link></li>
                            <li><Link to="/events" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Events</Link></li>
                            <li><Link to="/blog" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Blog</Link></li>
                            <li><Link to="/digital-outreach" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Digital Outreach</Link></li>
                            <li><Link to="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Contact Info</h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li>{contactData.contactInfo.find(info => info.id === 'address')?.value}</li>
                            <li>{contactData.contactInfo.find(info => info.id === 'mobile')?.value}</li>
                            <li>{contactData.contactInfo.find(info => info.id === 'email')?.value}</li>
                            <li>{contactData.contactInfo.find(info => info.id === 'hours')?.value}</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} CVOCA. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link to="/privacy-policy" className="hover:text-primary dark:hover:text-primary-light">Privacy Policy</Link>
                        <Link to="/contact" className="hover:text-primary dark:hover:text-primary-light">Contact</Link>
                         <Link to="/membership" className="hover:text-primary dark:hover:text-primary-light">Membership</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
