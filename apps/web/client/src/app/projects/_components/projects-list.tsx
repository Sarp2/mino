'use client';

import { useMemo, useState } from 'react';

import type { ChangeEvent } from 'react';

import { Button } from '@mino/ui/button';
import { Icons } from '@mino/ui/icons';
import { Input } from '@mino/ui/input';

interface Project {
    name: string;
    condition: 'open' | 'closed';
    startedDate: string;
    isPrivate: boolean;
}

interface ProjectsListProps {
    githubName: string;
    projects: Project[];
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US').format(new Date(date));
}

export function ProjectsList({ githubName, projects }: ProjectsListProps) {
    const [search, setSearch] = useState('');

    const filteredProjects = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return projects;
        }

        return projects.filter((project) =>
            project.name.toLowerCase().includes(normalizedSearch),
        );
    }, [projects, search]);

    return (
        <section className="mx-auto mt-48 w-full max-w-[560px]">
            <h1 className="text-[52px] leading-[1.1] font-medium tracking-[-0.03em] text-black">
                Import GitHub repository
            </h1>

            <div className="mt-7 grid grid-cols-[230px_1fr] overflow-hidden rounded-md border border-[#e9e9e9] bg-white">
                <div className="flex h-12 items-center gap-2 border-r border-[#e9e9e9] px-4 text-[15px] text-black">
                    <Icons.Github className="size-4" />
                    <span className="flex-1 truncate">{githubName}</span>
                    <span className="text-[#888]">⌄</span>
                </div>
                <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9b9b9b]">
                        ⌕
                    </span>
                    <Input
                        value={search}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search..."
                        className="h-12 rounded-none border-0 pl-9 text-[15px] shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-md border border-[#e9e9e9] bg-white">
                {filteredProjects.map((project) => (
                    <div
                        key={project.name}
                        className="flex h-16 items-center justify-between border-b border-[#efefef] px-4 last:border-b-0"
                    >
                        <div className="flex items-center gap-3 text-[30px]">
                            <span className="inline-flex size-7 items-center justify-center rounded-full border border-[#dedede] text-[12px] font-semibold text-black">
                                {project.name[0]?.toUpperCase()}
                            </span>

                            <p className="text-[28px] leading-none tracking-[-0.025em] text-black">
                                {project.name}
                                {project.isPrivate ? (
                                    <span className="ml-2 text-[#b0b0b0]">
                                        🔒
                                    </span>
                                ) : null}
                                <span className="text-[#818181]">
                                    {' '}
                                    · {formatDate(project.startedDate)}
                                </span>
                            </p>
                        </div>

                        <Button
                            size="sm"
                            className="h-9 rounded-md bg-[#1d63ff] px-5 text-sm font-medium text-white hover:bg-[#1754dd]"
                        >
                            Import
                        </Button>
                    </div>
                ))}
            </div>
        </section>
    );
}
