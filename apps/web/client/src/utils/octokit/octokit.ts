import { Octokit } from '@octokit/rest';

export const getOctokit = (accessToken: string) => {
    return new Octokit({
        auth: accessToken,
    });
};
