import React from 'react';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-4 text-primary dark:text-primary-light">{icon}</div>
        <div>
            <h3 className="text-lg font-semibold">{label}</h3>
            <p className="text-gray-600 dark:text-gray-300">{value}</p>
        </div>
    </div>
);


const Contact: React.FC = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section className="bg-primary/10 dark:bg-primary/5 pt-32 pb-16 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Contact Us</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Get in touch with CVOCA</p>
                </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="text-center md:text-left">
                             <h2 className="text-2xl font-bold">CVO CHARTERED & COST ACCOUNTANTS ASSOCIATION</h2>
                             <p className="text-md text-gray-500 dark:text-gray-400">Professional Excellence Since 1973</p>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                             <InfoCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                label="Address"
                                value="304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E), Mumbai 400014, Maharashtra"
                            />
                            <InfoCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                label="Mobile"
                                value="+91-9167928622"
                            />
                             <InfoCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                label="Email"
                                value="info@cvoca.org"
                            />
                             <InfoCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                label="Office Hours"
                                value="Mon - Fri: 9:00 AM - 6:00 PM"
                            />
                        </div>
                    </div>
                     {/* Map Section */}
                     <div className="h-full">
                        <div className="text-center md:text-left mb-4">
                            <h2 className="text-3xl font-bold">Visit Our Office</h2>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Located in Dadar East, Mumbai - Easy access by local trains and buses.</p>
                        </div>
                        <div className="rounded-lg shadow-lg overflow-hidden h-96">
                             <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.954714571987!2d72.84654921489999!3d19.02172778711916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce4118b76c1f%3A0x644c21e5f8b3d681!2sDadar%20East%2C%20Dadar%2C%20Mumbai%2C%20Maharashtra%20400014%2C%20India!5e0!3m2!1sen!2sus!4v1678886400000!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="CVOCA Office Location"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;