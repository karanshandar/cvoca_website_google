# WordPress REST API Integration Guide

## Overview
This guide explains how to integrate the WordPress blog hosted at `https://blog.cvoca.org/` directly into the CVOCA website using the WordPress REST API (Option 2).

**Current Status:** Blog page redirects to WordPress site (Option 1)
**Future Goal:** Display WordPress posts natively in React while maintaining site consistency (Option 2)

---

## Why Option 2?

### Benefits
- ✅ Users stay on the main website (better UX)
- ✅ Latest blog posts automatically sync
- ✅ Consistent design with main website
- ✅ Full control over presentation layer
- ✅ SEO-friendly when implemented properly

### Trade-offs
- Requires REST API enabled on WordPress (usually default)
- Need to manage data transformation
- Extra API calls on page load
- Caching strategy needed for performance

---

## Prerequisites

### 1. WordPress REST API Access
The WordPress REST API should be enabled by default on modern WordPress installations. Verify access:

```bash
# Test the API endpoint
curl https://blog.cvoca.org/wp-json/wp/v2/posts

# Should return a JSON array of posts
```

### 2. Required npm Packages
No new packages needed! We'll use the built-in `fetch` API.

### 3. CORS Considerations
WordPress should allow CORS requests from your main domain. If you get CORS errors:
- Install a CORS plugin on WordPress (e.g., "WordPress REST API CORS")
- Or configure NGINX/Apache CORS headers

---

## Data Transformation

### WordPress REST API Response Structure

When you fetch from `https://blog.cvoca.org/wp-json/wp/v2/posts?_embed`, you get:

```json
{
  "id": 123,
  "date": "2024-01-15T10:30:00",
  "date_gmt": "2024-01-15T10:30:00",
  "guid": {"rendered": "https://blog.cvoca.org/?p=123"},
  "title": {"rendered": "Blog Post Title"},
  "content": {"rendered": "<p>Full HTML content...</p>"},
  "excerpt": {"rendered": "<p>Short excerpt...</p>"},
  "author": 1,
  "featured_media": 456,
  "categories": [1],
  "_embedded": {
    "author": [{"id": 1, "name": "Author Name"}],
    "wp:featuredmedia": [{"source_url": "https://blog.cvoca.org/image.jpg"}],
    "wp:term": [
      [{"name": "Technology", "id": 1}]
    ]
  }
}
```

### Required Fields Mapping

Map WordPress data to your `BlogPost` interface:

| Your Field | WordPress Field | Path | Fallback |
|-----------|-----------------|------|----------|
| `id` | `id` | `.id` | N/A |
| `title` | `title.rendered` | `.title.rendered` | "Untitled" |
| `excerpt` | `excerpt.rendered` | `.excerpt.rendered` | "No preview" |
| `date` | `date` | `.date` | Current date |
| `author` | `_embedded.author[0].name` | `._embedded.author[0].name` | "CVOCA" |
| `image` | `_embedded.wp:featuredmedia[0].source_url` | `._embedded['wp:featuredmedia'][0].source_url` | "/default-blog.jpg" |
| `category` | `_embedded.wp:term[0][0].name` | `._embedded['wp:term'][0][0].name` | "General" |
| `link` | `link` | `.link` | N/A (for external links) |

---

## Implementation Steps

### Step 1: Update Blog.tsx - Remove Redirect

Replace the current redirect with data fetching:

```tsx
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWordPressPosts();
    }, []);

    const fetchWordPressPosts = async () => {
        try {
            const response = await fetch(
                'https://blog.cvoca.org/wp-json/wp/v2/posts?per_page=12&_embed'
            );

            if (!response.ok) {
                throw new Error('Failed to fetch blog posts');
            }

            const data = await response.json();
            const transformedPosts = transformWordPressPosts(data);
            setPosts(transformedPosts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching WordPress posts:', err);
            setError('Failed to load blog posts');
            setLoading(false);
        }
    };

    const transformWordPressPosts = (wpPosts: any[]): BlogPost[] => {
        return wpPosts.map(post => ({
            id: post.id,
            title: post.title.rendered,
            excerpt: stripHtml(post.excerpt.rendered),
            date: formatDate(post.date),
            author: post._embedded?.author?.[0]?.name || 'CVOCA',
            image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/default-blog.jpg',
            category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'General',
            link: post.link
        }));
    };

    const stripHtml = (html: string): string => {
        return html.replace(/<[^>]*>/g, '').trim();
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Rest of the component remains the same...
};

export default Blog;
```

### Step 2: Update ArticleCard Component

Add click handler to open WordPress articles:

```tsx
interface ArticleCardProps {
    image: string;
    category: string;
    date: string;
    author: string;
    title: string;
    excerpt: string;
    link: string; // Add this
}

const ArticleCard: React.FC<ArticleCardProps> = ({
    image, category, date, author, title, excerpt, link
}) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline hover:no-underline"
    >
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col cursor-pointer">
            <img className="w-full h-56 object-cover" src={image} alt={title} />
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>{category}</span>
                    <span>{date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 flex-grow">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by {author}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{excerpt}</p>
                <button
                    className="font-semibold text-primary dark:text-primary-light hover:underline text-left mt-auto"
                    onClick={(e) => {
                        e.preventDefault();
                        window.open(link, '_blank');
                    }}
                >
                    Read More →
                </button>
            </div>
        </div>
    </a>
);
```

### Step 3: Handle Loading and Error States

```tsx
return (
    <div className="animate-fadeIn">
        {/* Hero Section */}
        <section className="bg-primary/10 dark:bg-primary/5 pt-32 pb-16 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Blog</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Latest insights and articles from the CVOCA community
                </p>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <section>
                <h2 className="text-3xl font-bold text-center mb-10">Latest Articles</h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg text-center">
                        {error}
                        <p className="text-sm mt-2">
                            <a href="https://blog.cvoca.org/" className="underline">
                                View blog directly
                            </a>
                        </p>
                    </div>
                )}

                {loading && !error && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <ArticleCard
                                key={post.id}
                                image={post.image}
                                category={post.category}
                                date={post.date}
                                author={post.author}
                                title={post.title}
                                excerpt={post.excerpt}
                                link={post.link}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Newsletter/CTA section */}
            <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
                <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-8">
                    Follow us on social media and attend our events to stay updated
                    with the latest news, articles, and insights from the CVOCA community.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <a
                        href="https://blog.cvoca.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    >
                        View Full Blog
                    </a>
                    <a
                        href="/contact"
                        className="px-6 py-3 bg-gray-200 text-text-light dark:bg-gray-700 dark:text-text-dark font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Contact Us
                    </a>
                </div>
            </section>
        </div>
    </div>
);
```

---

## Performance Optimization

### 1. Caching Strategy

Add caching to avoid excessive API calls:

```tsx
const CACHE_KEY = 'cvoca_blog_posts';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCachedPosts = (): { data: BlogPost[], timestamp: number } | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }

    return { data, timestamp };
};

const setCachedPosts = (posts: BlogPost[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: posts,
        timestamp: Date.now()
    }));
};

// In fetchWordPressPosts:
const cached = getCachedPosts();
if (cached) {
    setPosts(cached.data);
    setLoading(false);
    return;
}

// ... fetch from API and cache
```

### 2. Pagination

Load more posts instead of all at once:

```tsx
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMorePosts = async () => {
    try {
        const response = await fetch(
            `https://blog.cvoca.org/wp-json/wp/v2/posts?per_page=12&page=${page + 1}&_embed`
        );
        const newPosts = await response.json();

        if (newPosts.length < 12) setHasMore(false);
        setPosts([...posts, ...transformWordPressPosts(newPosts)]);
        setPage(page + 1);
    } catch (err) {
        console.error('Error loading more posts:', err);
    }
};

// Add button to load more
{hasMore && (
    <div className="text-center mt-8">
        <button
            onClick={loadMorePosts}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg"
        >
            Load More Articles
        </button>
    </div>
)}
```

### 3. Image Optimization

Optimize featured images:

```tsx
const optimizeImageUrl = (url: string): string => {
    // Add WordPress image optimization parameters if using Jetpack or similar
    if (url.includes('blog.cvoca.org')) {
        return `${url}?w=600&h=400&fit=crop`;
    }
    return url;
};

// Use in transformation
image: optimizeImageUrl(post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/default-blog.jpg'),
```

---

## Troubleshooting

### Issue: CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Install a CORS plugin on WordPress
2. Or add this to your fetch request:
```tsx
fetch(url, {
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
})
```

### Issue: Missing Featured Images
**Cause:** Featured images not set in WordPress or embedded not included

**Solution:** Ensure `_embed` parameter is in API URL
```tsx
'https://blog.cvoca.org/wp-json/wp/v2/posts?_embed'
```

### Issue: Slow Loading
**Cause:** Fetching too many posts or large images

**Solution:**
- Reduce `per_page` parameter
- Optimize images in WordPress
- Implement caching (see Performance section)

### Issue: HTML Entities in Excerpt
**Cause:** WordPress returns encoded HTML

**Solution:** Decode HTML entities
```tsx
const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};
```

---

## API Endpoints Reference

### Main Posts Endpoint
```
GET /wp-json/wp/v2/posts
```

**Parameters:**
- `per_page`: Number of posts (default: 10, max: 100)
- `page`: Page number (default: 1)
- `search`: Search query
- `categories`: Category ID(s)
- `order`: 'asc' or 'desc' (default: 'desc')
- `orderby`: 'date', 'title', etc.
- `_embed`: Include embedded resources (authors, featured images, categories)

**Example:**
```
https://blog.cvoca.org/wp-json/wp/v2/posts?per_page=12&page=1&order=desc&_embed
```

### Categories Endpoint
```
GET /wp-json/wp/v2/categories
```

Useful for filtering posts by category.

### Authors Endpoint
```
GET /wp-json/wp/v2/users
```

Get author information.

---

## Update Your Types

Make sure your `BlogPost` interface includes the `link` field:

```tsx
// types/index.ts or types.ts
export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    image: string;
    category: string;
    link: string; // Add this field
}
```

---

## Testing Checklist

- [ ] API calls return valid JSON
- [ ] Posts display correctly with all fields
- [ ] Images load and display properly
- [ ] Links open in new tab
- [ ] Loading state shows while fetching
- [ ] Error handling works correctly
- [ ] Date formatting is consistent
- [ ] Responsive design works on mobile
- [ ] Dark mode styling works
- [ ] Performance is acceptable (< 2s load time)

---

## Migration Steps (When Ready)

1. **Create feature branch:** `git checkout -b feat/wordpress-blog-integration`
2. **Update Blog.tsx** with the code above
3. **Test locally** with hot reload
4. **Test with real WordPress API** from blog.cvoca.org
5. **Verify responsive design** on mobile and tablet
6. **Check dark mode** functionality
7. **Deploy and monitor** for any API issues

---

## Additional Resources

- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/using-the-rest-api/)
- [REST API Guide - Posts](https://developer.wordpress.org/rest-api/reference/posts/)

---

## Contact & Questions

For questions about this implementation:
1. Check the WordPress REST API docs
2. Review WordPress plugin compatibility
3. Test CORS headers with curl
4. Monitor browser console for errors
