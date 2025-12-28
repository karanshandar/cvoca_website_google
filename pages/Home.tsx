
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeData, CvoEvent, OutreachInitiative } from '../types';
import useSEO from '../hooks/useSEO';

const StatCard: React.FC<{ value: string; label: string; delay: string }> = ({ value, label, delay }) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up`} style={{ animationDelay: delay }}>
        <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{value}</p>
        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

const FeatureCard: React.FC<{ iconPath: string; title: string; description: string }> = ({ iconPath, title, description }) => (
    <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 h-full">
        <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const HomeEventCard: React.FC<{ event: CvoEvent }> = ({ event }) => {
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });

    return (
        <Link to="/events" className="block h-full">
            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer group">
                {/* Card Header with Date Badge */}
                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-700/50 dark:to-slate-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                     <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 text-center min-w-[4rem] shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-primary/30 transition-colors">
                        <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{month}</span>
                        <span className="block text-2xl font-extrabold text-primary leading-none mt-0.5">{day}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col pt-5">
                    {/* Tags Row - Updated to match Events page styling */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                            {event.committee}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm border ${
                            event.cost === 'Free' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                        }`}>
                            {event.cost === 'Free' ? 'Free' : `${event.cost}`}
                        </span>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={event.title}>
                            {event.title}
                        </h3>
                    </div>

                    <div className="space-y-3 mb-2 mt-auto">
                         <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-2.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{event.time}</span>
                         </div>
                         <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-2.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="line-clamp-1">{event.location}</span>
                         </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const OutreachCompactCard: React.FC<{ initiative: OutreachInitiative }> = ({ initiative }) => (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
             <img src={initiative.image} alt={initiative.title} loading="lazy" decoding="async" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
             <div className="absolute bottom-4 left-4 z-20">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={initiative.iconPath} />
                    </svg>
                    {initiative.category}
                </span>
             </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{initiative.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">{initiative.description}</p>
            <Link to="/digital-outreach" className="text-primary text-sm font-bold hover:text-primary-dark inline-flex items-center mt-auto">
                Learn more <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
        </div>
    </div>
);

const Home: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'Home',
        description: 'CVOCA - CVO Chartered & Cost Accountants Association. Premier professional body for CAs and CMAs in Mumbai since 1973. Join 2,400+ members for networking, events, and professional growth.',
        canonicalUrl: 'https://cvoca.org/',
        keywords: 'CVOCA, Chartered Accountants Mumbai, Cost Accountants Association, CA networking India, professional accountants community'
    });

    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [events, setEvents] = useState<CvoEvent[]>([]);
    const [outreach, setOutreach] = useState<OutreachInitiative[]>([]);
    const [presidentPhoto, setPresidentPhoto] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeRes, eventsRes, outreachRes, committeeRes] = await Promise.all([
                    fetch('/data/home.json'),
                    fetch('/data/events.json'),
                    fetch('/data/digitalOutreach.json'),
                    fetch('/data/managingCommittee.json')
                ]);

                if (homeRes.ok) setHomeData(await homeRes.json());
                if (eventsRes.ok) setEvents(await eventsRes.json());
                if (outreachRes.ok) setOutreach(await outreachRes.json());
                if (committeeRes.ok) {
                    const committee = await committeeRes.json();
                    const president = committee.find((member: any) => member.role === 'President');
                    if (president?.photoUrl) setPresidentPhoto(president.photoUrl);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Logic to filter upcoming events (Next 2, as we have 1 static card)
    const upcomingEvents = React.useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        return events
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 2);
    }, [events]);

    // Logic to get featured outreach (First 3)
    const featuredOutreach = React.useMemo(() => {
        return outreach.slice(0, 3);
    }, [outreach]);

    if (loading || !homeData) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="overflow-hidden">
            {/* Modern Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-48 lg:pt-40 lg:pb-64 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl filter mix-blend-screen animate-float"></div>
                    <div className="absolute top-1/3 right-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl filter mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl filter mix-blend-screen animate-float" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-block mb-6 animate-fade-in-up">
                        <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide">
                            Since 1973 • Professional Excellence
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Financial Visionaries</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        The official CVO Chartered & Cost Accountants Association. Knowledge, networking, and innovation for the modern finance professional.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/membership" className="px-8 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:-translate-y-1">
                            Become a Member
                        </Link>
                        <Link to="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-lg font-bold rounded-full border border-white/20 transition-all duration-300">
                            About CVOCA
                        </Link>
                    </div>
                </div>
            </section>

            {/* Floating Stats Section */}
            <section className="relative -mt-24 z-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {homeData.stats.map((stat, idx) => (
                             <StatCard key={idx} value={stat.value} label={stat.label} delay={stat.delay} />
                        ))}
                    </div>
                </div>
            </section>

            {/* President's Message Strip */}
            <section className="relative w-full py-12 mt-16 mb-12 overflow-hidden">
                {/* Background with gradient and pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-y border-blue-100/50 dark:border-slate-700"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        
                        {/* Photo & Identity */}
                        <div className="flex-shrink-0 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
                            <img
                                src={presidentPhoto}
                                alt="CVOCA President"
                                loading="lazy"
                                decoding="async"
                                className="relative w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                            />
                            {/* Decorative Badge - Center Aligned */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white dark:border-slate-800 shadow-sm tracking-wider whitespace-nowrap z-20">
                                PRESIDENT
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left relative">
                            {/* Large Decorative Quote Mark */}
                            <svg className="absolute -top-6 -left-6 w-16 h-16 text-blue-200 dark:text-slate-700 opacity-50 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.054 15.392 14.471 17.227 14.102C17.388 14.07 17.483 14.043 17.483 14.043C17.483 14.043 17.483 12.879 17.483 12.022C16.326 12.022 15.196 11.537 14.378 10.72C13.56 9.902 13.076 8.771 13.076 7.614C13.076 6.457 13.56 5.326 14.378 4.509C15.196 3.691 16.326 3.206 17.483 3.206C18.64 3.206 19.77 3.691 20.588 4.509C21.406 5.326 21.89 6.457 21.89 7.614C21.89 10.966 20.73 17.062 16.738 20.551L16.273 21H14.017ZM3.132 21L3.132 18C3.132 16.054 4.507 14.471 6.342 14.102C6.503 14.07 6.598 14.043 6.598 14.043C6.598 14.043 6.598 12.879 6.598 12.022C5.441 12.022 4.311 11.537 3.493 10.72C2.675 9.902 2.191 8.771 2.191 7.614C2.191 6.457 2.675 5.326 3.493 4.509C4.311 3.691 5.441 3.206 6.598 3.206C7.755 3.206 8.885 3.691 9.703 4.509C10.521 5.326 11.005 6.457 11.005 7.614C11.005 10.966 9.845 17.062 5.853 20.551L5.388 21H3.132Z" /></svg>
                            
                            <h3 className="relative text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">President's Communication</h3>
                            <blockquote className="relative text-xl md:text-2xl font-serif italic text-gray-800 dark:text-gray-100 leading-relaxed">
                                "Wishing all a prosperous Vikram Samvat 2082. With new opportunities come increased responsibilities for professionals. Looking forward to your active participation in our exciting events and initiatives ahead."
                            </blockquote>
                             <div className="mt-4 flex flex-col lg:flex-row items-center lg:items-start gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">— CA Harsh Hasmukh Dedhia</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <a 
                                href="https://blog.cvoca.org/presidents-communication/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 dark:border-gray-600"
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold">Read Full Message</span>
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose CVOCA */}
            <section className="py-24 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Elevate Your Professional Journey</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">Join a community that fosters growth through shared knowledge and exclusive opportunities.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {homeData.features.map((feature, idx) => (
                            <FeatureCard 
                                key={idx}
                                iconPath={feature.iconPath}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </section>
            
            {/* FEATURED UPCOMING EVENTS */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <div className="max-w-2xl">
                            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Don't Miss Out</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Upcoming Events</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Curated professional gatherings to connect, learn, and grow.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Static Compliance Calendar Card - First Position */}
                        <a href="https://blog.cvoca.org/category/karvera-na-ata-pata-monthly-planner/" target="_blank" rel="noopener noreferrer" className="block h-full group">
                            <div className="flex flex-col bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 rounded-2xl shadow-lg overflow-hidden border border-cyan-200 dark:border-cyan-800 hover:shadow-2xl hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-1 h-full relative">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                {/* Card Header */}
                                <div className="p-4 border-b border-cyan-100 dark:border-cyan-800/50 flex justify-between items-center bg-white/30 dark:bg-black/10 backdrop-blur-sm">
                                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800">
                                        Monthly Resource
                                    </span>
                                     <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col relative z-10">
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide mb-1 block">
                                            Karvera Na Ata Pata
                                        </span>
                                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                                            Compliance Calendar
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 flex-grow leading-relaxed font-medium">
                                        Stay ahead of statutory due dates for Income Tax, GST, and ROC.
                                    </p>
                                    <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                                        View Deadlines
                                         <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </a>

                        {/* Mapped Events */}
                        {upcomingEvents.map(event => (
                            <HomeEventCard key={event.id} event={event} />
                        ))}

                         {/* Fallback if no events */}
                         {upcomingEvents.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center">
                                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                 </div>
                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">More Events Coming Soon</h3>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/events" className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-md hover:shadow-lg group">
                            See All Upcoming Events 
                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                     </div>
                 </div>
            </section>

            {/* FEATURED OUTREACH SECTION (Grid Layout) */}
            <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Making a Difference</h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Our commitment goes beyond numbers. Explore our digital outreach and community welfare initiatives.</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredOutreach.map((initiative, idx) => (
                            <OutreachCompactCard key={idx} initiative={initiative} />
                        ))}
                    </div>
                </div>

                 <div className="text-center mt-12">
                    <Link to="/digital-outreach" className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white transition-all shadow-md hover:shadow-lg group">
                        View All Initiatives
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 bg-primary overflow-hidden">
                 <div className="absolute inset-0 opacity-20">
                     <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
                 </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Ready to shape the future of finance?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
                        Join thousands of professionals who trust CVOCA for their growth and networking needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/membership" className="px-8 py-4 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300">
                            Join CVOCA Today
                        </Link>
                        <Link to="/contact" className="px-8 py-4 bg-primary-dark/50 backdrop-blur-sm text-white border border-white/20 font-bold rounded-full hover:bg-primary-dark transition-all duration-300">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
