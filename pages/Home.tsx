import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeData } from '../types';

const StatCard: React.FC<{ value: string; label: string; delay: string }> = ({ value, label, delay }) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transform transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up`} style={{ animationDelay: delay }}>
        <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{value}</p>
        <p className="mt-2 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

const FeatureCard: React.FC<{ iconPath: string; title: string; description: string }> = ({ iconPath, title, description }) => (
    <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30">
        <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const NewsCard: React.FC<{ badge: string; badgeColor: string; date: string; title: string; description: string; }> = ({ badge, badgeColor, date, title, description }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wide ${badgeColor}`}>{badge}</span>
                <span className="text-sm text-gray-400 font-medium">{date}</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 hover:text-primary transition-colors cursor-pointer">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">{description}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-gray-700">
            <button className="text-primary dark:text-primary-light text-sm font-bold flex items-center hover:underline">
                Read more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>
    </div>
);

const Home: React.FC = () => {
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/home.json')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch home data", err);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="overflow-hidden">
            {/* Modern Hero Section with Background Shapes */}
            <section className="relative bg-slate-900 pt-32 pb-48 lg:pt-40 lg:pb-64 overflow-hidden">
                {/* Abstract Background Elements */}
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

            {/* Floating Stats Section - Overlapping the Hero */}
            <section className="relative -mt-24 z-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.stats.map((stat, idx) => (
                             <StatCard key={idx} value={stat.value} label={stat.label} delay={stat.delay} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose CVOCA */}
            <section className="py-24 bg-background-light dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Elevate Your Professional Journey</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">Join a community that fosters growth through shared knowledge and exclusive opportunities.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {data.features.map((feature, idx) => (
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
            
            {/* Latest Updates */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest from CVOCA</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Stay updated with upcoming events, tech insights, and community announcements.</p>
                        </div>
                        <Link to="/blog" className="hidden md:inline-flex items-center font-semibold text-primary hover:text-primary-dark transition-colors mt-4 md:mt-0">
                            View all updates <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.news.map((item, idx) => (
                             <NewsCard 
                                key={idx} 
                                badge={item.badge} 
                                badgeColor={item.badgeColor} 
                                date={item.date} 
                                title={item.title} 
                                description={item.description} 
                             />
                        ))}
                    </div>
                     <div className="mt-8 md:hidden text-center">
                        <Link to="/blog" className="inline-flex items-center font-semibold text-primary hover:text-primary-dark transition-colors">
                            View all updates <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                     </div>
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