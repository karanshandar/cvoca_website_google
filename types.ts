import React from 'react';

export interface CommitteeMember {
  name: string;
  role: string;
  photoUrl: string;
}

export interface PastPresident {
  srNo?: number;
  name: string;
  term: string;
}

export interface CoreMember {
  name: string;
  nativePlace: string;
}

export interface Committee {
  name: string;
  chairperson?: CoreMember;
  advisors?: CoreMember[];
  convenors?: CoreMember[];
  jointConvenors?: CoreMember[];
  specialInvitees?: CoreMember[];
  subCommittee?: CoreMember[];
}

export interface CvoEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  committee: string;
  tags: string[];
  cost: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// New Data Types for JSON migration

export interface HomeStat {
  value: string;
  label: string;
  delay: string;
}

export interface HomeFeature {
  title: string;
  description: string;
  iconPath: string; // Storing SVG path data string
}

export interface HomeNews {
  badge: string;
  badgeColor: string;
  date: string;
  title: string;
  description: string;
}

export interface HomeData {
  stats: HomeStat[];
  features: HomeFeature[];
  news: HomeNews[];
}

export interface BlogPost {
  id: number;
  image: string;
  category: string;
  date: string;
  author: string;
  title: string;
  excerpt: string;
}

export interface MembershipTier {
  tier: string;
  price: string;
  variant: 'student' | 'professional';
  link: string;
  benefits: string[];
}

export interface MembershipBenefit {
  title: string;
  description: string;
  iconPath: string;
}

export interface MembershipData {
  tiers: MembershipTier[];
  generalBenefits: MembershipBenefit[];
}

export interface OutreachInitiative {
  category: string;
  iconPath: string;
  image: string;
  title: string;
  description: string;
  features: string[];
  stats: { label: string; value: string }[];
  ctaText: string;
}
