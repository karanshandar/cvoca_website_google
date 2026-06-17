export const BASE_URL = 'https://cvoca.org';
export const SITE_NAME = 'CVOCA - CVO Chartered & Cost Accountants Association';
export const DEFAULT_OG_IMAGE = '/images/logo-light-theme.webp';

/** Build an absolute canonical URL from a path, e.g. canonical('/events'). */
export const canonical = (path: string): string => `${BASE_URL}${path}`;
