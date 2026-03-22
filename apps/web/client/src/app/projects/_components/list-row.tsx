import Image from 'next/image';
import { Lock } from 'lucide-react';

import { ActionButton } from './action-button';

interface ListRowIcon {
    type: 'image';
    src: string;
    alt: string;
}

interface ListRowFallbackIcon {
    type: 'icon';
    icon: React.ReactNode;
}

interface ListRowProps {
    icon: ListRowIcon | ListRowFallbackIcon;
    name: string;
    meta?: string;
    isPrivate?: boolean;
    actionLabel: string;
    isCreating: boolean;
    onClick: () => void;
}

export const ListRow = ({
    icon,
    name,
    meta,
    isPrivate,
    actionLabel,
    isCreating,
    onClick,
}: ListRowProps) => (
    <div className="border-input bg-background flex min-h-[64px] items-center justify-between border-b px-4 last:border-b-0">
        <div className="min-w-0">
            <div className="text-foreground flex items-center gap-2 text-base">
                {icon.type === 'image' ? (
                    <Image
                        src={icon.src}
                        alt={icon.alt}
                        width={28}
                        height={28}
                        className="size-7 rounded-full border border-zinc-200 object-cover"
                    />
                ) : (
                    <div className="bg-muted flex size-7 items-center justify-center rounded-full">
                        {icon.icon}
                    </div>
                )}

                <span className="truncate font-normal">{name}</span>

                {isPrivate && (
                    <span className="text-muted-foreground mr-2 inline-flex items-center">
                        <Lock className="size-3.5" />
                    </span>
                )}

                {meta && (
                    <span className="text-muted-foreground text-sm font-normal">
                        · {meta}
                    </span>
                )}
            </div>
        </div>

        <ActionButton
            isCreating={isCreating}
            label={actionLabel}
            onClick={onClick}
        />
    </div>
);
