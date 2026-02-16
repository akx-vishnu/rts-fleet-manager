'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Dynamically import LiveMap with SSR disabled to reduce initial bundle
const LiveMap = dynamic(() => import('./live-map'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full w-full bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
            </div>
        </div>
    ),
});

export default function DynamicMap(props: ComponentProps<typeof LiveMap>) {
    return <LiveMap {...props} />;
}
