import { api, HydrateClient } from '@/trpc/server';
import { ProjectsContent } from './_components/projects-content';

export default async function ProjectsPage() {
    void api.project.list.prefetch();

    return (
        <>
            <HydrateClient>
                <ProjectsContent />
            </HydrateClient>
        </>
    );
}
