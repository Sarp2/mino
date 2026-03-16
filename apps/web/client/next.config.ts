import './src/env';

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            }
        ]
    }
};

export default config;
