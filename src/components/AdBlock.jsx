import React, { useEffect, useRef } from 'react';

const AdBlock = ({ code, className = "" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !code) return;
        
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create a contextual fragment to parse HTML and execute scripts safely
        try {
            const fragment = document.createRange().createContextualFragment(code);
            containerRef.current.appendChild(fragment);
        } catch (error) {
            console.error("Error injecting ad script:", error);
            // Fallback for simple HTML if contextual fragment fails
            containerRef.current.innerHTML = code;
        }
    }, [code]);

    if (!code) return null;

    return <div ref={containerRef} className={`w-full flex justify-center my-6 ${className}`} />;
};

export default AdBlock;
