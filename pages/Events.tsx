
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CvoEvent } from '../types';
import useSEO from '../hooks/useSEO';
import { canonical } from '../constants';
import SchemaMarkup from '../components/SchemaMarkup';
import { getEventSchema, getBreadcrumbSchema } from '../utils/schema';
import { fetchEvents } from '../utils/googleSheets';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';

const getGoogleCalendarUrl = (event: CvoEvent): string => {
    // Safely parse YYYY-MM-DD to avoid timezone issues
    const [y, m, d] = event.date.split('-').map(Number);

    // Defaults
    let startHour = 9, startMin = 0;
    let endHour = 11, endMin = 0;

    // Parse Time String (e.g., "9:00 AM - 5:00 PM")
    const timeParts = event.time.split('-');
    const parseTime = (str: string) => {
        const match = str.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
            let h = parseInt(match[1]);
            const min = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return { h, min };
        }
        return null;
    };

    const startObj = parseTime(timeParts[0]);
    if (startObj) {
        startHour = startObj.h;
        startMin = startObj.min;
    }

    if (timeParts.length > 1) {
        const endObj = parseTime(timeParts[1]);
        if (endObj) {
            endHour = endObj.h;
            endMin = endObj.min;
        } else {
            endHour = startHour + 2;
            endMin = startMin;
        }
    } else {
        endHour = startHour + 2;
        endMin = startMin;
    }

    // Format for Google Calendar (YYYYMMDDTHHMMSS)
    const formatTime = (h: number, min: number) =>
        `${String(h).padStart(2, '0')}${String(min).padStart(2, '0')}00`;

    // Construct Date Strings
    const dateStr = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    const startDateTime = `${dateStr}T${formatTime(startHour, startMin)}`;
    const endDateTime = `${dateStr}T${formatTime(endHour, endMin)}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&ctz=Asia/Kolkata`;
};

// Gradient mapping based on committee/id for fallback visuals
const getFallbackGradient = (id: number) => {
    const gradients = [
        "from-blue-600 to-indigo-700",
        "from-emerald-500 to-teal-700",
        "from-orange-500 to-red-600",
        "from-purple-600 to-fuchsia-700",
        "from-cyan-500 to-blue-600",
        "from-pink-500 to-rose-600"
    ];
    return gradients[id % gradients.length];
};

// New Component: ImageModal for Lightbox
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-opacity duration-300 animate-fade-in-up"
            onClick={onClose}
        >
            <div className="absolute top-4 right-4 z-10 flex gap-4">
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10 font-medium text-sm"
                    title="Open Full Size (Zoom)"
                >
                    <Icon name="external-link" className="w-5 h-5" />
                    <span className="hidden sm:inline">Open Full Size</span>
                </a>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
                    aria-label="Close"
                >
                    <Icon name="close" className="w-6 h-6" />
                </button>
            </div>

            <img
                src={getOptimizedImageUrl(imageUrl, ImageSizePresets.LARGE)}
                alt="Event Flyer"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none px-4">
                <span className="inline-block px-4 py-2 bg-black/50 text-white text-xs rounded-full backdrop-blur-md border border-white/10">
                    Pinch to zoom or tap "Open Full Size"
                </span>
            </div>
        </div>
    );
};

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-black/5 ${className}`}>
        {children}
    </div>
);

const EventCard: React.FC<{ event: CvoEvent; onImageClick: (url: string) => void }> = ({ event, onImageClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState<string>('4.5em'); // Default roughly 3 lines
    const textRef = useRef<HTMLParagraphElement>(null);
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    const calendarUrl = getGoogleCalendarUrl(event);
    const isLongText = event.description.length > 120;

    // Calculate exact height for smooth animation
    useEffect(() => {
        if (isExpanded && textRef.current) {
            setContentHeight(`${textRef.current.scrollHeight}px`);
        } else {
            setContentHeight('4.5em');
        }
    }, [isExpanded]);

    return (
        <div className="group flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full relative">

            {/* Left Media Section: Image or Fallback */}
            <div
                onClick={() => event.imageUrl && onImageClick(event.imageUrl)}
                className={`${event.imageUrl
                    ? 'aspect-[3/4] md:w-56 bg-gray-100 dark:bg-slate-900 cursor-pointer group/image'
                    : 'aspect-[1/1] md:w-40'
                    } md:aspect-auto md:h-full relative shrink-0 overflow-hidden`}>
                {event.imageUrl ? (
                    <>
                        <img
                            src={getOptimizedImageUrl(event.imageUrl, ImageSizePresets.EVENT_CARD)}
                            alt={event.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Zoom overlay hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300 scale-90 group-hover/image:scale-100">
                                <Icon name="zoom-in" className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </>
                ) : (
                    // Graceful Fallback
                    <div className={`w-full h-full bg-gradient-to-br ${getFallbackGradient(event.id)} relative flex items-center justify-center`}>
                        {/* Decorative Pattern Overlay */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2.5px)',
                            backgroundSize: '20px 20px'
                        }}></div>

                        {/* Committee Initial/Icon as Fallback Graphic */}
                        <div className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                            <span className="text-3xl font-bold text-white/90">
                                {event.committee.charAt(0)}
                            </span>
                        </div>

                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                    </div>
                )}

                {/* Floating Date Badge */}
                <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-lg flex flex-col items-center justify-center min-w-[3.5rem] border border-gray-100 dark:border-gray-700 z-20 pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">{month}</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-0.5">{day}</span>
                    <span className="text-[10px] font-medium text-gray-400 mt-0.5">{year}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow flex flex-col p-6 relative">

                {/* Header: Committee & Cost */}
                <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-sm">
                        {event.committee}
                    </span>
                    <span className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border ${event.cost === 'Free'
                        ? 'bg-success-50 text-success-700 border-success-100 dark:bg-success-700/30 dark:text-success-light dark:border-success-dark'
                        : 'bg-primary-50 text-primary border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
                        }`}>
                        {event.cost === 'Free' ? 'Free' : `${event.cost}`}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors duration-200">
                    {event.title}
                </h3>

                {/* Meta Info */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-4">
                        <IconWrapper className="bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-light border-primary-100 dark:border-primary-800">
                            <Icon name="clock" className="w-5 h-5" />
                        </IconWrapper>
                        <div className="flex-1 py-0.5 min-w-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.time}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <IconWrapper className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800">
                            <Icon name="location" className="w-5 h-5" />
                        </IconWrapper>
                        <div className="flex-1 py-0.5 min-w-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{event.location}</p>
                        </div>
                    </div>

                    {/* Cost Block - Moved inside Meta Info for better flow */}
                    {event.fullPricing && (
                        <div className="flex items-start gap-4">
                            <IconWrapper className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800">
                                {/* Ticket Icon - Outlined */}
                                <Icon name="ticket" className="w-5 h-5" />
                            </IconWrapper>
                            <div className="flex-1 py-0.5 min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Entry Fee</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{event.fullPricing}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description with Smooth Animation */}
                <div className="mb-6 relative">
                    <div
                        className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ height: contentHeight }}
                    >
                        <p ref={textRef}>{event.description}</p>
                    </div>

                    {isLongText && (
                        <div className="mt-1">
                            {!isExpanded && <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none"></div>}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-primary text-xs font-bold hover:text-primary-dark flex items-center gap-1 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded transition-colors duration-200"
                            >
                                {isExpanded ? 'Collapse' : 'Expand'}
                                <Icon name="chevron-down" className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Tags & Actions */}
                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {event.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-900 transition-colors shadow-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                            href={calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group/cal"
                        >
                            <Icon name="calendar" className="w-4 h-4 text-gray-400 group-hover/cal:text-primary dark:group-hover/cal:text-white transition-colors duration-200" />
                            Add to Calendar
                        </a>

                        {event.registrationLink ? (
                            <a
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Register Now
                                <Icon name="arrow-long-right" className="w-4 h-4" />
                            </a>
                        ) : (
                            <button disabled className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed flex items-center justify-center border border-transparent">
                                Registration Closed
                            </button>
                        )}

                        {event.readMoreLink && (
                            <a
                                href={event.readMoreLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-1 sm:col-span-2 px-4 py-2.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 font-bold text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                Read More
                                <Icon name="external-link" className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const Events: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'Events',
        description: 'Discover upcoming CVOCA events - conferences, workshops, seminars, and networking sessions for Chartered and Cost Accountants in Mumbai. Register for professional development events.',
        canonicalUrl: canonical('/events'),
        keywords: 'CVOCA events, chartered accountants events Mumbai, CA conferences, accounting workshops, professional seminars',
        ogType: 'event'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [organizerFilter, setOrganizerFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming'); // Default to Upcoming events
    const { data, loading } = useFetch<CvoEvent[]>(
        () => fetchWithFallback(fetchEvents, '/data/events.json') as unknown as Promise<CvoEvent[]>,
    );
    const allEvents = data ?? [];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const allOrganizers = useMemo(() => {
        const organizers = new Set<string>();
        allEvents.forEach(event => organizers.add(event.committee));
        return ['all', ...Array.from(organizers).sort()];
    }, [allEvents]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        allEvents.forEach(event => event.tags.forEach(tag => tags.add(tag)));
        return ['all', ...Array.from(tags)];
    }, [allEvents]);

    const filteredEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        const filtered = allEvents.filter(event => {
            const eventDate = new Date(event.date);

            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOrganizer = organizerFilter === 'all' || event.committee === organizerFilter;
            const matchesTag = tagFilter === 'all' || event.tags.includes(tagFilter);

            let matchesTime = true;
            if (timeFilter === 'upcoming') {
                matchesTime = eventDate >= today;
            } else if (timeFilter === 'past') {
                matchesTime = eventDate < today;
            }

            return matchesSearch && matchesOrganizer && matchesTag && matchesTime;
        });

        // Sort events
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            // If viewing past events, show most recent first (Descending)
            // If viewing upcoming or all, show nearest first (Ascending)

            if (timeFilter === 'upcoming') {
                return dateA - dateB; // Ascending (Soonest first)
            } else {
                return dateB - dateA; // Descending (Most recent/Furthest future first)
            }
        });

    }, [allEvents, searchTerm, organizerFilter, tagFilter, timeFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setOrganizerFilter('all');
        setTagFilter('all');
        setTimeFilter('all');
    };

    const hasActiveFilters = searchTerm !== '' || organizerFilter !== 'all' || tagFilter !== 'all' || timeFilter !== 'all';

    // Generate Event schema for upcoming events
    const eventSchemas = filteredEvents.slice(0, 10).map(event => getEventSchema({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        cost: event.cost,
        imageUrl: event.imageUrl,
        registrationLink: event.registrationLink
    }));

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: canonical('/') },
        { name: 'Events', url: canonical('/events') }
    ]);

    return (
        <div className="animate-fadeIn bg-background-light dark:bg-background-dark min-h-screen">
            {/* Event Schema Markup */}
            <SchemaMarkup schema={[...eventSchemas, breadcrumbSchema]} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 pt-32 pb-24 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent rounded-full blur-3xl mix-blend-screen"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Upcoming Events</h1>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto font-light">Connect, learn, and grow with our curated professional gatherings.</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12 relative z-10">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Filters */}
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 rounded-3xl shadow-xl mb-12 border border-white/20 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icon name="filter" className="w-5 h-5 text-primary" />
                                    Filter Events
                                </h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-all"
                                        title="Remove all filters"
                                    >
                                        <span>Clear</span>
                                        <Icon name="close" className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Icon name="search" className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        aria-label="Search events"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                                    />
                                </div>

                                {/* Time Filter */}
                                <div className="relative">
                                    <select
                                        aria-label="Filter events by time"
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer font-medium"
                                    >
                                        <option value="upcoming">Upcoming Events</option>
                                        <option value="past">Past Events</option>
                                        <option value="all">All Events</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Icon name="calendar" className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <select
                                        aria-label="Filter events by organizer"
                                        value={organizerFilter}
                                        onChange={(e) => setOrganizerFilter(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="all">All Organizers</option>
                                        {allOrganizers.filter(org => org !== 'all').map(org => <option key={org} value={org}>{org}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Icon name="chevron-down" className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        aria-label="Filter events by tag"
                                        value={tagFilter}
                                        onChange={(e) => setTagFilter(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer"
                                    >
                                        {allTags.map(tag => <option key={tag} value={tag} className="capitalize">{tag === 'all' ? 'All Tags' : tag}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Icon name="tag" className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Events List */}
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {filteredEvents.map(event => (
                                    <EventCard key={event.id} event={event} onImageClick={setSelectedImage} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600">
                                <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                    <Icon name="calendar" className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                    {timeFilter === 'upcoming'
                                        ? "There are no upcoming events scheduled at the moment."
                                        : "We couldn't find any events matching your filters."}
                                </p>
                                <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-lg">Clear all filters</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default Events;
