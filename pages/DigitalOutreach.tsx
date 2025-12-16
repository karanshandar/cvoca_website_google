
import React, { useState, useEffect } from 'react';
import { OutreachInitiative, OutreachContact } from '../types';

// Theme configuration maps for dynamic styling based on category
const THEMES: Record<string, any> = {
    "Investment Community": {
        // Updated to match the light theme style of other cards (Emerald variant)
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-emerald-600 dark:text-emerald-400",
        border: "border-gray-100 dark:border-gray-700",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        pillBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        featureIcon: "text-emerald-600 dark:text-emerald-400",
        statBg: "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700",
        statText: "text-gray-900 dark:text-white",
        statLabel: "text-gray-500 dark:text-gray-400"
    },
    "Technology & AI": {
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-violet-600 dark:text-violet-400",
        border: "border-gray-100 dark:border-gray-700",
        button: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20",
        iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
        pillBg: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
        featureIcon: "text-violet-600 dark:text-violet-400",
        statBg: "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700",
        statText: "text-gray-900 dark:text-white",
        statLabel: "text-gray-500 dark:text-gray-400"
    },
    "Student Mentorship": {
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-amber-600 dark:text-amber-400",
        border: "border-gray-100 dark:border-gray-700",
        button: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        pillBg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        featureIcon: "text-amber-500 dark:text-amber-400",
        statBg: "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700",
        statText: "text-gray-900 dark:text-white",
        statLabel: "text-gray-500 dark:text-gray-400"
    },
    "Financial Aid": {
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-blue-600 dark:text-blue-400",
        border: "border-gray-100 dark:border-gray-700",
        button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        pillBg: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        featureIcon: "text-blue-600 dark:text-blue-400",
        statBg: "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700",
        statText: "text-gray-900 dark:text-white",
        statLabel: "text-gray-500 dark:text-gray-400"
    },
    "Public Outreach": {
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-rose-600 dark:text-rose-400",
        border: "border-gray-100 dark:border-gray-700",
        button: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
        iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
        pillBg: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
        featureIcon: "text-rose-600 dark:text-rose-400",
        statBg: "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700",
        statText: "text-gray-900 dark:text-white",
        statLabel: "text-gray-500 dark:text-gray-400"
    },
    "default": {
        isDarkCard: false,
        bg: "bg-white dark:bg-slate-800",
        text: "text-gray-900 dark:text-white",
        accent: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-700",
        button: "bg-gray-800 hover:bg-gray-900 text-white",
        iconBg: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        pillBg: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        featureIcon: "text-primary",
        statBg: "bg-gray-50 dark:bg-slate-700",
        statText: "text-gray-900",
        statLabel: "text-gray-500"
    }
};

const getTheme = (category: string) => THEMES[category] || THEMES["default"];

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-fade-in-up" onClick={onClose}>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={imageUrl} alt="Enlarged view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

// Coordinator Pill Component
const CoordinatorPill: React.FC<{ contact: OutreachContact; theme: any }> = ({ contact, theme }) => {
    return (
        <a href={contact.contact} target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-3 p-2 pr-4 rounded-xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.isDarkCard ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {contact.type === 'whatsapp' ? (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                ) : (
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                )}
            </div>
            <div className="flex flex-col">
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.isDarkCard ? 'text-gray-400' : 'text-gray-400'}`}>{contact.label}</span>
                 <span className={`text-sm font-semibold ${theme.isDarkCard ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{contact.name}</span>
            </div>
        </a>
    );
}

const BentoCard: React.FC<{ initiative: OutreachInitiative; onImageClick: (url: string) => void; index: number }> = ({ initiative, onImageClick, index }) => {
    const theme = getTheme(initiative.category);
    const hasStats = initiative.stats && initiative.stats.length > 0;
    const hasContacts = initiative.contacts && initiative.contacts.length > 0;
    
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = initiative.description.length > 250;
    const displayDescription = isExpanded ? initiative.description : (shouldTruncate ? initiative.description.substring(0, 250) + "..." : initiative.description);

    const isReverse = index % 2 !== 0;

    return (
        <div className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} ${theme.bg} rounded-[2.5rem] shadow-xl overflow-hidden border ${theme.border} hover:shadow-2xl transition-all duration-300`}>
            
            {/* IMAGE SIDE (40%) */}
            <div className="lg:w-5/12 relative min-h-[350px] lg:min-h-full cursor-pointer group overflow-hidden" onClick={() => onImageClick(initiative.image)}>
                <img src={initiative.image} alt={initiative.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-black/10"></div>
                
                {/* Floating Badge */}
                <div className={`absolute top-6 ${isReverse ? 'right-6' : 'left-6'} z-10`}>
                     <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/95 shadow-lg border border-white/20`}>
                        <div className={`p-1.5 rounded-full ${theme.pillBg} bg-opacity-20`}>
                            <svg className={`w-4 h-4 ${theme.featureIcon.replace('text-', 'text-opacity-100 text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={initiative.iconPath} /></svg>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider text-gray-800`}>
                            {initiative.category}
                        </span>
                    </div>
                </div>

                 {/* Zoom Hint */}
                 <div className={`absolute bottom-4 ${isReverse ? 'left-4' : 'right-4'} bg-black/40 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
            </div>

            {/* CONTENT SIDE (60%) */}
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col">
                
                {/* Header */}
                <div className="mb-8">
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${theme.accent}`}>{initiative.subtitle}</h2>
                    <h3 className={`text-3xl md:text-4xl font-extrabold leading-tight ${theme.text}`}>{initiative.title}</h3>
                </div>

                {/* Description */}
                <div className="mb-10">
                    <p className={`leading-relaxed text-base md:text-lg ${theme.isDarkCard ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        {displayDescription}
                    </p>
                    {shouldTruncate && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`mt-2 text-sm font-bold ${theme.accent} hover:underline focus:outline-none`}
                        >
                            {isExpanded ? "Read Less" : "Read More"}
                        </button>
                    )}
                </div>

                {/* Info Block: Highlights & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Key Highlights */}
                    <div className={`${theme.isDarkCard ? 'bg-white/5 border-white/5' : 'bg-gray-50 dark:bg-slate-700/30 border-gray-100 dark:border-gray-700'} rounded-2xl p-6 border`}>
                        <h4 className={`text-xs font-extrabold uppercase tracking-widest mb-4 ${theme.isDarkCard ? 'text-gray-400' : 'text-gray-400'}`}>
                             Key Highlights
                        </h4>
                        <ul className="space-y-3">
                            {initiative.features.map((feature, idx) => (
                                <li key={idx} className={`flex items-start gap-3 text-sm font-medium ${theme.isDarkCard ? 'text-gray-200' : 'text-gray-700 dark:text-gray-200'}`}>
                                    <svg className={`w-5 h-5 flex-shrink-0 ${theme.featureIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="leading-snug">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Impact Stats (Conditionally Rendered) */}
                    {hasStats && (
                         <div className="flex flex-col justify-between">
                             <div>
                                <h4 className={`text-xs font-extrabold uppercase tracking-widest mb-4 ${theme.isDarkCard ? 'text-gray-400' : 'text-gray-400'}`}>Impact</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {initiative.stats!.map((stat, idx) => (
                                        <div key={idx} className={`rounded-xl p-4 border shadow-sm flex items-center justify-between ${theme.statBg} ${theme.isDarkCard ? 'border-white/10' : ''}`}>
                                            <div className={`text-sm font-bold uppercase tracking-wide ${theme.statLabel}`}>{stat.label}</div>
                                            <div className={`text-xl font-black ${theme.featureIcon}`}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         </div>
                    )}
                </div>

                {/* Action Area */}
                <div className={`mt-auto pt-8 border-t ${theme.isDarkCard ? 'border-white/10' : 'border-gray-100 dark:border-gray-700'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                    
                    {/* Contacts / Coordinators */}
                    {hasContacts && (
                         <div className="flex flex-col gap-1 w-full md:w-auto">
                            {initiative.contacts!.map((contact, idx) => (
                                contact.name !== initiative.ctaText && ( // Avoid duplicating phone CTA if it's the main button
                                     <CoordinatorPill key={idx} contact={contact} theme={theme} />
                                )
                            ))}
                         </div>
                    )}

                    {/* Main CTA Button */}
                    {initiative.ctaText && initiative.ctaLink && initiative.ctaLink !== '#' && (
                        <div className="w-full md:w-auto">
                           <a 
                                href={initiative.ctaLink} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap ${theme.button}`}
                            >
                                <span>{initiative.ctaText}</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                        </div>
                    )}

                    {/* Special Case: Phone Button (e.g. Helpline) */}
                    {initiative.contacts?.find(c => c.type === 'phone' && c.name === initiative.ctaText) && (
                        <div className="w-full md:w-auto">
                            <a 
                                href={initiative.contacts[0].contact} 
                                className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap ${theme.button}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] uppercase font-bold opacity-80 mb-0.5">{initiative.ctaText}</span>
                                    <span className="text-lg">{initiative.contacts[0].label}</span>
                                </div>
                            </a>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const DigitalOutreach: React.FC = () => {
    const [initiatives, setInitiatives] = useState<OutreachInitiative[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/digitalOutreach.json')
            .then(res => res.json())
            .then(data => {
                setInitiatives(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch initiatives", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-fadeIn bg-gray-50 dark:bg-slate-950 min-h-screen font-sans selection:bg-primary/20">
            {/* Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-12 text-center overflow-hidden">
                 <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                        CVOCA Initiatives
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
                        Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Outreach</span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Driving change through education, technology, and mentorship. Explore our active programs designed for the modern professional.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative z-10">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-16">
                        {initiatives.map((initiative, idx) => (
                             <BentoCard
                                key={idx}
                                index={idx}
                                initiative={initiative}
                                onImageClick={setSelectedImage}
                            />
                        ))}
                    </div>
                )}
            </div>
             {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default DigitalOutreach;
