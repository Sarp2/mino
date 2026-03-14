export const formatUpdatedAt = (updatedAt: string | null) => {
    if (!updatedAt) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(updatedAt));
};
