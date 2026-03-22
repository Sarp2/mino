export const formatUpdatedAt = (updatedAt: string | null) => {
    if (!updatedAt) {
        return '-';
    }

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};
