import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';

interface ArticleCardProps {
    image: string;
    category: string;
    date: string;
    author: string;
    title: string;
    excerpt: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ image, category, date, author, title, excerpt }) => (
    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <img className="w-full h-56 object-cover" src={image} alt={title} />
        <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>{category}</span>
                <span>{date}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 flex-grow">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by {author}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{excerpt}</p>
            <button className="font-semibold text-primary dark:text-primary-light hover:underline text-left mt-auto">Read More</button>
        </div>
    </div>
);

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('./data/blog.json')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch blog posts", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section className="bg-primary/10 dark:bg-primary/5 pt-32 pb-16 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Blog</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Latest insights and articles from the CVOCA community</p>
                </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                {/* Latest Articles */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-10">Latest Articles</h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
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
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Newsletter/CTA section */}
                <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
                    <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-8">
                        Follow us on social media and attend our events to stay updated with the latest news, articles, and insights from the CVOCA community.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/events" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                            View Events
                        </Link>
                        <Link to="/contact" className="px-6 py-3 bg-gray-200 text-text-light dark:bg-gray-700 dark:text-text-dark font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Blog;