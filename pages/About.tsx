
import React, { useState, useId } from 'react';
import { Committee, CommitteeMember, PastPresident, CoreMember, AnnualReport } from '../types';
import useSEO from '../hooks/useSEO';
import { canonical } from '../constants';
import { fetchManagingCommittee, fetchCommittees, fetchAnnualReports, fetchPastPresidents } from '../utils/googleSheets';
import { fetchWithFallback } from '../utils/fetchWithFallback';
import { getOptimizedImageUrl, ImageSizePresets } from '../utils/imageUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadError from '../components/LoadError';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';
import PageHero from '../components/ui/PageHero';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SearchInput from '../components/ui/SearchInput';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        role="tab"
        aria-selected={active}
        onClick={onClick}
        className={`flex-1 sm:flex-none px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm leading-tight sm:leading-normal font-bold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 ${active ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700'
            }`}
    >
        {children}
    </button>
);

const ServiceCard: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <Card padding="xl">
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{title}</h3>
        <ul className="space-y-2">
            {items.map(item => (
                <li key={item} className="flex items-start text-gray-600 dark:text-gray-300">
                    <span aria-hidden="true" className="mr-2 mt-1.5 h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0"></span>
                    {item}
                </li>
            ))}
        </ul>
    </Card>
);

type SortState = { key: keyof PastPresident; direction: 'asc' | 'desc' };

const SortableHeader: React.FC<{
    label: string;
    column: keyof PastPresident;
    sort: SortState;
    onSort: (column: keyof PastPresident) => void;
    align: 'left' | 'center';
    className?: string;
}> = ({ label, column, sort, onSort, align, className = '' }) => {
    const isActive = sort.key === column;
    return (
        <th
            scope="col"
            aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
            className={`p-0 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}
        >
            <button
                type="button"
                onClick={() => onSort(column)}
                className={`group w-full px-6 py-4 flex items-center gap-2 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${align === 'center' ? 'justify-center' : 'justify-start'}`}
            >
                {label}
                {!isActive ? (
                    <Icon name="sort" className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-50 group-focus-visible:opacity-50 transition-opacity" />
                ) : sort.direction === 'asc' ? (
                    <Icon name="chevron-up" className="w-4 h-4 text-primary dark:text-primary-light" />
                ) : (
                    <Icon name="chevron-down" className="w-4 h-4 text-primary dark:text-primary-light" />
                )}
            </button>
        </th>
    );
};

const CommitteeRoleSection: React.FC<{ title: string; members?: CoreMember[] | CoreMember }> = ({ title, members }) => {
    if (!members) return null;
    const list = Array.isArray(members) ? members : [members];
    if (list.length === 0) return null;

    return (
        <div className="mb-4 last:mb-0 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h4 className="text-xs font-bold text-secondary dark:text-secondary-light uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-secondary rounded-full"></span>
                {title}
            </h4>
            <ul className="space-y-2">
                {list.map((member, idx) => (
                    <li key={idx} className="flex justify-between items-baseline text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
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
    const bodyId = useId();

    return (
        <Card padding="none" className="overflow-hidden">
            <h3>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={bodyId}
                className="w-full px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left transition-colors bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
                <span className="flex-1 text-lg font-bold text-gray-900 dark:text-white">{committee.name}</span>

                {/* Chairperson Preview in Header */}
                {committee.chairperson && (
                    <span className="flex items-center gap-3 md:border-l md:pl-4 border-gray-100 dark:border-gray-700">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center">
                            {/* Crown/User Icon for Chairperson */}
                            <Icon name="shield-check" className="w-5 h-5" />
                        </span>
                        <span className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Chairperson</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {(committee.chairperson as CoreMember).name}
                            </span>
                        </span>
                    </span>
                )}

                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`}>
                    <Icon name="chevron-down" className="w-5 h-5" />
                </span>
            </button>
            </h3>

            {/* Accordion Body (inert while collapsed, so hidden content is skipped by keyboard and screen readers) */}
            <div id={bodyId} inert={!isOpen} className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
        </Card>
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent dark:from-slate-800 dark:to-slate-900 text-white shadow-2xl p-6 md:p-12 mb-10 border border-primary/30 dark:border-gray-700">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/30 dark:bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge>Latest Release</Badge>
                            <Badge tone="success">{featuredReport.year}</Badge>
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-3 tracking-tight break-words leading-tight text-white">
                            {featuredReport.title}
                        </h3>
                        <p className="text-primary-100 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                            {featuredReport.description || 'Comprehensive review of financials, events, and strategic initiatives for the fiscal year.'}
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                        <a
                            href={featuredReport.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-4 bg-white dark:bg-primary text-primary dark:text-white font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <span>Download PDF</span>
                            <Icon name="download" className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            {previousReports.length > 0 && (
                <div className="flex flex-col items-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:text-primary dark:hover:text-primary-light transition-all mb-8 z-10 relative"
                    >
                        {showAll ? 'Hide Archive' : 'View Archive'}
                        <Icon name="chevron-down" className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            )}

            {/* Grid Reveal */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-500 ease-in-out ${showAll ? 'opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-4'}`}>
                {previousReports.map((report, idx) => (
                    <Card key={idx} padding="md" className="flex flex-col justify-between group h-full">
                        <div className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge tone="neutral">FY {report.year}</Badge>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">{report.title}</h3>
                        </div>
                        <a href={report.link} target="_blank" rel="noopener noreferrer" className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg transition-all">
                            Download
                            <Icon name="download" className="w-4 h-4" />
                        </a>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const About: React.FC = () => {
    // SEO Meta Tags
    useSEO({
        title: 'About Us',
        description: 'Learn about CVOCA - CVO Chartered & Cost Accountants Association. Established in 1973, we are a premier professional body serving 2,400+ members in Mumbai with networking and development opportunities.',
        canonicalUrl: canonical('/about'),
        keywords: 'CVOCA history, about CVOCA, chartered accountants association Mumbai, managing committee, past presidents'
    });

    const [activeTab, setActiveTab] = useState<'managing' | 'core' | 'past'>('managing');

    // Core Committee Search
    const [coreSearch, setCoreSearch] = useState('');

    // Past Presidents Filter & Sort State
    const [ppSearch, setPpSearch] = useState('');
    const [ppSort, setPpSort] = useState<SortState>({ key: 'srNo', direction: 'asc' });

    const { data, loading, error } = useFetch<[CommitteeMember[], Committee[], AnnualReport[], PastPresident[]]>(
        () =>
            Promise.all([
                fetchWithFallback(fetchManagingCommittee, '/data/managingCommittee.json'),
                fetchWithFallback(fetchCommittees, '/data/committees.json'),
                fetchWithFallback(fetchAnnualReports, '/data/annualReports.json'),
                fetchWithFallback(fetchPastPresidents, '/data/pastPresidents.json'),
            ]) as unknown as Promise<[CommitteeMember[], Committee[], AnnualReport[], PastPresident[]]>,
    );
    const [managingCommittee, committees, annualReports, presidentRows] = data ?? [[], [], [], []];
    // Number past presidents in source order (Sheets or the JSON fallback, which has no srNo)
    const pastPresidents = presidentRows.map((president, index) => ({ ...president, srNo: index + 1 }));

    const renderTabContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <LoadError />;
        }
        switch (activeTab) {
            case 'managing':
                return (
                    // Using 3 columns max to prevent name wrapping on desktop
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {managingCommittee.map(member => (
                            <Card key={member.name} className="group text-center">
                                <div className="relative w-28 h-28 mx-auto mb-5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-md"></div>
                                    <img src={getOptimizedImageUrl(member.photoUrl, ImageSizePresets.TEAM_PHOTO)} alt={member.name} loading="lazy" decoding="async" className="relative w-full h-full rounded-full object-cover shadow-md border-2 border-white dark:border-slate-700" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight">{member.name}</h3>
                                <p className="text-sm font-medium text-primary dark:text-primary-light">{member.role}</p>
                            </Card>
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
                            <SearchInput
                                label="Search committees or members"
                                placeholder="Search committee or member..."
                                value={coreSearch}
                                onChange={setCoreSearch}
                                className="w-full md:w-96"
                            />
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

                return (
                    <div className="space-y-6">
                        {/* Filter Bar */}
                        <div className="flex justify-end">
                            <SearchInput
                                label="Search past presidents"
                                placeholder="Search by name, year or village..."
                                value={ppSearch}
                                onChange={setPpSearch}
                                className="w-full md:w-72"
                            />
                        </div>

                        {/* Mobile View: Card Layout */}
                        <div className="md:hidden space-y-4">
                            {sortedAndFilteredPresidents.map((president) => (
                                <Card key={president.name} padding="md" className="flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                {president.srNo ? String(president.srNo).padStart(2, '0') : '-'}
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{president.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Term</span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">{president.term}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Native Place</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-100 dark:border-primary-800 mt-1">
                                                {president.village}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {sortedAndFilteredPresidents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No records found matching "{ppSearch}"
                                </div>
                            )}
                        </div>

                        {/* Desktop View: Table Layout */}
                        <Card padding="none" className="hidden md:block overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                                        <tr>
                                            <SortableHeader label="Sr. No." column="srNo" sort={ppSort} onSort={handleSort} align="center" className="w-20" />
                                            <SortableHeader label="President Name" column="name" sort={ppSort} onSort={handleSort} align="left" />
                                            <SortableHeader label="Term Year" column="term" sort={ppSort} onSort={handleSort} align="center" className="w-40" />
                                            <SortableHeader label="Native Place" column="village" sort={ppSort} onSort={handleSort} align="left" className="w-48" />
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
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
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
                        </Card>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400 italic">
                            Showing {sortedAndFilteredPresidents.length} records
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="bg-gray-50 dark:bg-background-dark min-h-screen">
            {/* Hero Section */}
            <PageHero
                eyebrow="Legacy of Excellence"
                title="About CVOCA"
                lede="Five decades of empowering Chartered & Cost Accountants through knowledge, networking, and professional growth."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 -mt-12 relative z-10">

                {/* Organization Profile */}
                <Card as="section" padding="xl" emphasis>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Heritage</h2>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p>The Cutchi Visa Oswal Chartered and Cost Accountants Association (CVOCA) is a distinguished voluntary organization established in <span className="font-bold text-primary dark:text-primary-light">1973</span> with 'Professional Excellence' as our guiding motto.</p>
                            <p>We proudly serve Chartered Accountants, Cost Accountants, and Company Secretaries from the Cutchi Visa Oswal (CVO) community, building an impeccable reputation for upholding ethical values and promoting excellence across multiple disciplines.</p>
                        </div>
                    </div>
                </Card>

                {/* Vision and Mission */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 p-10 rounded-2xl border border-primary-100 dark:border-slate-700 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Vision</h2>
                        <ul className="space-y-4">
                            {["Most reputed knowledge organization", "Nucleus of activity & unity", "Proactive economic development"].map((item, i) => (
                                <li key={i} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary dark:text-primary-light mr-4">
                                        <Icon name="check" className="w-5 h-5" strokeWidth={3} />
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-200 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-secondary-50 to-white dark:from-slate-800 dark:to-slate-900 p-10 rounded-2xl border border-secondary-100 dark:border-slate-700 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
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
                        <ServiceCard title="Professional Development" items={["Technical seminars & workshops", "Annual tax conferences", "Leadership summits"]} />
                        <ServiceCard title="Knowledge & Research" items={["Monthly bulletins (CVO CA News)", "Research publications", "Digital resource library"]} />
                        <ServiceCard title="Member Support" items={["Networking forums", "Career guidance & mentorship", "Practice management tools"]} />
                        <ServiceCard title="Student Initiatives" items={["Educational assistance", "Study circles & libraries", "Soft skills training"]} />
                        <ServiceCard title="Advocacy" items={["Policy representations to Govt.", "Regulatory updates", "Industry feedback forums"]} />
                        <ServiceCard title="Community & Social" items={["Cultural festivals & gatherings", "Sports tournaments", "Digital outreach programs"]} />
                    </div>
                </section>

                {/* Organizational Structure */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Leadership & Structure</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">The dedicated teams driving our mission forward</p>
                    </div>

                    <div className="flex justify-center mb-10">
                        <nav role="tablist" aria-label="Leadership and structure" className="flex w-full sm:w-auto p-1 space-x-1 sm:space-x-2 bg-gray-100 dark:bg-slate-800 rounded-full">
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
