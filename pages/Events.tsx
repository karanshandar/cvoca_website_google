
import React, { useState, useMemo, useEffect } from 'react';
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

const EventCard: React.FC<{ event: CvoEvent }> = ({ event }) => {
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    const calendarUrl = getGoogleCalendarUrl(event);

    return (
        <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700/60 hover:-translate-y-1 h-full">
            <div className="flex flex-grow">
                {/* Date Column */}
                <div className="w-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-700/30 dark:to-slate-800 flex flex-col items-center justify-start pt-8 border-r border-gray-100 dark:border-gray-700/50 group-hover:bg-primary/5 transition-colors">
                    <div className="text-center">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{month}</span>
                        <span className="block text-3xl font-extrabold text-primary leading-none mb-1">{day}</span>
                        <span className="block text-xs text-gray-400">{year}</span>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {event.committee}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {event.cost === 'Free' ? 'Free' : `${event.cost}`}
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-primary transition-colors">{event.title}</h3>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 leading-relaxed">{event.description}</p>

                    <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex border-t border-gray-100 dark:border-gray-700 divide-x divide-gray-100 dark:divide-gray-700">
                <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold text-sm tracking-wide hover:bg-gray-800 hover:text-white dark:hover:bg-gray-200 dark:hover:text-slate-900 transition-all duration-300"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Add to Calendar
                </a>
                {event.registrationLink ? (
                    <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 flex items-center justify-center gap-2 bg-blue-50/40 dark:bg-blue-900/10 text-primary dark:text-primary-light font-bold text-sm tracking-wide hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        Register Now
                    </a>
                ) : (
                    <button
                        disabled
                        className="flex-1 py-4 flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 font-bold text-sm tracking-wide cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        Register Now
                    </button>
                )}
            </div>
        </div>
    );
}

const Events: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [committeeFilter, setCommitteeFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming'); // Default to Upcoming events
    const [allEvents, setAllEvents] = useState<CvoEvent[]>([]);
    const [committees, setCommittees] = useState<{ name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventsRes, committeesRes] = await Promise.all([
                    fetch('/data/events.json'),
                    fetch('/data/committees.json')
                ]);
                if (!eventsRes.ok || !committeesRes.ok) {
                    throw new Error('Network response was not ok');
                }
                const eventsData = await eventsRes.json();
                const committeesData = await committeesRes.json();
                setAllEvents(eventsData);
                setCommittees(committeesData);
            } catch (error) {
                console.error("Failed to fetch events data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            const matchesCommittee = committeeFilter === 'all' || event.committee === committeeFilter;
            const matchesTag = tagFilter === 'all' || event.tags.includes(tagFilter);
            
            let matchesTime = true;
            if (timeFilter === 'upcoming') {
                matchesTime = eventDate >= today;
            } else if (timeFilter === 'past') {
                matchesTime = eventDate < today;
            }

            return matchesSearch && matchesCommittee && matchesTag && matchesTime;
        });

        // Sort events
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            // If viewing past events, show most recent first (Descending)
            // If viewing upcoming or all, show nearest first (Ascending)
            // Actually for 'all', usually upcoming events are more relevant, so ascending is safer to show nearest future events at top
            // but for mixed 'all', usually you want descending to see latest news/events at top. 
            // However, context of "Events Calendar" usually implies upcoming.
            // Let's stick to: Upcoming=Asc, Past=Desc, All=Desc (Newest/Furthest Future first)
            
            if (timeFilter === 'upcoming') {
                return dateA - dateB; // Ascending (Soonest first)
            } else {
                return dateB - dateA; // Descending (Most recent/Furthest future first)
            }
        });

    }, [allEvents, searchTerm, committeeFilter, tagFilter, timeFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setCommitteeFilter('all');
        setTagFilter('all');
        setTimeFilter('all');
    };

    const hasActiveFilters = searchTerm !== '' || committeeFilter !== 'all' || tagFilter !== 'all' || timeFilter !== 'all';

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
                                    value={committeeFilter}
                                    onChange={(e) => setCommitteeFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer"
                                >
                                    <option value="all">All Committees</option>
                                    {committees.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
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
                                <EventCard key={event.id} event={event} />
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
        </div>
    );
};

export default Events;
