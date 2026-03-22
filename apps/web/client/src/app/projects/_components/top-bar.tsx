'use client';

import { Search } from 'lucide-react';

import type { ReactNode } from 'react';
import type { SourceType } from '@/types';

import { Icons } from '@mino/ui/icons';
import { Input } from '@mino/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@mino/ui/select';

const SOURCE_OPTIONS = [
    {
        value: 'projects',
        label: 'Projects',
        icon: <Icons.Projects className="size-5" />,
    },
    {
        value: 'github',
        label: 'GitHub',
        icon: <Icons.Github className="size-5" />,
    },
    {
        value: 'templates',
        label: 'Templates',
        icon: <Icons.Template className="size-5" />,
    },
] satisfies {
    value: SourceType;
    label: string;
    icon: ReactNode;
}[];

type TopBarProps = {
    disabled: boolean;
    search: string;
    source: SourceType;
    title: string;
    onSearchChange: (value: string) => void;
    onSourceChange: (value: SourceType) => void;
};

export function TopBar({
    disabled,
    search,
    source,
    title,
    onSearchChange,
    onSourceChange,
}: TopBarProps) {
    return (
        <>
            <h1 className="mb-6 text-3xl leading-tight font-semibold md:text-3xl">
                <span className="text-foreground font-normal tracking-tighter">
                    {title}
                </span>
            </h1>

            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Select
                    disabled={disabled}
                    value={source}
                    onValueChange={onSourceChange}
                >
                    <SelectTrigger className="border-input bg-background text-foreground h-11 w-full justify-between rounded-md border px-4 shadow-none">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                        position="popper"
                        align="start"
                        className="bg-background border-input z-100 w-(--radix-select-trigger-width) p-0 **:data-[slot=select-viewport]:p-0"
                    >
                        {SOURCE_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                textValue={option.label}
                                className="border-input h-11 rounded-none border-b px-4 text-sm font-medium last:border-b-0 **:data-[slot=select-item-indicator]:hidden"
                            >
                                <div className="flex items-center gap-2.5">
                                    {option.icon}
                                    <span className="font-normal">
                                        {option.label}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            onSearchChange(event.target.value);
                        }}
                        placeholder="Search..."
                        className="h-11 rounded-md pl-10 text-sm shadow-none"
                        disabled={disabled}
                    />
                </div>
            </div>
        </>
    );
}
