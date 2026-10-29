
import React from 'react';
import useFetch from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { HomeData, CvoEvent, OutreachInitiative, PresidentMessage, CommitteeMember } from '../types';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import { fetchPresidentMessage, fetchManagingCommittee, fetchEvents } from '../utils/googleSheets';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { toCommitteeMember, toEvent } from '../utils/normalize';
import { parseLocalDate } from '../utils/dates';
import { getUpcomingEvents } from '../utils/events';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import { fetchJson } from '../utils/fetchJson';
import Icon from '../components/Icon';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import IconTile from '../components/ui/IconTile';
import EmptyState from '../components/ui/EmptyState';
import Stat from '../components/ui/Stat';

const StatCard: React.FC<{ value: string; label: string; delay: string }> = ({ value, label, delay }) => (
    <Card emphasis className="text-center animate-fade-in-up" style={{ animationDelay: delay }}>
        <Stat size="lg" value={value} label={label} />
    </Card>
);

const FeatureCard: React.FC<{ iconPath: string; title: string; description: string }> = ({ iconPath, title, description }) => (
    <Card padding="xl" className="group h-full">
        <IconTile className="mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </IconTile>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </Card>
);

const HomeEventCard: React.FC<{ event: CvoEvent }> = ({ event }) => {
    const dateObj = parseLocalDate(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });

    return (
        <Link to="/events" className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-background-dark">
            <Card interactive padding="none" className="flex flex-col overflow-hidden h-full">
                {/* Card Header with Date Badge */}
                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-700/50 dark:to-slate-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 text-center min-w-[4rem] shadow-sm border border-gray-100 dark:border-gray-600 group-hover:border-primary/30 transition-colors">
                        <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{month}</span>
                        <span className="block text-2xl font-extrabold text-primary dark:text-primary-light leading-none mt-0.5">{day}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col pt-5">
                    {/* Tags Row - Updated to match Events page styling */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge>{event.committee}</Badge>
                        <Badge tone={event.cost === 'Free' ? 'success' : 'primary'}>{event.cost}</Badge>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary dark:group-hover:text-primary-light transition-colors" title={event.title}>
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
            </Card>
        </Link>
    );
};

const OutreachCompactCard: React.FC<{ initiative: OutreachInitiative }> = ({ initiative }) => (
    <Card padding="none" className="flex flex-col overflow-hidden h-full">
        <div className="relative h-48 overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src={getOptimizedImageUrl(initiative.image, ImageSizePresets.EVENT_CARD)} alt={initiative.title} loading="lazy" decoding="async" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={initiative.iconPath} />
                    </svg>
                    {initiative.category}
                </span>
            </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{initiative.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">{initiative.description}</p>
            <Link to="/digital-outreach" className="text-primary dark:text-primary-light text-sm font-bold hover:text-primary-dark dark:hover:text-primary-300 inline-flex items-center mt-auto">
                Learn more<span className="sr-only"> about {initiative.title}</span> <Icon name="arrow-right" className="w-4 h-4 ml-1" />
            </Link>
        </div>
    </Card>
);

const Home: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/'));

    // Local JSON (always available) — the page renders as soon as homeData resolves.
    const { data: homeData, error: homeError } = useFetch<HomeData>(
        () => fetchJson<HomeData>('/data/home.json'),
    );
    const { data: outreachData } = useFetch<OutreachInitiative[]>(
        () => fetchJson<OutreachInitiative[]>('/data/digitalOutreach.json'),
    );

    // Google Sheets data (with local JSON fallback) — hydrates after first paint;
    // failures fall back without blocking the page.
    const { data: eventsData } = useFetch<CvoEvent[]>(
        () => fetchWithFallback(fetchEvents, '/data/events.json', toEvent),
    );
    const { data: presidentMessageData } = useFetch<PresidentMessage | null>(
        () => fetchPresidentMessage().catch(() => null),
    );
    const { data: committee } = useFetch<CommitteeMember[]>(
        () => fetchWithFallback(fetchManagingCommittee, '/data/managingCommittee.json', toCommitteeMember),
    );

    const president = committee?.find((m) => m.role === 'President');
    const presidentPhoto = president?.photoUrl ?? '';

    // Logic to filter upcoming events (Next 2, as we have 1 static card)
    const upcomingEvents = React.useMemo(() => getUpcomingEvents(eventsData ?? [], 2), [eventsData]);

    // Logic to get featured outreach (First 3)
    const featuredOutreach = React.useMemo(() => {
        return (outreachData ?? []).slice(0, 3);
    }, [outreachData]);

    if (homeError) {
        return <LoadError fullPage />;
    }

    if (!homeData) {
        return <LoadingSpinner fullPage />;
    }

    return (
        <div className="overflow-hidden">
            {/* Modern Hero Section */}
            <PageHero
                size="large"
                eyebrow="Since 1973 • Professional Excellence"
                title={<>Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">Financial Visionaries</span></>}
                lede="The official CVO Chartered & Cost Accountants Association. Knowledge, networking, and innovation for the modern finance professional."
            >
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Button to="/membership">Become a Member</Button>
                    <Button to="/about" variant="outline">About CVOCA</Button>
                </div>
            </PageHero>

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
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-50/80 via-white to-primary-50/80 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-y border-secondary-100/50 dark:border-slate-700"></div>
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
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white dark:border-slate-800 shadow-sm tracking-wider whitespace-nowrap z-20">
                                PRESIDENT
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left relative">
                            {/* Large Decorative Quote Mark */}
                            <Icon name="quote" className="absolute -top-6 -left-6 w-16 h-16 text-primary-100 dark:text-slate-800 opacity-40 transform -scale-x-100 pointer-events-none" />

                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h2 className="relative text-sm font-bold text-primary dark:text-primary-light uppercase tracking-widest">President's Communication</h2>
                                <Badge>
                                    {(() => {
                                        const dateStr = presidentMessageData?.date ?? homeData.presidentDefault.date;
                                        try {
                                            const [year, month, day] = dateStr.split('-').map(Number);
                                            const date = new Date(year, month - 1, day);
                                            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                        } catch {
                                            return dateStr;
                                        }
                                    })()}
                                </Badge>
                            </div>
                            <blockquote className="relative text-xl md:text-2xl italic text-gray-800 dark:text-gray-100 leading-relaxed">
                                {presidentMessageData?.message ? `"${presidentMessageData.message}"` : `"${homeData.presidentDefault.message}"`}
                            </blockquote>
                            <div className="mt-4 flex flex-col lg:flex-row items-center lg:items-start gap-1">
                                <span className="font-bold text-gray-900 dark:text-white">— {president?.name ?? homeData.presidentDefault.name}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <Button href="https://blog.cvoca.org/category/presidents-communication/" target="_blank" variant="outline" className="whitespace-nowrap">
                                Read Full Message
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose CVOCA */}
            <section className="py-24 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        className="mb-16"
                        title="Elevate Your Professional Journey"
                        lede="Join a community that fosters growth through shared knowledge and exclusive opportunities."
                    />
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
                    <SectionHeader
                        align="left"
                        className="mb-12"
                        eyebrow="Don't Miss Out"
                        title="Upcoming Events"
                        lede="Curated professional gatherings to connect, learn, and grow."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Static Compliance Calendar Card - First Position */}
                        <a href="https://blog.cvoca.org/category/karvera-na-ata-pata-monthly-planner/" target="_blank" rel="noopener noreferrer" className="block h-full group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-background-dark">
                            <div className="flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl shadow-lg overflow-hidden border border-primary-100 dark:border-primary-800 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 h-full relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                {/* Card Header */}
                                <div className="p-4 border-b border-primary-100 dark:border-primary-800/50 flex justify-between items-center bg-white/30 dark:bg-black/10 backdrop-blur-sm">
                                    <Badge>Monthly Resource</Badge>
                                    <Icon name="calendar" className="w-5 h-5 text-primary dark:text-primary-light" />
                                </div>
                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col relative z-10">
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wide mb-1 block">
                                            Karvera Na Ata Pata
                                        </span>
                                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight group-hover:text-primary-700 dark:group-hover:text-primary-light transition-colors">
                                            Compliance Calendar
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 flex-grow leading-relaxed font-medium">
                                        Stay ahead of statutory due dates for Income Tax, GST, and ROC.
                                    </p>
                                    <span className="w-full py-3 bg-primary group-hover:bg-primary-dark text-white text-sm font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                                        View Deadlines
                                        <Icon name="arrow-long-right" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>
                        </a>

                        {/* Mapped Events */}
                        {upcomingEvents.map(event => (
                            <HomeEventCard key={event.id} event={event} />
                        ))}

                        {/* Fallback if no events */}
                        {upcomingEvents.length === 0 && (
                            <EmptyState icon="calendar" title="More Events Coming Soon" className="col-span-1 md:col-span-2" />
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Button to="/events" variant="outline" className="group">
                            See All Upcoming Events
                            <Icon name="arrow-long-right" className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* FEATURED OUTREACH SECTION (Grid Layout) */}
            <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <SectionHeader
                        title="Making a Difference"
                        lede="Our commitment goes beyond numbers. Explore our digital outreach and community welfare initiatives."
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredOutreach.map((initiative, idx) => (
                            <OutreachCompactCard key={idx} initiative={initiative} />
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <Button to="/digital-outreach" variant="outline" className="group">
                        View All Initiatives
                        <Icon name="arrow-long-right" className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Button>
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
                    <p className="text-xl text-primary-50 mb-10 max-w-3xl mx-auto">
                        Join thousands of professionals who trust CVOCA for their growth and networking needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button to="/membership" variant="onPrimary">Join CVOCA Today</Button>
                        <Button to="/contact" variant="onPrimaryOutline">Contact Support</Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
