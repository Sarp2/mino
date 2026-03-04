import { api } from '@/trpc/server';
import { ProjectsList } from './_components/projects-list';

export default async function ProjectsPage() {
    const githubProjects = await api.github.projects();

    return (
        <main className="min-h-screen bg-[#f9f9f9] px-6 pb-16">
            <ProjectsList
                githubName={githubProjects.githubName}
                projects={githubProjects.projects}
            />
        </main>
    );
}
