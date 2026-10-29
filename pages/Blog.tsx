import React from 'react';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import Icon from '../components/Icon';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';

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
            className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-background-dark"
        >
            <Card interactive padding="xl" className="relative overflow-hidden flex flex-col h-full">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
                {/* Large Decorative Icon Background */}
                <div className="scale-[3] origin-top-right">{icon}</div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                        isPrimary
                            ? 'bg-primary/10 text-primary dark:text-primary-light'
                            : 'bg-secondary/10 text-secondary dark:text-secondary-light'
                    }`}
                >
                    {icon}
                </div>

                <span
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        isPrimary ? 'text-primary dark:text-primary-light' : 'text-secondary-700 dark:text-secondary-light'
                    }`}
                >
                    {subtitle}
                </span>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 flex-grow">
                    {description}
                </p>

                <div
                    className={`flex items-center font-bold mt-auto ${
                        isPrimary ? 'text-primary dark:text-primary-light' : 'text-gray-900 dark:text-white'
                    }`}
                >
                    {isPrimary ? 'Start Reading' : 'Start Writing'}
                    <Icon name="arrow-long-right" className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="sr-only"> (opens in new tab)</span>
                </div>
            </div>
            </Card>
        </a>
    );
};

const Blog: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/blog'));

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <PageHero
                eyebrow="Learn & Grow"
                title="CVOCA Knowledge Hub"
                lede="Navigate the evolving landscape of finance, compliance, and governance with wisdom from across our professional community."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-12 pb-20">
                {/* Stats Bar */}
                <Card emphasis className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center animate-fade-in-up">
                    <Stat value="500+" label="Articles Published" />
                    <Stat value="50+" label="Expert Authors" />
                    <Stat value="Weekly" label="Curated Updates" />
                    <Stat value="10k+" label="Monthly Readers" />
                </Card>

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
                        Looking for something specific? <a href="https://blog.cvoca.org/" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-light hover:underline">Search the archives</a> on our main blog site.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Blog;
