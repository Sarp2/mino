export function shortenUuid(uuid: string, maxLength: number): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }

    // Convert to base36 (alphanumeric) for compact representation
    const base36 = Math.abs(hash).toString(36);

    // Pad with leading zeros if needed
    const padded = base36.padStart(maxLength, '0');

    // Truncate if longer than maxLength
    return padded.slice(-maxLength);
}
