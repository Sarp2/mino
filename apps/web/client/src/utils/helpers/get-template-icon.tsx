import { Icons } from '@mino/ui/icons';

export const getTemplateIcon = (templateId: string) => {
    if (templateId === 'nextjs') {
        return <Icons.Nextjs className="size-5" />;
    }
    if (templateId === 'vite') {
        return <Icons.Vite className="size-5" />;
    }
    return <Icons.Nuxt className="size-5" />;
};
