/**
 * JSON-LD Schema Generators for SEO
 * These schemas help search engines understand the content and display rich results
 */

// Base URL - update when production domain is confirmed
const BASE_URL = 'https://cvoca.org';

/**
 * Organization Schema - For the main organization info
 * Used globally across all pages
 */
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${BASE_URL}/#organization`,
  "name": "CVO Chartered & Cost Accountants Association",
  "alternateName": "CVOCA",
  "url": BASE_URL,
  "logo": `${BASE_URL}/images/logo-light-theme.webp`,
  "image": `${BASE_URL}/images/logo-light-theme.webp`,
  "description": "Premier professional association for Chartered and Cost Accountants in Mumbai, India since 1973. Providing networking, professional development, and community support.",
  "foundingDate": "1973",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E)",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400014",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 19.0178,
    "longitude": 72.8478
  },
  "telephone": "+91-9167928622",
  "email": "info@cvoca.org",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "10:30",
    "closes": "18:00"
  },
  "sameAs": [
    "https://in.linkedin.com/company/cvoca-association",
    "https://x.com/cvocain",
    "https://www.facebook.com/CVOCAAssociation/",
    "https://www.instagram.com/cvocain/",
    "https://www.youtube.com/@cvocharteredcostaccountant9981"
  ],
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 2400,
    "unitText": "members"
  }
});

/**
 * Website Schema - For site-level information
 */
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CVOCA",
  "alternateName": "CVO Chartered & Cost Accountants Association",
  "url": BASE_URL,
  "description": "Official website of CVOCA - Premier professional association for Chartered and Cost Accountants in Mumbai since 1973."
});

/**
 * LocalBusiness Schema - For Contact page
 */
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CVO Chartered & Cost Accountants Association",
  "image": `${BASE_URL}/images/logo-light-theme.webp`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E)",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400014",
    "addressCountry": "IN"
  },
  "telephone": "+91-9167928622",
  "email": "info@cvoca.org",
  "url": BASE_URL,
  "openingHours": "Mo-Sa 10:30-18:00",
  "priceRange": "$$"
});

/**
 * Event Schema Generator - For individual events
 */
export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  cost: string;
  imageUrl?: string;
  registrationLink?: string;
}

export const getEventSchema = (event: EventData) => {
  const isOnline = event.location.toLowerCase().includes('online') ||
                   event.location.toLowerCase().includes('virtual') ||
                   event.location.toLowerCase().includes('zoom');

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date,
    "location": isOnline ? {
      "@type": "VirtualLocation",
      "url": event.registrationLink || BASE_URL
    } : {
      "@type": "Place",
      "name": event.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      }
    },
    "image": event.imageUrl || `${BASE_URL}/images/logo-light-theme.webp`,
    "organizer": {
      "@type": "Organization",
      "name": "CVOCA",
      "url": BASE_URL
    },
    "offers": {
      "@type": "Offer",
      "price": event.cost === 'Free' || event.cost === 'free' ? "0" : event.cost.replace(/[^0-9]/g, '') || "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": event.registrationLink || `${BASE_URL}/events`
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode"
  };
};

/**
 * Person Schema Generator - For committee members
 */
export interface PersonData {
  name: string;
  role: string;
  email?: string;
  photoUrl?: string;
}

export const getPersonSchema = (person: PersonData) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": person.name,
  "jobTitle": person.role,
  ...(person.email && { "email": person.email }),
  ...(person.photoUrl && { "image": person.photoUrl }),
  "worksFor": {
    "@type": "Organization",
    "name": "CVOCA",
    "url": BASE_URL
  }
});

/**
 * BreadcrumbList Schema Generator - For navigation context
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

/**
 * Article Schema Generator - For blog posts
 */
export interface ArticleData {
  title: string;
  description: string;
  datePublished: string;
  imageUrl?: string;
  author?: string;
  url: string;
}

export const getArticleSchema = (article: ArticleData) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "datePublished": article.datePublished,
  "image": article.imageUrl || `${BASE_URL}/images/logo-light-theme.webp`,
  "author": {
    "@type": "Organization",
    "name": article.author || "CVOCA"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CVOCA",
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/images/logo-light-theme.webp`
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

/**
 * FAQ Schema Generator - For FAQ sections
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export const getFAQSchema = (faqs: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
