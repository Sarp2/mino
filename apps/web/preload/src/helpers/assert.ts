/** Typescript exhaustiveness check - use in switch default cases to ensure all union member are handled */
export function assertNever(n: never): never {
    throw new Error(`Expected \`never\`, found: ${JSON.stringify(n)}`);
}
