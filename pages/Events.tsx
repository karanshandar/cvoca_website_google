
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CvoEvent } from '../types';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import { canonical } from '../constants';
import SchemaMarkup from '../components/SchemaMarkup';
import { getEventSchema, getBreadcrumbSchema } from '../utils/schema';
import { fetchEvents } from '../utils/googleSheets';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { toEvent } from '../utils/normalize';
import { parseLocalDate } from '../utils/dates';
import { getGoogleCalendarUrl, getUpcomingEvents } from '../utils/events';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';
import useDisclosure from '../hooks/useDisclosure';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SearchInput from '../components/ui/SearchInput';
import ImageLightbox from '../components/ui/ImageLightbox';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

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

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-black/5 ${className}`}>
        {children}
    </div>
);

export const EventCard: React.FC<{ event: CvoEvent; onImageClick: (url: string) => void }> = ({ event, onImageClick }) => {
    const { open: isExpanded, panelId: descriptionId, triggerProps } = useDisclosure();
    const [contentHeight, setContentHeight] = useState<string>('4.5em'); // Default roughly 3 lines
    const textRef = useRef<HTMLParagraphElement>(null);
    const dateObj = parseLocalDate(event.date);
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
        <Card padding="none" className="group flex flex-col md:flex-row overflow-hidden h-full relative">

            {/* Left Media Section: Image or Fallback */}
            <div
                className={`${event.imageUrl
                    ? 'aspect-[3/4] md:w-56 bg-gray-100 dark:bg-slate-900 group/image'
                    : 'aspect-[1/1] md:w-40'
                    } md:aspect-auto md:h-full relative shrink-0 overflow-hidden`}>
                {event.imageUrl ? (
                    <button
                        type="button"
                        onClick={() => onImageClick(event.imageUrl!)}
                        aria-label={`View flyer for ${event.title}`}
                        className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    >
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
                                <Icon name="zoom-in" className="w-5 h-5 text-primary dark:text-primary-light" />
                            </div>
                        </div>
                    </button>
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
                    <span className="text-xs font-bold uppercase tracking-widest text-danger dark:text-danger-light">{month}</span>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none mt-0.5">{day}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{year}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow flex flex-col p-6 relative">

                {/* Header: Committee & Cost */}
                <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
                    <Badge>{event.committee}</Badge>
                    <Badge tone={event.cost === 'Free' ? 'success' : 'primary'} className="shrink-0">{event.cost}</Badge>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-200">
                    {event.title}
                </h3>

                {/* Meta Info */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-4">
                        <IconWrapper className="bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-light border-primary-100 dark:border-primary-800">
                            <Icon name="clock" className="w-5 h-5" />
                        </IconWrapper>
                        <div className="flex-1 py-0.5 min-w-0">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Time</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.time}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <IconWrapper className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800">
                            <Icon name="location" className="w-5 h-5" />
                        </IconWrapper>
                        <div className="flex-1 py-0.5 min-w-0">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
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
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Entry Fee</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{event.fullPricing}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description with Smooth Animation */}
                <div className="mb-6 relative">
                    <div
                        id={descriptionId}
                        className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ height: contentHeight }}
                    >
                        <p ref={textRef}>{event.description}</p>
                    </div>

                    {isLongText && (
                        <div className="mt-1">
                            {!isExpanded && <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none"></div>}
                            <button
                                {...triggerProps}
                                className="text-primary dark:text-primary-light text-xs font-bold hover:text-primary-dark dark:hover:text-primary-300 flex items-center gap-1 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded transition-colors duration-200"
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

                    {/* Wraps instead of a fixed 2-column grid, so each pill stays on one line in narrow cards */}
                    <div className="flex flex-wrap gap-3">
                        <Button href={calendarUrl} target="_blank" variant="outline" size="sm" className="flex-1 whitespace-nowrap">
                            <Icon name="calendar" className="w-4 h-4 mr-2" />
                            Add to Calendar
                        </Button>

                        {event.registrationLink ? (
                            <Button href={event.registrationLink} target="_blank" size="sm" className="flex-1 whitespace-nowrap">
                                Register Now
                            </Button>
                        ) : (
                            <Button disabled size="sm" className="flex-1 whitespace-nowrap">
                                Registration Closed
                            </Button>
                        )}

                        {event.readMoreLink && (
                            <Button href={event.readMoreLink} target="_blank" variant="outline" size="sm" className="basis-full whitespace-nowrap">
                                Read More
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </Card>
    );
}

const Events: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/events'));

    const [searchTerm, setSearchTerm] = useState('');
    const [organizerFilter, setOrganizerFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming'); // Default to Upcoming events
    const { data, loading, error } = useFetch<CvoEvent[]>(
        () => fetchWithFallback(fetchEvents, '/data/events.json', toEvent),
    );
    const allEvents = data ?? [];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const closeLightbox = useCallback(() => setSelectedImage(null), []);

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
            const eventDate = parseLocalDate(event.date);

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
            const dateA = parseLocalDate(a.date).getTime();
            const dateB = parseLocalDate(b.date).getTime();

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
        setTimeFilter('upcoming');
    };

    const hasActiveFilters = searchTerm !== '' || organizerFilter !== 'all' || tagFilter !== 'all' || timeFilter !== 'upcoming';

    // Event schema covers the next 10 upcoming events, whatever the visitor's filters,
    // so past events are never marked as scheduled
    const upcomingEvents = useMemo(() => getUpcomingEvents(allEvents, 10), [allEvents]);

    const eventSchemas = upcomingEvents.map(event => getEventSchema({
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
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            {/* Event Schema Markup */}
            <SchemaMarkup schema={[...eventSchemas, breadcrumbSchema]} />

            {/* Hero Section */}
            <PageHero
                title={timeFilter === 'past' ? 'Past Events' : timeFilter === 'all' ? 'All Events' : 'Upcoming Events'}
                lede="Connect, learn, and grow with our curated professional gatherings."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12 relative z-10">
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <LoadError />
                ) : (
                    <>
                        {/* Filters */}
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-12 border border-white/20 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icon name="filter" className="w-5 h-5 text-primary dark:text-primary-light" />
                                    Filter Events
                                </h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-danger-700 dark:text-danger-light bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-all"
                                        title="Remove all filters"
                                    >
                                        <span>Clear</span>
                                        <Icon name="close" className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SearchInput
                                    label="Search events"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />

                                {/* Time Filter */}
                                <div className="relative">
                                    <select
                                        aria-label="Filter events by time"
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer font-medium"
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
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer"
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
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none transition-all cursor-pointer"
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
                            <EmptyState icon="calendar" title="No events found">
                                <p>
                                    {timeFilter === 'upcoming'
                                        ? "There are no upcoming events scheduled at the moment."
                                        : "We couldn't find any events matching your filters."}
                                </p>
                                {hasActiveFilters && (
                                    <Button size="sm" onClick={clearFilters} className="mt-6">Clear all filters</Button>
                                )}
                            </EmptyState>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            <ImageLightbox imageUrl={selectedImage} alt="Event flyer" onClose={closeLightbox} />
        </div>
    );
};

export default Events;
