
import React, { useState, useCallback } from 'react';
import { OutreachInitiative, OutreachContact } from '../types';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import { fetchJson } from '../utils/fetchJson';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';
import useDisclosure from '../hooks/useDisclosure';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ImageLightbox from '../components/ui/ImageLightbox';

// Coordinator Pill Component
const CoordinatorPill: React.FC<{ contact: OutreachContact }> = ({ contact }) => {
    return (
        <a href={contact.contact} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-2 pr-4 rounded-xl transition-colors duration-300 border border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {contact.type === 'whatsapp' ? (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                ) : (
                     <Icon name="phone" className="w-4 h-4" />
                )}
            </div>
            <div className="flex flex-col">
                 <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{contact.label}</span>
                 <span className="text-sm font-semibold text-gray-900 dark:text-white">{contact.name}</span>
            </div>
        </a>
    );
}

export const BentoCard: React.FC<{ initiative: OutreachInitiative; onImageClick: (url: string) => void; index: number }> = ({ initiative, onImageClick, index }) => {
    const hasStats = initiative.stats && initiative.stats.length > 0;
    const hasContacts = initiative.contacts && initiative.contacts.length > 0;
    // A phone contact named like the CTA (e.g. a helpline) is shown as the main button
    const phoneCta = initiative.contacts?.find(c => c.type === 'phone' && c.name === initiative.ctaText);
    
    const { open: isExpanded, panelId: descriptionId, triggerProps } = useDisclosure();
    const shouldTruncate = initiative.description.length > 250;
    const displayDescription = isExpanded ? initiative.description : (shouldTruncate ? initiative.description.substring(0, 250) + "..." : initiative.description);

    const isReverse = index % 2 !== 0;

    return (
        <Card padding="none" emphasis className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} overflow-hidden`}>
            
            {/* IMAGE SIDE (40%) */}
            <button
                type="button"
                onClick={() => onImageClick(initiative.image)}
                aria-label={`View image for ${initiative.title}`}
                className="lg:w-5/12 relative min-h-[350px] lg:min-h-full cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
                <img src={getOptimizedImageUrl(initiative.image, ImageSizePresets.EVENT_CARD)} alt={initiative.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-black/10"></div>
                
                {/* Category Badge, on an opaque backing: Badge's dark fill is translucent and the photo varies */}
                <div className={`absolute top-6 ${isReverse ? 'right-6' : 'left-6'} z-10 rounded-full bg-card-light dark:bg-card-dark shadow-lg`}>
                    <Badge className="gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={initiative.iconPath} /></svg>
                        {initiative.category}
                    </Badge>
                </div>

                 {/* Zoom Hint */}
                 <div className={`absolute bottom-4 ${isReverse ? 'left-4' : 'right-4'} bg-black/40 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block`}>
                    <Icon name="zoom-in" className="w-5 h-5" />
                </div>
            </button>

            {/* CONTENT SIDE (60%) */}
            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col">
                
                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-widest mb-3 text-primary dark:text-primary-light">{initiative.subtitle}</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">{initiative.title}</h2>
                </div>

                {/* Description */}
                <div className="mb-10">
                    <p id={descriptionId} className="leading-relaxed text-base md:text-lg text-gray-600 dark:text-gray-300">
                        {displayDescription}
                    </p>
                    {shouldTruncate && (
                        <button
                            {...triggerProps}
                            className="mt-2 text-sm font-bold text-primary dark:text-primary-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
                        >
                            {isExpanded ? "Read Less" : "Read More"}
                        </button>
                    )}
                </div>

                {/* Info Block: Highlights & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Key Highlights */}
                    <div className="bg-gray-50 dark:bg-slate-700/30 border-gray-100 dark:border-gray-700 rounded-2xl p-6 border">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest mb-4 text-gray-500 dark:text-gray-400">
                             Key Highlights
                        </h3>
                        <ul className="space-y-3">
                            {initiative.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Icon name="check" className="w-5 h-5 flex-shrink-0 text-primary dark:text-primary-light" />
                                    <span className="leading-snug">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Impact Stats (Conditionally Rendered) */}
                    {hasStats && (
                         <div className="flex flex-col justify-between">
                             <div>
                                <h3 className="text-xs font-extrabold uppercase tracking-widest mb-4 text-gray-500 dark:text-gray-400">Impact</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {initiative.stats!.map((stat, idx) => (
                                        <div key={idx} className="rounded-xl p-4 border shadow-sm flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-gray-700">
                                            <div className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</div>
                                            <div className="text-xl font-extrabold text-primary dark:text-primary-light">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Contacts / Coordinators */}
                    {hasContacts && (
                         <div className="flex flex-col gap-1 w-full md:w-auto">
                            {initiative.contacts!.map((contact, idx) => (
                                contact.name !== initiative.ctaText && ( // Avoid duplicating phone CTA if it's the main button
                                     <CoordinatorPill key={idx} contact={contact} />
                                )
                            ))}
                         </div>
                    )}

                    {/* Main CTA Button */}
                    {initiative.registrationClosed ? (
                        <div className="w-full md:w-auto">
                            <Button disabled className="w-full md:w-auto whitespace-nowrap">
                                Registrations Closed
                            </Button>
                        </div>
                    ) : (
                        initiative.ctaText && initiative.ctaLink && initiative.ctaLink !== '#' && (
                            <div className="w-full md:w-auto">
                                <Button href={initiative.ctaLink} target="_blank" className="w-full md:w-auto whitespace-nowrap">
                                    {initiative.ctaText}
                                </Button>
                            </div>
                        )
                    )}

                    {/* Special Case: Phone Button (e.g. Helpline) */}
                    {phoneCta && (
                        <div className="w-full md:w-auto">
                            <Button href={phoneCta.contact} className="w-full md:w-auto gap-3 whitespace-nowrap">
                                <Icon name="phone" className="w-5 h-5" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xs uppercase font-bold opacity-80 mb-0.5">{initiative.ctaText}</span>
                                    <span className="text-lg">{phoneCta.label}</span>
                                </div>
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </Card>
    );
};

const DigitalOutreach: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/digital-outreach'));

    const { data, loading, error } = useFetch<OutreachInitiative[]>(
        () => fetchJson<OutreachInitiative[]>('/data/digitalOutreach.json'),
    );
    const initiatives = data ?? [];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const closeLightbox = useCallback(() => setSelectedImage(null), []);

    return (
        <div className="bg-gray-50 dark:bg-slate-950 min-h-screen font-sans selection:bg-primary/20">
            {/* Hero Section */}
            <PageHero
                eyebrow="CVOCA Initiatives"
                title={<>Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">Outreach</span></>}
                lede="Driving change through education, technology, and mentorship. Explore our active programs designed for the modern professional."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative z-10">
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <LoadError />
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
             <ImageLightbox imageUrl={selectedImage} alt="Initiative image" onClose={closeLightbox} />
        </div>
    );
};

export default DigitalOutreach;
