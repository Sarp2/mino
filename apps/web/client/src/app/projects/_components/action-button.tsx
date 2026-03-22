'use client';

import { Button } from '@mino/ui/button';
import { Icons } from '@mino/ui/icons';

export function ActionButton({
    isCreating,
    label,
    onClick,
}: {
    isCreating: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            className="h-8 min-w-[78px] rounded-md bg-[#1F6FFF] px-3 text-sm font-normal text-white hover:bg-[#195ee0]"
            disabled={isCreating}
            onClick={onClick}
        >
            {isCreating ? (
                <Icons.LoadingSpinner className="size-4 animate-spin" />
            ) : (
                label
            )}
        </Button>
    );
}
