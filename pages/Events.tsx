
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CvoEvent } from '../types';

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
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
                    title="Open Full Size (Zoom)"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <img 
                src={imageUrl} 
                alt="Event Flyer" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none px-4">
                 <span className="inline-block px-4 py-2 bg-black/50 text-white text-xs rounded-full backdrop-blur-md border border-white/10">
                    Tap top-right icon to open full size
                </span>
            </div>
        </div>
    );
};

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
                className={`${
                event.imageUrl
                    ? 'aspect-[3/4] md:w-56 bg-gray-100 dark:bg-slate-900 cursor-pointer group/image'
                    : 'aspect-[1/1] md:w-40'
            } md:aspect-auto md:h-full relative shrink-0 overflow-hidden`}>
                {event.imageUrl ? (
                    <>
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Zoom overlay hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transform translate-y-4 group-hover/image:translate-y-0 transition-all duration-300 scale-90 group-hover/image:scale-100">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
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
                <div className="flex flex-wrap justify-between items-start mb-3 gap-3">
                     <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-secondary-light">
                        {event.committee}
                    </span>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        event.cost === 'Free' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                        {event.cost === 'Free' ? 'Free' : `${event.cost}`}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-200">
                    {event.title}
                </h3>

                {/* Meta Info */}
                <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                         <svg className="w-4 h-4 mr-2.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-medium leading-tight">{event.location}</span>
                    </div>
                </div>

                {/* Full Pricing (if applicable) */}
                {event.fullPricing && (
                    <div className="mb-4 bg-gray-50 dark:bg-slate-700/30 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-start">
                             <span className="mr-2 mt-0.5 text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                    <path d="M6 4H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 9H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 14C6 14 7.5 14 10 14C12.5 14 14 12.5 14 9H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 14L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                             </span>
                             <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{event.fullPricing}</span>
                        </div>
                    </div>
                )}

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
                                className="text-primary text-xs font-bold hover:text-primary-dark flex items-center gap-1 group/btn focus:outline-none transition-colors duration-200"
                            >
                                {isExpanded ? 'Read Less' : 'Read More'}
                                <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                     )}
                </div>

                {/* Tags & Actions */}
                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {event.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-50 text-gray-500 dark:bg-slate-700/50 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                            href={calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group/cal"
                        >
                            <svg className="w-4 h-4 text-gray-400 group-hover/cal:text-primary dark:group-hover/cal:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Add to Calendar
                        </a>
                        
                        {event.registrationLink ? (
                             <a
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Register Now
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                        ) : (
                             <button disabled className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed flex items-center justify-center border border-transparent">
                                Registration Closed
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const Events: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [organizerFilter, setOrganizerFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming'); // Default to Upcoming events
    const [allEvents, setAllEvents] = useState<CvoEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const eventsRes = await fetch('/data/events.json');
                if (!eventsRes.ok) {
                    throw new Error('Network response was not ok');
                }
                const eventsData = await eventsRes.json();
                setAllEvents(eventsData);
            } catch (error) {
                console.error("Failed to fetch events data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <div className="animate-fadeIn bg-background-light dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-32 pb-24 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                     <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl mix-blend-screen"></div>
                     <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl mix-blend-screen"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Upcoming Events</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">Connect, learn, and grow with our curated professional gatherings.</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12 relative z-10">
                 {loading ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                <>
                    {/* Filters */}
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 rounded-3xl shadow-xl mb-12 border border-white/20 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                Filter Events
                            </h2>
                            {hasActiveFilters && (
                                <button 
                                    onClick={clearFilters}
                                    className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-all"
                                    title="Remove all filters"
                                >
                                    <span>Clear</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            
                            {/* Time Filter */}
                            <div className="relative">
                                <select
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer font-medium"
                                >
                                    <option value="upcoming">Upcoming Events</option>
                                    <option value="past">Past Events</option>
                                    <option value="all">All Events</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                            </div>

                            <div className="relative">
                                <select
                                    value={organizerFilter}
                                    onChange={(e) => setOrganizerFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer"
                                >
                                    <option value="all">All Organizers</option>
                                    {allOrganizers.filter(org => org !== 'all').map(org => <option key={org} value={org}>{org}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            <div className="relative">
                                <select
                                    value={tagFilter}
                                    onChange={(e) => setTagFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer"
                                >
                                    {allTags.map(tag => <option key={tag} value={tag} className="capitalize">{tag === 'all' ? 'All Tags' : tag}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
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
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
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
