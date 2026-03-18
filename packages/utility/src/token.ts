import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12;

if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
}

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a dot-separated string containing the IV, auth tag, and ciphertext.
 */
export function encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);

    return [
        iv.toString('hex'),
        cipher.getAuthTag().toString('hex'),
        encrypted.toString('hex'),
    ].join('.');
}

/**
 * Decrypts a ciphertext string produced by {@link encrypt}.
 * Throws if the format is invalid or the auth tag verification fails,
 * which indicates tampering or use of the wrong key.
 */
export function decrypt(ciphertext: string): string {
    const [ivHex, tagHex, encryptedHex] = ciphertext.split('.');

    if (!ivHex || !tagHex || !encryptedHex) {
        throw new Error('Invalid ciphertext format');
    }

    const decipher = createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(ivHex, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    return (
        decipher.update(Buffer.from(encryptedHex, 'hex'), undefined, 'utf8') +
        decipher.final('utf8')
    );
}
