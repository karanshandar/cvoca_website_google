
import React from 'react';
import useFetch from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { HomeData, CvoEvent, OutreachInitiative, PresidentMessage, CommitteeMember } from '../types';
import useSEO from '../hooks/useSEO';
import { canonical } from '../constants';
import { fetchPresidentMessage, fetchManagingCommittee, fetchEvents } from '../utils/googleSheets';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-sm">
                            {event.committee}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm border ${event.cost === 'Free'
                            ? 'bg-success-50 text-success-700 border-success-100 dark:bg-success-700/30 dark:text-success-light dark:border-success-dark'
                            : 'bg-primary-50 text-primary border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
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
                            <Icon name="clock" className="w-4 h-4 mr-2.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <Icon name="location" className="w-4 h-4 mr-2.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const OutreachCompactCard: React.FC<{ initiative: OutreachInitiative }> = ({ initiative }) => (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src={getOptimizedImageUrl(initiative.image, ImageSizePresets.EVENT_CARD)} alt={initiative.title} loading="lazy" decoding="async" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
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
                Learn more <Icon name="arrow-right" className="w-4 h-4 ml-1" />
            </Link>
        </div>
    </div>
);

const Home: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'Home',
        description: 'CVOCA - CVO Chartered & Cost Accountants Association. Premier professional body for CAs and CMAs in Mumbai since 1973. Join 2,400+ members for networking, events, and professional growth.',
        canonicalUrl: canonical('/'),
        keywords: 'CVOCA, Chartered Accountants Mumbai, Cost Accountants Association, CA networking India, professional accountants community'
    });

    // Local JSON (always available) — the page renders as soon as homeData resolves.
    const { data: homeData } = useFetch<HomeData>(
        () => fetch('/data/home.json').then((r) => r.json()),
    );
    const { data: outreachData } = useFetch<OutreachInitiative[]>(
        () => fetch('/data/digitalOutreach.json').then((r) => r.json()),
    );

    // Google Sheets data (with local JSON fallback) — hydrates after first paint;
    // failures fall back without blocking the page.
    const { data: eventsData } = useFetch<CvoEvent[]>(
        () => fetchWithFallback(fetchEvents, '/data/events.json') as unknown as Promise<CvoEvent[]>,
    );
    const { data: presidentMessageData } = useFetch<PresidentMessage | null>(
        () => fetchPresidentMessage().catch(() => null) as unknown as Promise<PresidentMessage | null>,
    );
    const { data: committee } = useFetch<CommitteeMember[]>(
        () =>
            fetchWithFallback(
                fetchManagingCommittee,
                '/data/managingCommittee.json',
            ) as unknown as Promise<CommitteeMember[]>,
    );

    const events = eventsData ?? [];
    const outreach = outreachData ?? [];
    const president = committee?.find((m) => m.role === 'President');
    const presidentPhoto = president?.photoUrl ?? '';

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

    if (!homeData) {
        return <LoadingSpinner />;
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
                        Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">Financial Visionaries</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/80 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-y border-cyan-100/50 dark:border-slate-700"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

                        {/* Photo & Identity */}
                        <div className="flex-shrink-0 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-full opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
                            {presidentPhoto ? (
                                <img
                                    src={getOptimizedImageUrl(presidentPhoto, ImageSizePresets.TEAM_PHOTO)}
                                    alt="CVOCA President"
                                    loading="lazy"
                                    decoding="async"
                                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                                />
                            ) : (
                                <div
                                    aria-hidden="true"
                                    className="relative w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"
                                />
                            )}
                            {/* Decorative Badge - Center Aligned */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white dark:border-slate-800 shadow-sm tracking-wider whitespace-nowrap z-20">
                                PRESIDENT
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left relative">
                            {/* Large Decorative Quote Mark */}
                            <Icon name="quote" className="absolute -top-6 -left-6 w-16 h-16 text-primary-100 dark:text-slate-800 opacity-40 transform -scale-x-100 pointer-events-none" />

                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h3 className="relative text-sm font-bold text-primary dark:text-primary-light uppercase tracking-widest">President's Communication</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800 uppercase tracking-wide">
                                    {(() => {
                                        const dateStr = presidentMessageData?.date ?? homeData.presidentDefault.date;
                                        try {
                                            const [year, month, day] = dateStr.split('-').map(Number);
                                            const date = new Date(year, month - 1, day);
                                            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                        } catch (e) {
                                            return dateStr;
                                        }
                                    })()}
                                </span>
                            </div>
                            <blockquote className="relative text-xl md:text-2xl font-serif italic text-gray-800 dark:text-gray-100 leading-relaxed">
                                {presidentMessageData?.message ? `"${presidentMessageData.message}"` : `"${homeData.presidentDefault.message}"`}
                            </blockquote>
                            <div className="mt-4 flex flex-col lg:flex-row items-center lg:items-start gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">— {president?.name ?? homeData.presidentDefault.name}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <a
                                href="https://blog.cvoca.org/category/presidents-communication/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-primary dark:text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 dark:border-gray-600 whitespace-nowrap"
                            >
                                <span className="font-bold">Read Full Message</span>
                                <Icon name="arrow-long-right" className="w-5 h-5 text-primary dark:text-primary-light transform group-hover:translate-x-1 transition-transform" />
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
                                    <Icon name="calendar" className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
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
                                        <Icon name="arrow-long-right" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                                    <Icon name="calendar" className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">More Events Coming Soon</h3>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/events" className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-md hover:shadow-lg group">
                            See All Upcoming Events
                            <Icon name="arrow-long-right" className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
                        <Icon name="arrow-long-right" className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
