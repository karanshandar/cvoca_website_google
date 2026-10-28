/**
 * Cloudinary Image Optimization Utilities
 * Automatically optimizes Cloudinary images for better performance
 */

/**
 * Checks if a URL is from Cloudinary
 */
function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
}

/**
 * Generates an optimized Cloudinary URL with auto format, quality, and optional resizing
 *
 * @param url - Original image URL (Cloudinary or any other)
 * @param width - Optional width for resizing (e.g., 400, 800, 1200)
 * @returns Optimized URL if Cloudinary, original URL otherwise
 *
 * @example
 * // Without width
 * getOptimizedImageUrl('https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg')
 * // Returns: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/sample.jpg'
 *
 * @example
 * // With width
 * getOptimizedImageUrl('https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg', 400)
 * // Returns: 'https://res.cloudinary.com/demo/image/upload/w_400,f_auto,q_auto/v1234/sample.jpg'
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  // Return original URL if it's not a Cloudinary URL
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  // Check if URL already has transformations
  const hasTransformations = url.includes('/upload/w_') ||
                             url.includes('/upload/f_auto') ||
                             url.includes('/upload/q_auto');

  if (hasTransformations) {
    // Already optimized, return as-is
    return url;
  }

  // Build transformation string
  let transformations = 'f_auto,q_auto';
  if (width && width > 0) {
    transformations = `w_${width},${transformations}`;
  }

  // Inject transformations after '/upload/'
  const optimizedUrl = url.replace(
    '/upload/',
    `/upload/${transformations}/`
  );

  return optimizedUrl;
}

/**
 * Preset configurations for common image sizes
 */
export const ImageSizePresets = {
  /** Team member photos (400x400) */
  TEAM_PHOTO: 400,
  /** Event card images (800px width) */
  EVENT_CARD: 800,
  /** Large detail images (1600px width) */
  LARGE: 1600,
} as const;
