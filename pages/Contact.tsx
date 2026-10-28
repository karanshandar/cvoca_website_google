
import React from 'react';
import { ContactData } from '../types';
import useFetch from '../hooks/useFetch';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import { canonical } from '../constants';
import SchemaMarkup from '../components/SchemaMarkup';
import { getBreadcrumbSchema } from '../utils/schema';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import { fetchJson } from '../utils/fetchJson';
import { getContactHref } from '../utils/contactLinks';
import Icon from '../components/Icon';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; href?: string; delay: string }> = ({ icon, label, value, href, delay }) => (
    <div 
        className="flex items-start p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors duration-300 animate-fade-in-up group"
        style={{ animationDelay: delay }}
    >
        <div className="flex-shrink-0 mr-5 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white leading-snug break-words">
                {href ? (
                    <a href={href} className="hover:text-primary dark:hover:text-primary-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded">{value}</a>
                ) : value}
            </p>
        </div>
    </div>
);

const getIconByType = (iconType: string) => {
    const icons = {
        location: <Icon name="location" className="h-6 w-6" />,
        phone: <Icon name="phone" className="h-6 w-6" />,
        email: <Icon name="email" className="h-6 w-6" />,
        clock: <Icon name="clock" className="h-6 w-6" />,
    };
    return icons[iconType as keyof typeof icons] || icons.location;
};

const Contact: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/contact'));

    const { data: contactData, loading, error } = useFetch<ContactData>(
        () => fetchJson<ContactData>('/data/contact.json'),
    );

    if (error) {
        return <LoadError fullPage />;
    }

    if (loading || !contactData) {
        return <LoadingSpinner fullPage />;
    }

    // Breadcrumb schema for Contact page
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: canonical('/') },
        { name: 'Contact', url: canonical('/contact') }
    ]);

    return (
        <div className="bg-gray-50 dark:bg-background-dark min-h-screen">
            {/* The global Organization schema (App.tsx) already carries the address, phone and hours */}
            <SchemaMarkup schema={[breadcrumbSchema]} />

            {/* Dark Theme Hero Section */}
            <PageHero eyebrow="Get In Touch" title={contactData.hero.title} lede={contactData.hero.subtitle} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                    
                    {/* Left Column: Contact Info Card */}
                    <Card padding="xl" emphasis className="flex flex-col justify-center animate-fade-in-up">
                        <div className="mb-8 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{contactData.organization.name}</h2>
                             <p className="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {contactData.organization.tagline}
                             </p>
                        </div>

                        <address className="not-italic space-y-2">
                             {contactData.contactInfo.map((info, idx) => (
                                <InfoCard
                                    key={info.id}
                                    icon={getIconByType(info.iconType)}
                                    label={info.label}
                                    value={info.value}
                                    href={getContactHref(info.id, info.value)}
                                    delay={`${idx * 0.1}s`}
                                />
                             ))}
                        </address>
                    </Card>

                     {/* Right Column: Map Card */}
                     <Card padding="md" emphasis className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                         <div className="p-6 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{contactData.map.title}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{contactData.map.description}</p>
                        </div>
                        <div className="relative w-full flex-grow min-h-[400px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-900">
                             <iframe
                                src={contactData.map.embedUrl}
                                className="absolute inset-0 w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="CVOCA Office Location"
                                sandbox="allow-scripts allow-same-origin"
                            ></iframe>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact;
