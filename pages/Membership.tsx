import React, { useState, useEffect } from 'react';
import { MembershipData } from '../types';

const BenefitCard: React.FC<{ title: string; iconPath: string; children: React.ReactNode }> = ({ title, iconPath, children }) => (
    <div className="group flex items-start p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center mr-5 transition-colors duration-300">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
        </div>
    </div>
);

const TierCard: React.FC<{ tier: string; price: string; period: string; benefits: string[]; link: string; variant: 'student' | 'professional' }> = ({ tier, price, period, benefits, link, variant }) => {
    
    const isStudent = variant === 'student';
    
    // Theme configurations
    const theme = {
        primaryColor: isStudent ? 'text-cyan-600 dark:text-cyan-400' : 'text-blue-600 dark:text-blue-400',
        gradientBg: isStudent ? 'from-cyan-400 to-teal-500' : 'from-blue-500 to-indigo-600',
        lightBg: isStudent ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
        buttonGradient: isStudent ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-cyan-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30',
        iconBg: isStudent ? 'bg-gradient-to-br from-cyan-400 to-teal-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600',
        borderColor: isStudent ? 'group-hover:border-cyan-200 dark:group-hover:border-cyan-800' : 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
        glowColor: isStudent ? 'group-hover:shadow-cyan-500/20' : 'group-hover:shadow-blue-500/20'
    };

    return (
        <div className={`group relative h-full flex flex-col`}>
             {/* Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-b ${theme.gradientBg} rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-500`}></div>
            
            <div className={`relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl transition-all duration-300 ${theme.borderColor} ${theme.glowColor} overflow-hidden`}>
                
                {/* Decorative Background Shape */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${theme.lightBg} blur-3xl opacity-50`}></div>
                
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tier}</h3>
                        <div className="flex items-baseline flex-wrap">
                            <span className={`text-5xl font-extrabold tracking-tight ${theme.primaryColor}`}>{price}</span>
                            <span className="ml-2 text-sm text-gray-400 font-medium uppercase tracking-wide">{period}</span>
                        </div>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center text-white shadow-lg transform rotate-3 group-hover:rotate-12 transition-all duration-300`}>
                        {isStudent ? (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                        ) : (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-8"></div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.lightBg} flex items-center justify-center mr-3.5 mt-0.5`}>
                                <svg className={`w-3.5 h-3.5 ${theme.primaryColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{benefit}</span>
                        </li>
                    ))}
                </ul>

                <a 
                    href={link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-full py-4 rounded-xl text-white font-bold text-center tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:translate-y-[-2px] ${theme.buttonGradient}`}
                >
                    Register Now
                </a>
            </div>
        </div>
    );
};

const EligibilitySection: React.FC = () => (
    <section className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Eligibility Criteria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                {/* Life Members */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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

                     <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm flex-1">
                        <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                            <span className="font-bold italic">Note:</span> Only Life Members shall be regarded as members of the Association for all purposes under the Rules and Regulations and the Societies Registration Act, 1860.
                        </p>
                    </div>
                </div>

                {/* Students */}
                 <div className="flex flex-col h-full">
                     <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
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

                    <div className="mt-8 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-900/20 flex-1">
                        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-3 tracking-wide">Membership Cessation Conditions</h4>
                         <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                                    <span>Passing the final examination of the respective institute (ICAI/ICMAI/ICSI).</span>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                                    <span>Completion of 5 years from the date of registration as a student.</span>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                                    <span>Voluntary or involuntary discontinuation of the professional course.</span>
                                </li>
                            </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const Membership: React.FC = () => {
    const [data, setData] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/membership.json')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch membership data", err);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="animate-fadeIn bg-background-light dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <section className="bg-slate-900 pt-32 pb-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-primary/10 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
                        Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Professional Future</span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Join an elite community of Chartered & Cost Accountants. Unlock exclusive resources, networking, and growth opportunities.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24 -mt-12 relative z-10">
                
                {/* Membership Tiers */}
                <section>
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
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Why Join CVOCA?</h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Comprehensive benefits designed to accelerate your career.</p>
                    </div>
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