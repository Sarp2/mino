import type { CodeSandboxProviderOptions } from './providers/codesandbox';
import type { NodeFsProviderOptions } from './providers/nodefs';

import { CodeProvider } from './providers';
import { CodeSandboxProvider } from './providers/codesandbox';
import { NodeFsProvider } from './providers/nodefs';

export interface CreateClientOptions {
    providerOptions: ProviderInstanceOptions;
}

export interface ProviderInstanceOptions {
    codesandbox?: CodeSandboxProviderOptions;
    nodefs?: NodeFsProviderOptions;
}

export const createCodeProviderClient = async (
    codeProvider: CodeProvider,
    { providerOptions }: CreateClientOptions,
) => {
    const provider = newProviderInstance(codeProvider, providerOptions);
    await provider.initialize({});
    return provider;
};

export const getStaticCodeProvider = (
    codeProvider: CodeProvider,
): typeof CodeSandboxProvider | typeof NodeFsProvider => {
    if (codeProvider === CodeProvider.CodeSandbox) {
        return CodeSandboxProvider;
    }

    if (codeProvider === CodeProvider.NodeFs) {
        return NodeFsProvider;
    }
    throw new Error(`Unimplemented code provider: ${codeProvider}`);
};

export const newProviderInstance = (
    codeProvider: CodeProvider,
    providerOptions: ProviderInstanceOptions,
) => {
    if (codeProvider === CodeProvider.CodeSandbox) {
        if (!providerOptions.codesandbox) {
            throw new Error('Codesandbox provider options are required.');
        }
        return new CodeSandboxProvider(providerOptions.codesandbox);
    }

    if (codeProvider === CodeProvider.NodeFs) {
        if (!providerOptions.nodefs) {
            throw new Error('NodeFs provider options are required.');
        }
        return new NodeFsProvider(providerOptions.nodefs);
    }

    throw new Error(`Unimplemented code provider: ${codeProvider}`);
};
