import React, { useState, useEffect } from 'react';
import { OutreachInitiative } from '../types';

interface InitiativeProps {
    category: string;
    iconPath: string;
    image: string;
    title: string;
    description: string;
    features: string[];
    stats: { label: string; value: string }[];
    ctaText: string;
}

const InitiativeCard: React.FC<InitiativeProps> = ({ category, iconPath, image, title, description, features, stats, ctaText }) => (
    <div className="group flex flex-col lg:flex-row bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
        {/* Image Section */}
        <div className="lg:w-2/5 relative overflow-hidden min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
            <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-6 left-6 z-20">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary dark:text-primary-light text-sm font-bold rounded-full shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                    {category}
                </span>
            </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold uppercase tracking-wider rounded-full">Active Initiative</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                            Key Features
                        </h4>
                        <ul className="space-y-2">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 text-primary mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span>
                            Impact
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index}>
                                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{stat.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <button className="group/btn flex items-center text-primary font-bold hover:text-primary-dark transition-colors">
                    {ctaText}
                    <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
        </div>
    </div>
);


const DigitalOutreach: React.FC = () => {
    const [initiatives, setInitiatives] = useState<OutreachInitiative[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="animate-fadeIn bg-gray-50 dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-24 text-center overflow-hidden">
                 <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20 mb-6 backdrop-blur-sm">Digital Impact</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">Community Outreach</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">Bridging the gap between digital innovation and community welfare through education, theatre, and engagement.</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16 -mt-12 relative z-10">
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {initiatives.map((initiative, idx) => (
                             <InitiativeCard
                                key={idx}
                                category={initiative.category}
                                iconPath={initiative.iconPath}
                                image={initiative.image}
                                title={initiative.title}
                                description={initiative.description}
                                features={initiative.features}
                                stats={initiative.stats}
                                ctaText={initiative.ctaText}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DigitalOutreach;