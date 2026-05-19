import React from 'react';

export const Footer: React.FC = () => {
    //TODO fetch footer content from other branch
    return (
        <footer className="bg-gray-800 text-white py-4 text-center">
            <p>&copy; {new Date().getFullYear()} MyPolitics. All rights reserved.</p>
        </footer>

    )
}