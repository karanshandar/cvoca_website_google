
import React, { useState, useEffect } from 'react';
import { ContactData } from '../types';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; delay: string }> = ({ icon, label, value, delay }) => (
    <div 
        className="flex items-start p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors duration-300 animate-fade-in-up group"
        style={{ animationDelay: delay }}
    >
        <div className="flex-shrink-0 mr-5 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</h3>
            <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white leading-snug break-words">{value}</p>
        </div>
    </div>
);

const getIconByType = (iconType: string) => {
    const icons = {
        location: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        phone: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
        email: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        clock: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return icons[iconType as keyof typeof icons] || icons.location;
};

const Contact: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/contact.json')
            .then(res => res.json())
            .then(data => {
                setContactData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch contact data", err);
                setLoading(false);
            });
    }, []);

    if (loading || !contactData) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="animate-fadeIn bg-gray-50 dark:bg-background-dark min-h-screen">
            {/* Dark Theme Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-24 text-center overflow-hidden">
                 <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                        Get In Touch
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
                        {contactData.hero.title}
                    </h1>
                    <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {contactData.hero.subtitle}
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                    
                    {/* Left Column: Contact Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center animate-fade-in-up">
                        <div className="mb-8 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{contactData.organization.name}</h2>
                             <p className="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {contactData.organization.tagline}
                             </p>
                        </div>

                        <div className="space-y-2">
                             {contactData.contactInfo.map((info, idx) => (
                                <InfoCard
                                    key={info.id}
                                    icon={getIconByType(info.iconType)}
                                    label={info.label}
                                    value={info.value}
                                    delay={`${idx * 0.1}s`}
                                />
                             ))}
                        </div>
                    </div>

                     {/* Right Column: Map Card */}
                     <div className="flex flex-col bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
