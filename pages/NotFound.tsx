import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const NotFound: React.FC = () => {
    useSEO({
        title: 'Page Not Found - CVOCA',
        description: 'The page you are looking for does not exist.',
        noIndex: true,
    });

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                The page you are looking for might have been moved or doesn't exist.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
