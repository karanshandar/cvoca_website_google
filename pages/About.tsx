
import React, { useState, useEffect } from 'react';
import { Committee, CommitteeMember, PastPresident, CoreMember, AnnualReport } from '../types';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-bold rounded-full focus:outline-none transition-all duration-300 transform ${active ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700'
            }`}
    >
        {children}
    </button>
);

const ServiceCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{title}</h3>
        <ul className="space-y-2">
            {React.Children.map(children, child => (
                <div className="flex items-start text-gray-600 dark:text-gray-300">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0"></span>
                    {child}
                </div>
            ))}
        </ul>
    </div>
);

const CommitteeRoleSection: React.FC<{ title: string; members?: CoreMember[] | CoreMember }> = ({ title, members }) => {
    if (!members) return null;
    const list = Array.isArray(members) ? members : [members];
    if (list.length === 0) return null;

    return (
        <div className="mb-4 last:mb-0 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h5 className="text-xs font-bold text-secondary dark:text-secondary-light uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-secondary rounded-full"></span>
                {title}
            </h5>
            <ul className="space-y-2">
                {list.map((member, idx) => (
                    <li key={idx} className="flex justify-between items-baseline text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</span>
                        <span className="text-xs text-gray-500 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                            {member.nativePlace}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CommitteeAccordion: React.FC<{ committee: Committee }> = ({ committee }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left transition-colors bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50"
            >
                <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{committee.name}</h4>
                </div>
                
                {/* Chairperson Preview in Header */}
                {committee.chairperson && (
                    <div className="flex items-center gap-3 md:border-l md:pl-4 border-gray-100 dark:border-gray-700">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            {/* Crown/User Icon for Chairperson */}
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Chairperson</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {(committee.chairperson as CoreMember).name}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`}>
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>

            {/* Accordion Body */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <CommitteeRoleSection title="Advisors" members={committee.advisors} />
                        <CommitteeRoleSection title="Convenors" members={committee.convenors} />
                        <CommitteeRoleSection title="Joint Convenors" members={committee.jointConvenors} />
                        <CommitteeRoleSection title="Special Invitees" members={committee.specialInvitees} />
                        <div className="md:col-span-2">
                            <CommitteeRoleSection title="Sub Committee" members={committee.subCommittee} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnnualReportsSection: React.FC<{ reports: AnnualReport[] }> = ({ reports }) => {
    const [showAll, setShowAll] = useState(false);

    if (!reports || reports.length === 0) return null;

    // Filter to find the featured report (either marked isNew or the first one)
    const featuredReport = reports.find(r => r.isNew) || reports[0];
    // The rest of the reports
    const previousReports = reports.filter(r => r !== featuredReport);

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Annual Reports & Governance</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Explore our journey of transparency and growth. Access detailed accounts of our activities, financial health, and community initiatives.
                </p>
            </div>

            {/* Featured Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 text-white shadow-2xl p-6 md:p-12 mb-10 border border-blue-500/30 dark:border-gray-700">
                 {/* Background decoration */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 dark:bg-blue-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
                 
                 <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/20 dark:bg-blue-500/20 backdrop-blur-sm border border-white/20 dark:border-blue-500/30 text-white dark:text-blue-100 rounded-full">
                                Latest Release
                            </span>
                            <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 dark:bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 dark:border-emerald-500/20 text-emerald-100 dark:text-emerald-300 rounded-full">
                                {featuredReport.year}
                            </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-3 tracking-tight break-words leading-tight text-white">
                            {featuredReport.title}
                        </h3>
                        <p className="text-blue-100 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                            {featuredReport.description || 'Comprehensive review of financials, events, and strategic initiatives for the fiscal year.'}
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                        <a 
                            href={featuredReport.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-4 bg-white dark:bg-primary text-blue-700 dark:text-white font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <span>Download PDF</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                    </div>
                 </div>
            </div>

            {/* Toggle Button */}
            {previousReports.length > 0 && (
                <div className="flex flex-col items-center">
                     <button 
                        onClick={() => setShowAll(!showAll)}
                        className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:text-primary dark:hover:text-primary transition-all mb-8 z-10 relative"
                     >
                        {showAll ? 'Hide Archive' : 'View Archive'}
                        <svg className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </button>
                </div>
            )}

            {/* Grid Reveal */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-500 ease-in-out ${showAll ? 'opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-4'}`}>
                {previousReports.map((report, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-md transition-all flex flex-col justify-between group h-full">
                        <div className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 px-2 py-1 rounded">FY {report.year}</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">{report.title}</h4>
                        </div>
                        <a href={report.link} target="_blank" rel="noopener noreferrer" className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg transition-all">
                            Download
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

const About: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'managing' | 'core' | 'past'>('managing');
    const [managingCommittee, setManagingCommittee] = useState<CommitteeMember[]>([]);
    const [pastPresidents, setPastPresidents] = useState<PastPresident[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [annualReports, setAnnualReports] = useState<AnnualReport[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Core Committee Search
    const [coreSearch, setCoreSearch] = useState('');

    // Past Presidents Filter & Sort State
    const [ppSearch, setPpSearch] = useState('');
    const [ppSort, setPpSort] = useState<{ key: keyof PastPresident; direction: 'asc' | 'desc' }>({ key: 'srNo', direction: 'asc' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [mcRes, ppRes, cRes, arRes] = await Promise.all([
                    fetch('/data/managingCommittee.json'),
                    fetch('/data/pastPresidents.json'),
                    fetch('/data/committees.json'),
                    fetch('/data/annualReports.json')
                ]);
                
                // Note: We check individual responses but allow partial failures if needed, 
                // though Promise.all fails fast. Ideally, we handle errors per fetch.
                const mcData = mcRes.ok ? await mcRes.json() : [];
                const ppData = ppRes.ok ? await ppRes.json() : [];
                const cData = cRes.ok ? await cRes.json() : [];
                const arData = arRes.ok ? await arRes.json() : [];
                
                setManagingCommittee(mcData);
                // Assign Serial Numbers
                const ppWithSr = ppData.map((p: any, i: number) => ({ ...p, srNo: i + 1 }));
                setPastPresidents(ppWithSr);
                setCommittees(cData);
                setAnnualReports(arData);
            } catch (error) {
                console.error("Failed to fetch about page data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderTabContent = () => {
        if (loading) {
            return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
        }
        switch (activeTab) {
            case 'managing':
                return (
                    // Using 3 columns max to prevent name wrapping on desktop
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {managingCommittee.map(member => (
                            <div key={member.name} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                                <div className="relative w-28 h-28 mx-auto mb-5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-md"></div>
                                    <img src={member.photoUrl} alt={member.name} className="relative w-full h-full rounded-full object-cover shadow-md border-2 border-white dark:border-slate-700" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight">{member.name}</h4>
                                <p className="text-sm font-medium text-primary dark:text-primary-light">{member.role}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'core':
                // Helper to check if a member string includes search term
                const checkMember = (member: CoreMember | undefined) => 
                    member?.name.toLowerCase().includes(coreSearch.toLowerCase()) || 
                    member?.nativePlace.toLowerCase().includes(coreSearch.toLowerCase());

                const filteredCommittees = committees.filter(c => {
                    const search = coreSearch.toLowerCase();
                    if (c.name.toLowerCase().includes(search)) return true;
                    if (checkMember(c.chairperson as CoreMember)) return true;
                    if (c.advisors?.some(checkMember)) return true;
                    if (c.convenors?.some(checkMember)) return true;
                    if (c.jointConvenors?.some(checkMember)) return true;
                    if (c.specialInvitees?.some(checkMember)) return true;
                    if (c.subCommittee?.some(checkMember)) return true;
                    return false;
                });

                return (
                    <div className="space-y-6">
                        {/* Search for Core Committees */}
                        <div className="flex justify-end mb-6">
                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search committee or member..."
                                    value={coreSearch}
                                    onChange={(e) => setCoreSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Accordion List */}
                        <div className="space-y-4">
                            {filteredCommittees.map((committee, index) => (
                                <CommitteeAccordion key={index} committee={committee} />
                            ))}
                        </div>
                        
                        {filteredCommittees.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No committees found matching "{coreSearch}"</p>
                            </div>
                        )}
                    </div>
                );
            case 'past':
                // Filtering and Sorting Logic
                const sortedAndFilteredPresidents = [...pastPresidents]
                    .filter(p => 
                        p.name.toLowerCase().includes(ppSearch.toLowerCase()) || 
                        p.term.includes(ppSearch) ||
                        (p.village && p.village.toLowerCase().includes(ppSearch.toLowerCase()))
                    )
                    .sort((a, b) => {
                        const key = ppSort.key;
                        const dir = ppSort.direction === 'asc' ? 1 : -1;
                        
                        if (key === 'srNo') {
                             return ((a.srNo || 0) - (b.srNo || 0)) * dir;
                        }
                        if (key === 'name') {
                            return a.name.localeCompare(b.name) * dir;
                        }
                        if (key === 'term') {
                            return a.term.localeCompare(b.term) * dir;
                        }
                        if (key === 'village') {
                            return (a.village || '').localeCompare(b.village || '') * dir;
                        }
                        return 0;
                    });

                const handleSort = (key: keyof PastPresident) => {
                    setPpSort(current => ({
                        key,
                        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
                    }));
                };
                
                const SortIcon = ({ column }: { column: keyof PastPresident }) => {
                    if (ppSort.key !== column) return <svg className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
                    return ppSort.direction === 'asc' 
                        ? <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        : <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
                };

                return (
                    <div className="space-y-6">
                         {/* Filter Bar */}
                        <div className="flex justify-end">
                            <div className="relative w-full md:w-72 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, year or village..."
                                    value={ppSearch}
                                    onChange={(e) => setPpSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Mobile View: Card Layout */}
                        <div className="md:hidden space-y-4">
                            {sortedAndFilteredPresidents.map((president) => (
                                <div key={president.name} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                     <div className="flex justify-between items-start">
                                         <div className="flex items-center gap-3">
                                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                  {president.srNo ? String(president.srNo).padStart(2, '0') : '-'}
                                              </span>
                                              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{president.name}</h4>
                                         </div>
                                     </div>
                                     <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Term</span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">{president.term}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Native Place</span>
                                             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 mt-1">
                                                {president.village}
                                            </span>
                                        </div>
                                     </div>
                                </div>
                            ))}
                            {sortedAndFilteredPresidents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No records found matching "{ppSearch}"
                                </div>
                            )}
                        </div>

                        {/* Desktop View: Table Layout */}
                        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th 
                                                scope="col" 
                                                onClick={() => handleSort('srNo')}
                                                className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group select-none w-20"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    Sr. No.
                                                    <SortIcon column="srNo" />
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                onClick={() => handleSort('name')}
                                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group select-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    President Name
                                                    <SortIcon column="name" />
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                onClick={() => handleSort('term')}
                                                className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group select-none w-40"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    Term Year
                                                    <SortIcon column="term" />
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                onClick={() => handleSort('village')}
                                                className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group select-none w-48"
                                            >
                                                <div className="flex items-center gap-2">
                                                    Native Place
                                                    <SortIcon column="village" />
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {sortedAndFilteredPresidents.map((president) => (
                                            <tr key={president.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono font-bold text-center">
                                                    {president.srNo ? String(president.srNo).padStart(2, '0') : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {president.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono text-center">
                                                    {president.term}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                        {president.village}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {sortedAndFilteredPresidents.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    No records found matching "{ppSearch}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400 italic">
                            Showing {sortedAndFilteredPresidents.length} records
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="animate-fadeIn bg-gray-50 dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-24 text-center overflow-hidden">
                 <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                        Legacy of Excellence
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">About CVOCA</h1>
                    <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
                        Five decades of empowering Chartered & Cost Accountants through knowledge, networking, and professional growth.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 -mt-12 relative z-10">
                
                {/* Organization Profile */}
                <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Heritage</h2>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p>The Cutchi Visa Oswal Chartered and Cost Accountants Association (CVOCA) is a distinguished voluntary organization established in <span className="font-bold text-primary">1973</span> with 'Professional Excellence' as our guiding motto.</p>
                            <p>We proudly serve Chartered Accountants, Cost Accountants, and Company Secretaries from the Cutchi Visa Oswal (CVO) community, building an impeccable reputation for upholding ethical values and promoting excellence across multiple disciplines.</p>
                        </div>
                    </div>
                </section>

                 {/* Vision and Mission */}
                 <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 p-10 rounded-3xl border border-blue-100 dark:border-slate-700 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Vision</h2>
                        <ul className="space-y-4">
                            {["Most reputed knowledge organization", "Nucleus of activity & unity", "Proactive economic development"].map((item, i) => (
                                <li key={i} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary mr-4">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-200 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-slate-800 dark:to-slate-900 p-10 rounded-3xl border border-cyan-100 dark:border-slate-700 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            To foster professional excellence, promote ethical practices, and create a supportive community while driving innovation and growth in the financial sector. We strive to be the catalyst for our members' success in a rapidly evolving global economy.
                        </p>
                    </div>
                </section>

                {/* Service Areas */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What We Do</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Comprehensive support for every stage of your career</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ServiceCard title="Professional Development">
                            <li>Technical seminars & workshops</li>
                            <li>Annual tax conferences</li>
                            <li>Leadership summits</li>
                        </ServiceCard>
                        <ServiceCard title="Knowledge & Research">
                           <li>Monthly bulletins (CVO CA News)</li>
                           <li>Research publications</li>
                           <li>Digital resource library</li>
                        </ServiceCard>
                         <ServiceCard title="Member Support">
                           <li>Networking forums</li>
                           <li>Career guidance & mentorship</li>
                           <li>Practice management tools</li>
                        </ServiceCard>
                         <ServiceCard title="Student Initiatives">
                           <li>Educational assistance</li>
                           <li>Study circles & libraries</li>
                           <li>Soft skills training</li>
                        </ServiceCard>
                         <ServiceCard title="Advocacy">
                           <li>Policy representations to Govt.</li>
                           <li>Regulatory updates</li>
                           <li>Industry feedback forums</li>
                        </ServiceCard>
                         <ServiceCard title="Community & Social">
                           <li>Cultural festivals & gatherings</li>
                           <li>Sports tournaments</li>
                           <li>Digital outreach programs</li>
                        </ServiceCard>
                    </div>
                </section>

                {/* Organizational Structure */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Leadership & Structure</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">The dedicated teams driving our mission forward</p>
                    </div>
                    
                    <div className="flex justify-center mb-10">
                        <nav className="flex p-1 space-x-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                            <TabButton active={activeTab === 'managing'} onClick={() => setActiveTab('managing')}>Managing Committee</TabButton>
                            <TabButton active={activeTab === 'core'} onClick={() => setActiveTab('core')}>Core Committees</TabButton>
                            <TabButton active={activeTab === 'past'} onClick={() => setActiveTab('past')}>Past Presidents</TabButton>
                        </nav>
                    </div>
                    
                    <div className="min-h-[400px]">
                        {renderTabContent()}
                    </div>
                </section>

                {/* Annual Reports Section */}
                <section>
                    <AnnualReportsSection reports={annualReports} />
                </section>
            </div>
        </div>
    );
};

export default About;
