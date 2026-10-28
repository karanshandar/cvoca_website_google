import React from 'react';
import { MembershipData } from '../types';
import useFetch from '../hooks/useFetch';
import useSEO from '../hooks/useSEO';
import { routeSEO } from '../seo/pages';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import { fetchJson } from '../utils/fetchJson';
import Icon from '../components/Icon';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import IconTile from '../components/ui/IconTile';

const BenefitCard: React.FC<{ title: string; iconPath: string; children: React.ReactNode }> = ({ title, iconPath, children }) => (
    <Card className="group flex items-start h-full">
        <IconTile className="mr-5">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </IconTile>
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
        </div>
    </Card>
);

const TierCard: React.FC<{ tier: string; price: string; period: string; benefits: string[]; link: string; variant: 'student' | 'professional' }> = ({ tier, price, period, benefits, link, variant }) => {
    
    const isStudent = variant === 'student';
    
    // Theme configurations
    const theme = {
        primaryColor: isStudent ? 'text-secondary dark:text-secondary-light' : 'text-primary dark:text-primary-light',
        gradientBg: isStudent ? 'from-secondary-light to-secondary-dark' : 'from-primary to-accent',
        lightBg: isStudent ? 'bg-secondary-50 dark:bg-secondary-900/20' : 'bg-primary-50 dark:bg-primary-900/20',
        iconBg: isStudent ? 'bg-gradient-to-br from-secondary-light to-secondary-dark' : 'bg-gradient-to-br from-primary to-accent',
        borderColor: isStudent ? 'group-hover:border-secondary-200 dark:group-hover:border-secondary-800' : 'group-hover:border-primary-200 dark:group-hover:border-primary-800',
    };

    return (
        <div className={`group relative h-full flex flex-col`}>
             {/* Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-b ${theme.gradientBg} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition duration-500`}></div>
            
            <Card padding="xl" emphasis className={`relative flex flex-col h-full transition-all duration-300 ${theme.borderColor} overflow-hidden`}>
                
                {/* Decorative Background Shape */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${theme.lightBg} blur-3xl opacity-50`}></div>
                
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tier}</h3>
                        <div className="flex items-baseline flex-wrap">
                            <span className={`text-5xl font-extrabold tracking-tight ${theme.primaryColor}`}>{price}</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{period}</span>
                        </div>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center text-white shadow-lg transform rotate-3 group-hover:rotate-12 transition-all duration-300`}>
                        {isStudent ? (
                            <Icon name="academic-cap" className="w-7 h-7" />
                        ) : (
                            <Icon name="id-card" className="w-7 h-7" />
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-8"></div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.lightBg} flex items-center justify-center mr-3.5 mt-0.5`}>
                                <Icon name="check" className={`w-3.5 h-3.5 ${theme.primaryColor}`} strokeWidth={3} />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{benefit}</span>
                        </li>
                    ))}
                </ul>

                <Button href={link} target="_blank" className="relative z-10 w-full">
                    Register Now
                </Button>
            </Card>
        </div>
    );
};

const EligibilitySection: React.FC = () => (
    <Card as="section" padding="none" className="overflow-hidden">
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Eligibility Criteria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                {/* Life Members */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary dark:text-primary-light">
                            <Icon name="badge-check" className="w-6 h-6" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Life Members</h3>
                    </div>
                    
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            Open to any individual belonging to the <strong>Cutchi Visa Oswal</strong> community who has cleared the final examination of any of the following institutes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200 font-medium ml-1">
                            <li>The Institute of Chartered Accountants of India (ICAI)</li>
                            <li>The Institute of Cost Accountants of India (ICMAI)</li>
                            <li>The Institute of Company Secretaries of India (ICSI)</li>
                        </ul>
                    </div>

                     <div className="mt-8 p-5 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20 text-sm flex-1">
                        <p className="text-primary-800 dark:text-primary-300 leading-relaxed">
                            <span className="font-bold italic">Note:</span> Only Life Members shall be regarded as members of the Association for all purposes under the Rules and Regulations and the Societies Registration Act, 1860.
                        </p>
                    </div>
                </div>

                {/* Students */}
                 <div className="flex flex-col h-full">
                     <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary dark:text-secondary-light">
                            <Icon name="academic-cap" className="w-6 h-6" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student Associates</h3>
                    </div>
                    
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            Open to any <strong>Cutchi Visa Oswal</strong> student currently registered with any of the following institutes:
                        </p>
                        
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200 font-medium ml-1">
                            <li>The Institute of Chartered Accountants of India (ICAI)</li>
                            <li>The Institute of Cost Accountants of India (ICMAI)</li>
                            <li>The Institute of Company Secretaries of India (ICSI)</li>
                        </ul>
                    </div>

                    <div className="mt-8 bg-warning-50 dark:bg-warning/10 p-5 rounded-xl border border-warning-100 dark:border-warning/20 flex-1">
                        <h4 className="text-sm font-bold text-warning-700 dark:text-warning-light mb-3 tracking-wide">Membership Cessation Conditions</h4>
                         <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0"></span>
                                    <span>Passing the final examination of the respective institute (ICAI/ICMAI/ICSI).</span>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0"></span>
                                    <span>Completion of 5 years from the date of registration as a student.</span>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0"></span>
                                    <span>Voluntary or involuntary discontinuation of the professional course.</span>
                                </li>
                            </ul>
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

const Membership: React.FC = () => {
    // SEO Meta Tags
    useSEO(routeSEO('/membership'));

    const { data, loading, error } = useFetch<MembershipData>(
        () => fetchJson<MembershipData>('/data/membership.json'),
    );

    if (error) {
        return <LoadError fullPage />;
    }

    if (loading || !data) {
        return <LoadingSpinner fullPage />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <PageHero
                title={<>Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">Professional Future</span></>}
                lede="Join an elite community of Chartered & Cost Accountants. Unlock exclusive resources, networking, and growth opportunities."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24 -mt-12 relative z-10">
                
                {/* Membership Tiers */}
                <section>
                    <h2 className="sr-only">Membership plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {data.tiers.map((tier, index) => (
                             <TierCard
                                key={index}
                                tier={tier.tier}
                                price={tier.price}
                                period={tier.period}
                                link={tier.link}
                                variant={tier.variant}
                                benefits={tier.benefits}
                            />
                        ))}
                    </div>
                </section>

                {/* Membership Benefits Grid */}
                <section>
                    <SectionHeader className="mb-16" title="Why Join CVOCA?" lede="Comprehensive benefits designed to accelerate your career." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.generalBenefits.map((benefit, index) => (
                            <BenefitCard 
                                key={index}
                                title={benefit.title} 
                                iconPath={benefit.iconPath}
                            >
                                {benefit.description}
                            </BenefitCard>
                        ))}
                    </div>
                </section>

                {/* Eligibility Section */}
                <EligibilitySection />
            </div>
        </div>
    );
};

export default Membership;