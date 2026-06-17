import React from 'react';
import useSEO from '../hooks/useSEO';
import { canonical } from '../constants';
import Icon from '../components/Icon';

// Action Card Component
const ActionCard: React.FC<{
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    variant: 'primary' | 'secondary';
}> = ({ title, subtitle, description, icon, href, variant }) => {
    const isPrimary = variant === 'primary';

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border flex flex-col h-full ${
                isPrimary
                    ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700'
                    : 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-gray-700'
            }`}
        >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
                {/* Large Decorative Icon Background */}
                <div className="scale-[3] origin-top-right">{icon}</div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                        isPrimary
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                    }`}
                >
                    {icon}
                </div>

                <span
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        isPrimary ? 'text-primary' : 'text-secondary'
                    }`}
                >
                    {subtitle}
                </span>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 flex-grow">
                    {description}
                </p>

                <div
                    className={`flex items-center font-bold mt-auto ${
                        isPrimary ? 'text-primary' : 'text-gray-900 dark:text-white'
                    }`}
                >
                    {isPrimary ? 'Start Reading' : 'Start Writing'}
                    <Icon name="arrow-long-right" className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </a>
    );
};

const Blog: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'Knowledge Hub',
        description: 'CVOCA Knowledge Hub - Articles, insights, and updates for Chartered and Cost Accountants. Tax updates, technology trends, and career guidance for finance professionals.',
        canonicalUrl: canonical('/blog'),
        keywords: 'CVOCA blog, chartered accountants articles, tax updates India, CA knowledge hub, accounting insights'
    });

    return (
        <div className="animate-fadeIn bg-background-light dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-24 text-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                        Learn & Grow
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">CVOCA Knowledge Hub</h1>
                    <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Navigate the evolving landscape of finance, compliance, and governance with wisdom from across our professional community.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-12 pb-20">
                {/* Stats Bar */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center animate-fade-in-up">
                    <div>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">500+</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">Articles Published</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">50+</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">Expert Authors</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Weekly</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">Curated Updates</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">10k+</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">Monthly Readers</p>
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Read Card */}
                    <ActionCard
                        variant="primary"
                        href="https://blog.cvoca.org/"
                        subtitle="Official Platform"
                        title="Read Latest Insights"
                        description="Explore our comprehensive library of articles covering Direct Tax, GST, Audit, and Technology. Curated by industry veterans to keep you ahead of the curve."
                        icon={
                            <Icon name="book-open" className="w-8 h-8" />
                        }
                    />

                    {/* Submit Card */}
                    <ActionCard
                        variant="secondary"
                        href="https://blog.cvoca.org/submit-a-post/"
                        subtitle="Community Contribution"
                        title="Submit an Article"
                        description="Have expertise to share? Join our growing community of authors. Publish your research, case studies, or opinions and build your professional eminence."
                        icon={
                            <Icon name="pencil" className="w-8 h-8" />
                        }
                    />
                </div>

                {/* Footer Note */}
                <div className="text-center pt-8 pb-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Looking for something specific? <a href="https://blog.cvoca.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Search the archives</a> on our main blog site.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Blog;
