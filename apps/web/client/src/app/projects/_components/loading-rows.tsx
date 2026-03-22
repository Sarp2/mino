'use client';

import { Skeleton } from '@mino/ui/skeleton';

export function LoadingRows() {
    return Array.from({ length: 5 }).map((_, index) => (
        <div
            key={index}
            className="border-input flex h-[66px] items-center justify-between border-b px-4 last:border-b-0"
        >
            <div className="flex items-center gap-3">
                <Skeleton className="bg-muted size-8 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="bg-muted h-3 w-44 rounded" />
                    <Skeleton className="bg-muted h-3 w-24 rounded" />
                </div>
            </div>
            <Skeleton className="bg-muted h-9 w-24 rounded-md" />
        </div>
    ));
}
