import { useEffect, useState } from 'react';

/** Reads key–value pairs from the URL hash fragment (e.g. `#error_code=…`). */
export const useHashParams = () => {
    const [params, setParams] = useState<URLSearchParams | null>(null);

    useEffect(() => {
        const raw = window.location.hash.replace(/^#/, '');
        setParams(new URLSearchParams(raw));
    }, []);

    return params;
};
